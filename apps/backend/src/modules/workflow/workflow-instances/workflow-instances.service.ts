import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import {
  WorkflowInstance,
  WorkflowStatus,
} from './entities/workflow-instance.entity';
import { CreateWorkflowInstanceInput } from './dto/create-workflow-instance/create-workflow-instance.input';
import { UpdateWorkflowInstanceInput } from './dto/update-workflow-instance/update-workflow-instance.input';
import { WorkflowActionInput } from './dto/workflow-action/workflow-action.input';
import { WorkflowStepsService } from '../workflow-steps/workflow-steps.service';
import { WorkflowActionLogsService } from '../workflow-action-logs/workflow-action-logs.service';
import { WorkflowTemplatesService } from '../workflow-templates/workflow-templates.service';
import { WorkflowPermissionsService } from '../workflow-permissions/workflow-permissions.service';
import { User } from 'src/modules/users/entities/user.entity';
import { ActionType } from '../workflow-action-logs/entities/workflow-action-log.entity';
import { StepType } from '../workflow-steps/entities/workflow-step.entity';
import { DocumentsService } from 'src/modules/dispatch/documents/documents.service';

@Injectable()
export class WorkflowInstancesService {
  constructor(
    @InjectRepository(WorkflowInstance)
    private readonly repository: Repository<WorkflowInstance>,
    private readonly workflowStepsService: WorkflowStepsService,
    private readonly workflowActionLogsService: WorkflowActionLogsService,
    private readonly workflowTemplatesService: WorkflowTemplatesService,
    @Inject(forwardRef(() => WorkflowPermissionsService))
    private readonly workflowPermissionsService: WorkflowPermissionsService,
    @Inject(forwardRef(() => DocumentsService))
    private readonly documentsService: DocumentsService,
  ) {}

  async create(
    createWorkflowInstanceInput: CreateWorkflowInstanceInput,
    user: User,
  ): Promise<WorkflowInstance> {
    // Validate template exists and is active
    const template = await this.workflowTemplatesService.findOne(
      createWorkflowInstanceInput.templateId,
    );
    if (!template.isActive) {
      throw new BadRequestException('Workflow template is not active');
    }

    // Kiểm tra quyền tạo workflow
    if (!this.workflowPermissionsService.canCreateWorkflow(user, template.id)) {
      throw new BadRequestException('User does not have permission to create this workflow');
    }

    // Get first step (START step)
    const steps = await this.workflowStepsService.findByTemplateId(template.id);
    const startStep = steps.find((step) => step.type === StepType.START);

    if (!startStep) {
      throw new BadRequestException('Workflow template must have a START step');
    }

    // Create instance
    const instance = this.repository.create({
      ...createWorkflowInstanceInput,
      currentStepId: startStep.id,
      currentAssigneeUserId: user.id, // Set current assignee to creator initially
      createdByUserId: user.id,
      status: WorkflowStatus.IN_PROGRESS,
    });

    const savedInstance = await this.repository.save(instance);

    // Log START action
    await this.workflowActionLogsService.logAction(
      savedInstance.id,
      startStep.id,
      ActionType.START,
      user,
      'Workflow instance started',
    );

    // Load relations and return
    const instanceWithRelations = await this.repository.findOne({
      where: { id: savedInstance.id },
      relations: [
        'template',
        'currentStep',
        'createdByUser',
        'logs',
        'logs.actionByUser',
      ],
    });

    if (!instanceWithRelations) {
      throw new NotFoundException(
        `Workflow instance with ID ${savedInstance.id} not found after creation`,
      );
    }

    return instanceWithRelations;
  }

