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
    const log = await this.repository.findOne({
      where: { id },
      relations: ['instance', 'step', 'actionByUser'],
    });

    if (!log) {
      throw new NotFoundException(
        `Workflow action log with ID ${id} not found`,
      );
    }

    return log;
  }

  async update(
    id: number,
    updateWorkflowActionLogInput: UpdateWorkflowActionLogInput,
  ): Promise<WorkflowActionLog> {
    const log = await this.findOne(id);

    if (updateWorkflowActionLogInput.metadata) {
      updateWorkflowActionLogInput.metadata = JSON.parse(
        updateWorkflowActionLogInput.metadata,
      );
    }

    Object.assign(log, updateWorkflowActionLogInput);
    return this.repository.save(log);
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
    const log = this.repository.create({
      instanceId,
      stepId,
      actionType,
      actionByUser: user,
      actionAt: new Date(),
      note,
      metadata,
    });

    return this.repository.save(log);
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
