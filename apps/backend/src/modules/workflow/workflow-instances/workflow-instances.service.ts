import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
import { User } from 'src/modules/users/entities/user.entity';
import { ActionType } from '../workflow-action-logs/entities/workflow-action-log.entity';
import { StepType } from '../workflow-steps/entities/workflow-step.entity';

@Injectable()
export class WorkflowInstancesService {
  constructor(
    @InjectRepository(WorkflowInstance)
    private readonly repository: Repository<WorkflowInstance>,
    private readonly workflowStepsService: WorkflowStepsService,
    private readonly workflowActionLogsService: WorkflowActionLogsService,
    private readonly workflowTemplatesService: WorkflowTemplatesService,
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
      relations: ['template', 'currentStep', 'createdByUser', 'logs'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<WorkflowInstance> {
    const instance = await this.repository.findOne({
      where: { id },
      relations: [
        'template',
        'currentStep',
        'createdByUser',
        'logs',
        'logs.actionByUser',
        'logs.step',
      ],
    });

    if (!instance) {
      throw new NotFoundException(`Workflow instance with ID ${id} not found`);
    }

    return instance;
  }

  async findByUser(userId: number): Promise<WorkflowInstance[]> {
    return this.repository.find({
      where: { createdByUserId: userId },
      relations: ['template', 'currentStep', 'createdByUser', 'logs'],
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
      .where('currentStep.assignedRole = :assignedRole', { assignedRole })
      .andWhere('instance.status = :status', {
        status: WorkflowStatus.IN_PROGRESS,
      })
      .orderBy('instance.createdAt', 'DESC')
      .getMany();
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
    const instance = await this.findOne(actionInput.instanceId);
    const currentStep = await this.workflowStepsService.findOne(
      actionInput.stepId,
    );

    // Validate user can perform action on this step
    if (!user.roles.includes(currentStep.assignedRole as any)) {
      throw new BadRequestException(
        'User does not have permission to perform this action',
      );
    }

    // Log the action
    await this.workflowActionLogsService.logAction(
      actionInput.instanceId,
      actionInput.stepId,
      actionInput.actionType,
      user,
      actionInput.note,
      actionInput.metadata,
    );

    // Process the action
    switch (actionInput.actionType) {
      case ActionType.APPROVE:
        return this.handleApproveAction(instance, currentStep);
      case ActionType.REJECT:
        return this.handleRejectAction(instance);
      case ActionType.TRANSFER:
        return this.handleTransferAction(instance, currentStep, actionInput);
      case ActionType.CANCEL:
        return this.handleCancelAction(instance);
      case ActionType.COMPLETE:
        return this.handleCompleteAction(instance);
      default:
        throw new BadRequestException('Invalid action type');
    }
  }

  private async handleApproveAction(
    instance: WorkflowInstance,
    currentStep: any,
  ): Promise<WorkflowInstance> {
    // Find next step
    const nextStep = await this.workflowStepsService.findNextStep(
      currentStep.id,
    );

    if (nextStep) {
      // Move to next step
      instance.currentStepId = nextStep.id;
      await this.repository.save(instance);
    } else {
      // No next step, complete workflow
      instance.status = WorkflowStatus.COMPLETED;
      instance.currentStepId = 0;
      await this.repository.save(instance);
    }

    return this.findOne(instance.id);
  }

  private async handleRejectAction(
    instance: WorkflowInstance,
  ): Promise<WorkflowInstance> {
    instance.status = WorkflowStatus.REJECTED;
    await this.repository.save(instance);
    return this.findOne(instance.id);
  }

  private async handleTransferAction(
    instance: WorkflowInstance,
    currentStep: any,
    actionInput: WorkflowActionInput,
  ): Promise<WorkflowInstance> {
    // For transfer, we might want to move to a specific step
    // For now, just move to next step like approve
    return this.handleApproveAction(instance, currentStep);
  }

  private async handleCancelAction(
    instance: WorkflowInstance,
  ): Promise<WorkflowInstance> {
    instance.status = WorkflowStatus.CANCELLED;
    await this.repository.save(instance);
    return this.findOne(instance.id);
  }

  private async handleCompleteAction(
    instance: WorkflowInstance,
  ): Promise<WorkflowInstance> {
    instance.status = WorkflowStatus.COMPLETED;
    instance.currentStepId = 0;
    await this.repository.save(instance);
    return this.findOne(instance.id);
  }

  async getWorkflowHistory(instanceId: number): Promise<WorkflowInstance> {
    return this.findOne(instanceId);
  }

  async getPendingWorkflows(assignedRole: string): Promise<WorkflowInstance[]> {
    return this.findByCurrentStepAssignee(assignedRole);
  }
}