  async findAll(): Promise<WorkflowInstance[]> {
    return this.repository.find({
      relations: [
        'template', 
        'currentStep', 
        'createdByUser', 
        'currentAssigneeUser',
        'document',
        'document.documentCategory',
        'document.createdByUser',
        'logs', 
        'logs.actionByUser'
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<WorkflowInstance> {
    console.log('Finding workflow instance:', id);
    
    try {
      // First, load the instance without relations to ensure basic data integrity
      const basicInstance = await this.repository.findOne({
        where: { id },
      });

      if (!basicInstance) {
        throw new NotFoundException(`Workflow instance with ID ${id} not found`);
      }

      console.log('Basic instance found:', {
        id: basicInstance.id,
        currentStepId: basicInstance.currentStepId,
        status: basicInstance.status
      });

      // Then load with relations separately to avoid cascade issues
      const instance = await this.repository.findOne({
        where: { id },
        relations: [
          'template',
          'currentStep',
          'createdByUser',
        ],
      });

      if (!instance) {
        throw new NotFoundException(`Workflow instance with ID ${id} not found`);
      }

      // Load logs separately to avoid relation cascade issues
      const logs = await this.workflowActionLogsService.findByInstanceId(id);
      
      // Validate logs to ensure instanceId is not null
      const validLogs = logs.filter(log => {
        if (!log.instanceId) {
          console.error('Found log with null instanceId:', log);
          return false;
        }
        return true;
      });

      // Assign logs to instance
      instance.logs = validLogs;

      console.log('Found workflow instance:', {
        id: instance.id,
        logsCount: instance.logs?.length,
        logs: instance.logs?.map(log => ({
          id: log.id,
          instanceId: log.instanceId,
          stepId: log.stepId,
          actionType: log.actionType
        }))
      });

      return instance;
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error;
    }
  }

  async findByUser(userId: number): Promise<WorkflowInstance[]> {
    return this.repository.find({
      where: { createdByUserId: userId },
      relations: ['template', 'currentStep', 'createdByUser', 'logs', 'logs.actionByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCurrentStepAssignee(
    assignedRole: string,
  ): Promise<WorkflowInstance[]> {
    return this.repository
      .createQueryBuilder('instance')
      .leftJoinAndSelect('instance.template', 'template')
      .leftJoinAndSelect('instance.currentStep', 'currentStep')
      .leftJoinAndSelect('instance.createdByUser', 'createdByUser')
      .leftJoinAndSelect('instance.logs', 'logs')
      .leftJoinAndSelect('logs.actionByUser', 'actionByUser')
      .where('currentStep.assignedRole = :assignedRole', { assignedRole })
      .andWhere('instance.status = :status', {
        status: WorkflowStatus.IN_PROGRESS,
      })
      .orderBy('instance.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Lấy workflow instances theo người đang được phân công xử lý
   */
  async findByCurrentAssigneeUserId(
    currentAssigneeUserId: number,
  ): Promise<WorkflowInstance[]> {
    return this.repository
      .createQueryBuilder('instance')
      .leftJoinAndSelect('instance.template', 'template')
      .leftJoinAndSelect('instance.currentStep', 'currentStep')
      .leftJoinAndSelect('instance.createdByUser', 'createdByUser')
      .leftJoinAndSelect('instance.currentAssigneeUser', 'currentAssigneeUser')
      .leftJoinAndSelect('instance.logs', 'logs')
      .leftJoinAndSelect('logs.actionByUser', 'actionByUser')
      .where('instance.currentAssigneeUserId = :currentAssigneeUserId', { currentAssigneeUserId })
      .andWhere('instance.status = :status', {
        status: WorkflowStatus.IN_PROGRESS,
      })
      .orderBy('instance.createdAt', 'DESC')
      .getMany();
  }

  async findByDocumentId(documentId: number): Promise<WorkflowInstance[]> {
    return this.repository.find({
      where: { documentId },
      relations: ['template', 'currentStep', 'createdByUser', 'currentAssigneeUser', 'logs', 'logs.actionByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: number,
    updateWorkflowInstanceInput: UpdateWorkflowInstanceInput,
  ): Promise<WorkflowInstance> {
    const instance = await this.findOne(id);

    Object.assign(instance, updateWorkflowInstanceInput);
    return this.repository.save(instance);
  }

  async remove(id: number): Promise<boolean> {
    const instance = await this.findOne(id);
    await this.repository.remove(instance);
    return true;
  }

  async executeAction(
    actionInput: WorkflowActionInput,
    user: User,
  ): Promise<WorkflowInstance> {
    console.log('=== EXECUTE WORKFLOW ACTION START ===');
    console.log('Executing workflow action:', {
      instanceId: actionInput.instanceId,
      stepId: actionInput.stepId,
      actionType: actionInput.actionType,
      userId: user.id
    });

    console.log('Finding workflow instance...');
    const instance = await this.findOne(actionInput.instanceId);
    console.log('Finding current step...');
    const currentStep = await this.workflowStepsService.findOne(
      actionInput.stepId,
    );

    console.log('Checking permissions...');
    // Validate user can perform action on this step using permissions service
    if (!this.workflowPermissionsService.canPerformAction(user, currentStep, actionInput.actionType)) {
      throw new BadRequestException(
        'User does not have permission to perform this action',
      );
    }

    console.log('Permissions check passed');

    // Log the action
    console.log('Logging the action...');
    await this.workflowActionLogsService.logAction(
      actionInput.instanceId,
      actionInput.stepId,
      actionInput.actionType,
      user,
      actionInput.note,
      actionInput.metadata,
    );
    console.log('Action logged successfully');

    // Process the action
    console.log('Processing the action...');
    let result: WorkflowInstance;
    switch (actionInput.actionType) {
      case ActionType.APPROVE:
        console.log('Handling APPROVE action...');
        result = await this.handleApproveAction(instance, currentStep, user);
        break;
      case ActionType.REJECT:
        console.log('Handling REJECT action...');
        result = await this.handleRejectAction(instance);
        break;
      case ActionType.TRANSFER:
        console.log('Handling TRANSFER action...');
        result = await this.handleTransferAction(instance, currentStep, actionInput, user);
        break;
      case ActionType.CANCEL:
        console.log('Handling CANCEL action...');
        result = await this.handleCancelAction(instance);
        break;
      case ActionType.COMPLETE:
        console.log('Handling COMPLETE action...');
        result = await this.handleCompleteAction(instance);
        break;
      default:
        throw new BadRequestException('Invalid action type');
    }

    console.log('=== EXECUTE WORKFLOW ACTION COMPLETE ===');
    return result;
  }

  private async handleApproveAction(
    instance: WorkflowInstance,
    currentStep: any,
    user: User,
  ): Promise<WorkflowInstance> {
    console.log('Handling approve action for instance:', instance.id);
    
    // Find next step
    const nextStep = await this.workflowStepsService.findNextStep(
      currentStep.id,
    );

    console.log('Next step found:', nextStep?.id || 'No next step');

    if (nextStep) {
      // Move to next step
      console.log('Moving to next step:', nextStep.id);
      console.log('Instance before update:', {
        id: instance.id,
        currentStepId: instance.currentStepId,
        logsCount: instance.logs?.length
      });
      
      // Update only the necessary fields to avoid relation issues
      const updateData = {
        currentStepId: nextStep.id,
        currentAssigneeUserId: user.id, // Set current assignee to the user who approved
        updatedAt: new Date()
      };
      
      console.log('About to save instance with new step...');
      try {
        // Use update instead of save to avoid relation loading issues
        await this.repository.update(instance.id, updateData);
        console.log('Instance updated with new step successfully');
        
        // Cập nhật trạng thái văn bản thành PROCESSING
        await this.documentsService.updateDocumentStatusFromWorkflow(instance.documentId, 'IN_PROGRESS');
      } catch (error) {
        console.error('Error updating instance:', error);
        throw error;
      }
    } else {
      // No next step, complete workflow
      console.log('Completing workflow');
      console.log('Instance before completion:', {
        id: instance.id,
        currentStepId: instance.currentStepId,
        status: instance.status,
        logsCount: instance.logs?.length
      });
      
      const updateData = {
        status: WorkflowStatus.COMPLETED,
        currentStepId: undefined, // Use undefined instead of null
        updatedAt: new Date()
      };
      
      console.log('About to save instance as completed...');
      try {
        // Use update instead of save to avoid relation loading issues
        await this.repository.update(instance.id, updateData);
        console.log('Instance updated as completed successfully');
        
        // Cập nhật trạng thái văn bản thành APPROVED
        await this.documentsService.updateDocumentStatusFromWorkflow(instance.documentId, 'COMPLETED');
      } catch (error) {
        console.error('Error updating instance as completed:', error);
        throw error;
      }
    }

    console.log('About to return updated instance...');
    try {
      // Load fresh instance with relations after update
      const updatedInstance = await this.findOne(instance.id);
      console.log('Successfully returned updated instance');
      return updatedInstance;
    } catch (error) {
      console.error('Error returning updated instance:', error);
      throw error;
    }
  }

  private async handleRejectAction(
    instance: WorkflowInstance,
  ): Promise<WorkflowInstance> {
    console.log('Handling reject action for instance:', instance.id);
    
    const updateData = {
      status: WorkflowStatus.REJECTED,
      updatedAt: new Date()
    };
    
    try {
      await this.repository.update(instance.id, updateData);
      console.log('Instance rejected successfully');
      
      // Cập nhật trạng thái văn bản thành REJECTED
      await this.documentsService.updateDocumentStatusFromWorkflow(instance.documentId, 'REJECTED');
      
      return this.findOne(instance.id);
    } catch (error) {
      console.error('Error rejecting instance:', error);
      throw error;
    }
  }

  private async handleTransferAction(
    instance: WorkflowInstance,
    currentStep: any,
    actionInput: WorkflowActionInput,
    user: User,
  ): Promise<WorkflowInstance> {
    // For transfer, we might want to move to a specific step
    // For now, just move to next step like approve
    return this.handleApproveAction(instance, currentStep, user);
  }

  private async handleCancelAction(
    instance: WorkflowInstance,
  ): Promise<WorkflowInstance> {
    console.log('Handling cancel action for instance:', instance.id);
    
    const updateData = {
      status: WorkflowStatus.CANCELLED,
      updatedAt: new Date()
    };
    
    try {
      await this.repository.update(instance.id, updateData);
      console.log('Instance cancelled successfully');
      
      // Cập nhật trạng thái văn bản thành CANCELLED
      await this.documentsService.updateDocumentStatusFromWorkflow(instance.documentId, 'CANCELLED');
      
      return this.findOne(instance.id);
    } catch (error) {
      console.error('Error cancelling instance:', error);
      throw error;
    }
  }

  private async handleCompleteAction(
    instance: WorkflowInstance,
  ): Promise<WorkflowInstance> {
    console.log('Handling complete action for instance:', instance.id);
    
    const updateData = {
      status: WorkflowStatus.COMPLETED,
      currentStepId: undefined, // Use undefined instead of null
      updatedAt: new Date()
    };
    
    try {
      await this.repository.update(instance.id, updateData);
      console.log('Instance completed successfully');
      return this.findOne(instance.id);
    } catch (error) {
      console.error('Error completing instance:', error);
      throw error;
    }
  }

  async getWorkflowHistory(instanceId: number): Promise<WorkflowInstance> {
    return this.findOne(instanceId);
  }

  async getPendingWorkflows(assignedRole: string): Promise<WorkflowInstance[]> {
    return this.findByCurrentStepAssignee(assignedRole);
  }

  async getMyPendingWorkflows(user: User): Promise<WorkflowInstance[]> {
    const allInstances = await this.findAll();
    return this.workflowPermissionsService.getActionableWorkflows(user, allInstances);
  }

  async getAvailableActions(instanceId: number, user: User): Promise<ActionType[]> {
    const instance = await this.findOne(instanceId);
    if (!instance.currentStep) {
      return [];
    }
    
    return this.workflowPermissionsService.getAvailableActions(instance.currentStep);
  }

  /**
   * Cập nhật currentStepId của workflow instance
   */
  async updateCurrentStep(instanceId: number, newStepId: number): Promise<WorkflowInstance> {
    console.log(`Updating workflow instance ${instanceId} to step ${newStepId}`);
    
    const updateData = {
      currentStepId: newStepId,
      updatedAt: new Date()
    };
    
    try {
      await this.repository.update(instanceId, updateData);
      console.log(`Workflow instance ${instanceId} updated to step ${newStepId} successfully`);
      
      return this.findOne(instanceId);
    } catch (error) {
      console.error(`Error updating workflow instance ${instanceId} to step ${newStepId}:`, error);
      throw error;
    }
  }

  /**
   * Cập nhật currentStepId và currentAssigneeUserId của workflow instance
   */
  async updateCurrentStepAndAssignee(
    instanceId: number, 
    newStepId: number, 
    newAssigneeUserId: number
  ): Promise<WorkflowInstance> {
    console.log(`Updating workflow instance ${instanceId} to step ${newStepId} with assignee ${newAssigneeUserId}`);
    
    const updateData = {
      currentStepId: newStepId,
      currentAssigneeUserId: newAssigneeUserId,
      updatedAt: new Date()
    };
    
    try {
      await this.repository.update(instanceId, updateData);
      console.log(`Workflow instance ${instanceId} updated to step ${newStepId} with assignee ${newAssigneeUserId} successfully`);
      
      return this.findOne(instanceId);
    } catch (error) {
      console.error(`Error updating workflow instance ${instanceId} to step ${newStepId} with assignee ${newAssigneeUserId}:`, error);
      throw error;
    }
  }
}
