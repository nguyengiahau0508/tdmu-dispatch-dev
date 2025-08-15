import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowStep } from './entities/workflow-step.entity';
import { CreateWorkflowStepInput } from './dto/create-workflow-step.input';
import { UpdateWorkflowStepInput } from './dto/update-workflow-step.input';

@Injectable()
export class WorkflowStepsService {
  constructor(
    @InjectRepository(WorkflowStep) private readonly repository: Repository<WorkflowStep>
  ) {}

  async create(createWorkflowStepInput: CreateWorkflowStepInput): Promise<WorkflowStep> {
    const step = this.repository.create(createWorkflowStepInput);
    return this.repository.save(step);
  }

  async findAll(): Promise<WorkflowStep[]> {
    return this.repository.find({
      relations: ['template'],
      where: { isActive: true },
      order: { orderNumber: 'ASC' }
    });
  }

  async findByTemplateId(templateId: number): Promise<WorkflowStep[]> {
    return this.repository.find({
      where: { templateId, isActive: true },
      order: { orderNumber: 'ASC' }
    });
  }

  async findOne(id: number): Promise<WorkflowStep> {
    const step = await this.repository.findOne({
      where: { id },
      relations: ['template']
    });

    if (!step) {
      throw new NotFoundException(`Workflow step with ID ${id} not found`);
    }

    return step;
  }

  async update(id: number, updateWorkflowStepInput: UpdateWorkflowStepInput): Promise<WorkflowStep> {
    const step = await this.findOne(id);
    
    Object.assign(step, updateWorkflowStepInput);
    return this.repository.save(step);
  }

  async remove(id: number): Promise<boolean> {
    const step = await this.findOne(id);
    
    // Soft delete by setting isActive to false
    step.isActive = false;
    await this.repository.save(step);
    
    return true;
  }

  async findNextStep(currentStepId: number): Promise<WorkflowStep | null> {
    const currentStep = await this.findOne(currentStepId);
    
    if (!currentStep.nextStepId) {
      return null;
    }

    return this.findOne(currentStep.nextStepId);
  }

  async reorderSteps(templateId: number, stepIds: number[]): Promise<WorkflowStep[]> {
    const steps = await this.repository.find({
      where: { templateId },
      order: { orderNumber: 'ASC' }
    });

    // Update order numbers and nextStepId
    for (let i = 0; i < stepIds.length; i++) {
      const step = steps.find(s => s.id === stepIds[i]);
      if (step) {
        step.orderNumber = i + 1;
        step.nextStepId = i < stepIds.length - 1 ? stepIds[i + 1] : undefined;
        await this.repository.save(step);
      }
    }

    return this.repository.find({
      where: { templateId },
      order: { orderNumber: 'ASC' }
    });
  }
}
