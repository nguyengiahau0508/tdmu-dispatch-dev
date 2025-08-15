import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { WorkflowInstance, WorkflowStatus } from './entities/workflow-instance.entity';
import { CreateWorkflowInstanceInput } from './dto/create-workflow-instance.input';
import { UpdateWorkflowInstanceInput } from './dto/update-workflow-instance.input';
import { User } from 'src/modules/users/entities/user.entity';
import { WorkflowTemplatesService } from '../workflow-templates/workflow-templates.service';
import { WorkflowStepsService } from '../workflow-steps/workflow-steps.service';
import { WorkflowInstancePageDto } from 'src/common/shared/pagination/page.dto';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';
import { GetWorkflowInstancePaginatedInput } from './dto/get-workflow-instance-paginated/get-workflow-instance-paginated.input';

@Injectable()
export class WorkflowInstancesService {
  constructor(
    @InjectRepository(WorkflowInstance) private readonly repository: Repository<WorkflowInstance>,
    private readonly workflowTemplatesService: WorkflowTemplatesService,
    private readonly workflowStepsService: WorkflowStepsService
  ) {}

  async create(createWorkflowInstanceInput: CreateWorkflowInstanceInput, user: User): Promise<WorkflowInstance> {
    // Validate template exists
    const template = await this.workflowTemplatesService.findOne(createWorkflowInstanceInput.templateId);

    // Get first step of the template
    const steps = await this.workflowStepsService.findByTemplateId(template.id);
    if (steps.length === 0) {
      throw new Error('Template has no steps defined');
    }

    const firstStep = steps[0];

    const instance = this.repository.create({
      ...createWorkflowInstanceInput,
      currentStepId: firstStep.id,
      createdByUser: user,
      status: WorkflowStatus.IN_PROGRESS
    });

    return this.repository.save(instance);
  }

  async findPaginated(input: GetWorkflowInstancePaginatedInput): Promise<WorkflowInstancePageDto> {
    const { search, status, createdByUserId, order, skip, take } = input;

    const where: FindOptionsWhere<WorkflowInstance>[] = [];

    if (search) {
      where.push(
        { id: Number(search) || undefined },
        { notes: ILike(`%${search}%`) },
      );
    }

    if (status) {
      where.push({ status });
    }

    if (createdByUserId) {
      where.push({ createdByUserId });
    }

    const [data, itemCount] = await this.repository.findAndCount({
      where: where.length > 0 ? where : undefined,
      order: { id: order },
      skip,
      take,
      relations: ['template', 'currentStep', 'createdByUser']
    });

    const pageMetaDto = new PageMetaDto({ pageOptionsDto: input, itemCount });
    return new WorkflowInstancePageDto(data, pageMetaDto);
  }

  async findAll(): Promise<WorkflowInstance[]> {
    return this.repository.find({
      relations: ['template', 'currentStep', 'createdByUser']
    });
  }

  async findOne(id: number): Promise<WorkflowInstance> {
    const instance = await this.repository.findOne({
      where: { id },
      relations: ['template', 'currentStep', 'createdByUser']
    });

    if (!instance) {
      throw new NotFoundException(`Workflow instance with ID ${id} not found`);
    }

    return instance;
  }

  async update(id: number, updateWorkflowInstanceInput: UpdateWorkflowInstanceInput): Promise<WorkflowInstance> {
    const instance = await this.findOne(id);

    Object.assign(instance, updateWorkflowInstanceInput);
    return this.repository.save(instance);
  }

  async remove(id: number): Promise<boolean> {
    const instance = await this.findOne(id);
    await this.repository.remove(instance);
    return true;
  }

  async advanceToNextStep(instanceId: number): Promise<WorkflowInstance> {
    const instance = await this.findOne(instanceId);

    if (instance.status !== WorkflowStatus.IN_PROGRESS) {
      throw new Error('Cannot advance workflow that is not in progress');
    }

    const nextStep = await this.workflowStepsService.findNextStep(instance.currentStepId);

    if (!nextStep) {
      // No next step, workflow is completed
      instance.status = WorkflowStatus.COMPLETED;
      instance.currentStepId = 0; // Set to 0 instead of null
    } else {
      instance.currentStepId = nextStep.id;
    }

    return this.repository.save(instance);
  }

  async getWorkflowHistory(instanceId: number): Promise<WorkflowInstance> {
    const instance = await this.repository.findOne({
      where: { id: instanceId },
      relations: ['template', 'currentStep', 'createdByUser', 'logs', 'logs.step', 'logs.actionByUser']
    });

    if (!instance) {
      throw new NotFoundException(`Workflow instance with ID ${instanceId} not found`);
    }

    return instance;
  }
}
