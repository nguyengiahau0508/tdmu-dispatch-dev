import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import {
  WorkflowStep,
  StepType,
  StepStatus,
} from './entities/workflow-step.entity';
import { CreateWorkflowStepInput } from './dto/create-workflow-step.input';
import { UpdateWorkflowStepInput } from './dto/update-workflow-step.input';
import { GetWorkflowStepPaginatedInput } from './dto/get-workflow-step-paginated/get-workflow-step-paginated.input';
import { WorkflowStepPageDto } from 'src/common/shared/pagination/page.dto';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';

@Injectable()
export class WorkflowStepsService {
  constructor(
    @InjectRepository(WorkflowStep)
    private readonly repository: Repository<WorkflowStep>,
  ) {}

  async create(
    createWorkflowStepInput: CreateWorkflowStepInput,
  ): Promise<WorkflowStep> {
    const step = this.repository.create(createWorkflowStepInput);

    // Set order number if not provided
    if (!step.orderNumber) {
      const existingSteps = await this.findByTemplateId(step.templateId);
      step.orderNumber = existingSteps.length + 1;
    }

    const savedStep = await this.repository.save(step);

    // Load template relation after save
    const stepWithRelations = await this.repository.findOne({
      where: { id: savedStep.id },
      relations: ['template', 'actionLogs'],
    });

    if (!stepWithRelations) {
      throw new NotFoundException(
        `Workflow step with ID ${savedStep.id} not found after creation`,
      );
    }

    return stepWithRelations;
  }

  async findPaginated(
    input: GetWorkflowStepPaginatedInput,
  ): Promise<WorkflowStepPageDto> {
    const { search, templateId, type, order, page = 1, take = 10 } = input;
    const skip = (page - 1) * take;

    const where: FindOptionsWhere<WorkflowStep>[] = [];

    if (search) {
      where.push(
        { id: Number(search) || undefined },
        { name: ILike(`%${search}%`) },
        { description: ILike(`%${search}%`) },
      );
    }

    if (templateId) {
      where.push({ templateId });
    }

    if (type) {
      where.push({ type: type as StepType });
    }

    const [data, itemCount] = await this.repository.findAndCount({
      where: where.length > 0 ? where : undefined,
      order: { orderNumber: order || 'ASC' },
      skip,
      take,
      relations: ['template', 'actionLogs'],
    });

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: { page, take, skip },
      itemCount,
    });
    return new WorkflowStepPageDto(data, pageMetaDto);
  }

  async findAll(): Promise<WorkflowStep[]> {
    return this.repository.find({
      relations: ['template'],
      order: { orderNumber: 'ASC' },
    });
  }

  async findOne(id: number): Promise<WorkflowStep> {
    const step = await this.repository.findOne({
      where: { id },
      relations: ['template', 'actionLogs', 'actionLogs.actionByUser'],
    });

    if (!step) {
      throw new NotFoundException(`Workflow step with ID ${id} not found`);
    }

    return step;
  }

  async findByTemplateId(templateId: number): Promise<WorkflowStep[]> {
    return this.repository.find({
      where: { templateId, isActive: true },
      order: { orderNumber: 'ASC' },
    });
  }

  async findByTemplateIdIncludeInactive(templateId: number): Promise<WorkflowStep[]> {
    return this.repository.find({
      where: { templateId },
      order: { orderNumber: 'ASC' },
    });
  }

  async update(
    id: number,
    updateWorkflowStepInput: UpdateWorkflowStepInput,
  ): Promise<WorkflowStep> {
    const step = await this.findOne(id);

    Object.assign(step, updateWorkflowStepInput);
    return this.repository.save(step);
  }

  async remove(id: number): Promise<boolean> {
    const step = await this.findOne(id);

    // Soft delete by setting isActive to false
    step.isActive = false;
    await this.repository.save(step);

    // Reorder remaining steps
    await this.reorderSteps(step.templateId);

    return true;
  }

  async findNextStep(currentStepId: number): Promise<WorkflowStep | null> {
    const currentStep = await this.findOne(currentStepId);

    const nextStep = await this.repository.findOne({
      where: {
        templateId: currentStep.templateId,
        orderNumber: currentStep.orderNumber + 1,
        isActive: true,
      },
    });

    return nextStep;
  }

  async reorderSteps(templateId: number): Promise<void> {
    const steps = await this.findByTemplateId(templateId);

    for (let i = 0; i < steps.length; i++) {
      steps[i].orderNumber = i + 1;
      await this.repository.save(steps[i]);
    }
  }

  async moveStep(stepId: number, newOrder: number): Promise<WorkflowStep[]> {
    const step = await this.findOne(stepId);
    const steps = await this.findByTemplateId(step.templateId);

    // Remove step from current position
    steps.splice(step.orderNumber - 1, 1);

    // Insert at new position
    steps.splice(newOrder - 1, 0, step);

    // Update order numbers
    for (let i = 0; i < steps.length; i++) {
      steps[i].orderNumber = i + 1;
      await this.repository.save(steps[i]);
    }

    return steps;
  }

  async duplicateStep(stepId: number): Promise<WorkflowStep> {
    const originalStep = await this.findOne(stepId);

    const duplicatedStep = this.repository.create({
      ...originalStep,
      id: undefined, // Remove ID to create new record
      name: `${originalStep.name} (Copy)`,
      orderNumber: originalStep.orderNumber + 1,
    });

    const savedStep = await this.repository.save(duplicatedStep);

    // Reorder steps after duplication
    await this.reorderSteps(originalStep.templateId);

    return savedStep;
  }

  async getStepTypes(): Promise<{ value: string; label: string }[]> {
    return Object.values(StepType).map((type) => ({
      value: type,
      label: this.getStepTypeLabel(type),
    }));
  }

  getStepTypeLabel(type: StepType): string {
    const labels = {
      [StepType.START]: 'Bắt đầu',
      [StepType.APPROVAL]: 'Phê duyệt',
      [StepType.TRANSFER]: 'Chuyển tiếp',
      [StepType.END]: 'Kết thúc',
    };
    return labels[type] || type;
  }

  async getRoles(): Promise<{ value: string; label: string }[]> {
    return [
      { value: 'SYSTEM_ADMIN', label: 'Quản trị viên hệ thống' },
      { value: 'UNIVERSITY_LEADER', label: 'Lãnh đạo cấp cao' },
      { value: 'DEPARTMENT_HEAD', label: 'Trưởng đơn vị' },
      { value: 'DEPARTMENT_STAFF', label: 'Chuyên viên/Nhân viên' },
      { value: 'CLERK', label: 'Văn thư' },
      { value: 'DEGREE_MANAGER', label: 'Quản lý văn bằng' },
      { value: 'BASIC_USER', label: 'Người dùng cơ bản' },
    ];
  }
}
