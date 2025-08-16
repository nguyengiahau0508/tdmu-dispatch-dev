import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkflowActionLog,
  ActionType,
} from './entities/workflow-action-log.entity';
import { CreateWorkflowActionLogInput } from './dto/create-workflow-action-log.input';
import { UpdateWorkflowActionLogInput } from './dto/update-workflow-action-log.input';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class WorkflowActionLogsService {
  constructor(
    @InjectRepository(WorkflowActionLog)
    private readonly repository: Repository<WorkflowActionLog>,
  ) {}

  async create(
    createWorkflowActionLogInput: CreateWorkflowActionLogInput,
    user: User,
  ): Promise<WorkflowActionLog> {
    const log = this.repository.create({
      ...createWorkflowActionLogInput,
      actionByUser: user,
      actionAt: new Date(),
      metadata: createWorkflowActionLogInput.metadata
        ? JSON.parse(createWorkflowActionLogInput.metadata)
        : null,
    });

    return this.repository.save(log);
  }

  async findAll(): Promise<WorkflowActionLog[]> {
    return this.repository.find({
      relations: ['instance', 'step', 'actionByUser'],
      order: { actionAt: 'DESC' },
    });
  }

  async findByInstanceId(instanceId: number): Promise<WorkflowActionLog[]> {
    return this.repository.find({
      where: { instanceId },
      relations: ['step', 'actionByUser'],
      order: { actionAt: 'ASC' },
    });
  }

  async findByUser(userId: number): Promise<WorkflowActionLog[]> {
    return this.repository.find({
      where: { actionByUserId: userId },
      relations: ['instance', 'step'],
      order: { actionAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<WorkflowActionLog> {
    console.log('=== FIND ONE WORKFLOW ACTION LOG ===');
    console.log('Finding log with ID:', id);
    
    const log = await this.repository.findOne({
      where: { id },
      relations: ['instance', 'step', 'actionByUser'],
    });

    if (!log) {
      throw new NotFoundException(
        `Workflow action log with ID ${id} not found`,
      );
    }

    console.log('Found log:', {
      id: log.id,
      instanceId: log.instanceId,
      stepId: log.stepId,
      actionType: log.actionType,
      hasInstance: !!log.instance,
      hasStep: !!log.step,
      hasActionByUser: !!log.actionByUser
    });
    console.log('=== FIND ONE COMPLETE ===');

    return log;
  }

  async update(
    id: number,
    updateWorkflowActionLogInput: UpdateWorkflowActionLogInput,
  ): Promise<WorkflowActionLog> {
    console.log('=== UPDATE WORKFLOW ACTION LOG ===');
    console.log('Update called for ID:', id);
    console.log('Update input:', updateWorkflowActionLogInput);
    
    const log = await this.findOne(id);
    console.log('Found log before update:', {
      id: log.id,
      instanceId: log.instanceId,
      stepId: log.stepId,
      actionType: log.actionType
    });

    // Only allow updating specific fields to prevent instanceId from being nullified
    const allowedFields = ['note', 'metadata'];
    const updateData: any = {};
    
    // Only copy allowed fields
    allowedFields.forEach(field => {
      if (updateWorkflowActionLogInput[field] !== undefined) {
        if (field === 'metadata' && updateWorkflowActionLogInput[field]) {
          updateData[field] = JSON.parse(updateWorkflowActionLogInput[field]);
        } else {
          updateData[field] = updateWorkflowActionLogInput[field];
        }
      }
    });

    console.log('Final update data (only allowed fields):', updateData);
    console.log('Log before update:', {
      id: log.id,
      instanceId: log.instanceId,
      stepId: log.stepId
    });

    // Use update method instead of save to avoid relation issues
    if (Object.keys(updateData).length > 0) {
      await this.repository.update(id, updateData);
    }
    
    // Fetch the updated log
    const updatedLog = await this.findOne(id);
    console.log('Log after update:', {
      id: updatedLog.id,
      instanceId: updatedLog.instanceId,
      stepId: updatedLog.stepId
    });
    console.log('=== UPDATE COMPLETE ===');
    
    return updatedLog;
  }

  async remove(id: number): Promise<boolean> {
    const log = await this.findOne(id);
    await this.repository.remove(log);
    return true;
  }

  async logAction(
    instanceId: number,
    stepId: number,
    actionType: ActionType,
    user: User,
    note?: string,
    metadata?: any,
  ): Promise<WorkflowActionLog> {
    console.log('Creating workflow action log:', {
      instanceId,
      stepId,
      actionType,
      userId: user.id,
      note,
      metadata
    });

    // Validate required fields
    if (!instanceId || instanceId <= 0) {
      throw new Error(`Invalid instanceId: ${instanceId}`);
    }
    if (!stepId || stepId <= 0) {
      throw new Error(`Invalid stepId: ${stepId}`);
    }
    if (!actionType) {
      throw new Error(`Invalid actionType: ${actionType}`);
    }
    if (!user || !user.id) {
      throw new Error(`Invalid user: ${user}`);
    }

    const logData = {
      instanceId,
      stepId,
      actionType,
      actionByUserId: user.id,
      actionAt: new Date(),
      note: note || '',
      metadata: metadata ? JSON.stringify(metadata) : '',
    };

    console.log('Log data to create:', logData);

    const log = this.repository.create(logData);

    console.log('Workflow action log entity created:', {
      id: log.id,
      instanceId: log.instanceId,
      stepId: log.stepId,
      actionType: log.actionType,
      actionByUserId: log.actionByUserId,
      actionAt: log.actionAt,
      note: log.note,
      metadata: log.metadata
    });

    try {
      const savedLog = await this.repository.save(log);
      console.log('Workflow action log saved successfully:', {
        id: savedLog.id,
        instanceId: savedLog.instanceId,
        stepId: savedLog.stepId,
        actionType: savedLog.actionType,
        actionByUserId: savedLog.actionByUserId,
        actionAt: savedLog.actionAt
      });

      return savedLog;
    } catch (error) {
      console.error('Error saving workflow action log:', error);
      console.error('Log data that failed to save:', logData);
      throw error;
    }
  }

  async getWorkflowTimeline(instanceId: number): Promise<WorkflowActionLog[]> {
    return this.repository.find({
      where: { instanceId },
      relations: ['step', 'actionByUser'],
      order: { actionAt: 'ASC' },
    });
  }

  async getRecentActions(limit: number = 10): Promise<WorkflowActionLog[]> {
    return this.repository.find({
      relations: ['instance', 'step', 'actionByUser'],
      order: { actionAt: 'DESC' },
      take: limit,
    });
  }
}
