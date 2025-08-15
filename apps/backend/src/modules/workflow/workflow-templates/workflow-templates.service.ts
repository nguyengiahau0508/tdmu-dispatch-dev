import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkflowTemplateInput } from './dto/create-workflow-template/create-workflow-template.input';
import { UpdateWorkflowTemplateInput } from './dto/update-workflow-template/update-workflow-template.input';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkflowTemplate } from './entities/workflow-template.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { WorkflowTemplatePageDto } from 'src/common/shared/pagination/page.dto';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';
import { GetWorkflowTemplatePaginatedInput } from './dto/get-workflow-template-paginated/get-workflow-template-paginated.input';

@Injectable()
export class WorkflowTemplatesService {
  constructor(
    @InjectRepository(WorkflowTemplate) private readonly repository: Repository<WorkflowTemplate>
  ) { }

  async create(createWorkflowTemplateInput: CreateWorkflowTemplateInput, user: User): Promise<WorkflowTemplate> {
    const created = this.repository.create({
      ...createWorkflowTemplateInput,
      createdByUser: user
    });
    return this.repository.save(created);
  }

  async findPaginated(input: GetWorkflowTemplatePaginatedInput): Promise<WorkflowTemplatePageDto> {
    const { search, order, skip, take } = input;

    const where: FindOptionsWhere<WorkflowTemplate>[] = [];

    if (search) {
      where.push(
        { id: Number(search) || undefined },
        { name: ILike(`%${search}%`) },
        { description: ILike(`%${search}%`) },
      );
    }

    const [data, itemCount] = await this.repository.findAndCount({
      where: where.length > 0 ? where : undefined,
      order: { id: order },
      skip,
      take,
      relations: ['createdByUser', 'steps']
    });

    const pageMetaDto = new PageMetaDto({ pageOptionsDto: input, itemCount });
    return new WorkflowTemplatePageDto(data, pageMetaDto);
  }

  async findAll(): Promise<WorkflowTemplate[]> {
    return this.repository.find({
      relations: ['createdByUser', 'steps'],
      where: { isActive: true }
    });
  }

  async findOne(id: number): Promise<WorkflowTemplate> {
    const template = await this.repository.findOne({
      where: { id },
      relations: ['createdByUser', 'steps', 'instances']
    });

    if (!template) {
      throw new NotFoundException(`Workflow template with ID ${id} not found`);
    }

    return template;
  }

  async update(id: number, updateWorkflowTemplateInput: UpdateWorkflowTemplateInput): Promise<WorkflowTemplate> {
    const template = await this.findOne(id);

    Object.assign(template, updateWorkflowTemplateInput);
    return this.repository.save(template);
  }

  async remove(id: number): Promise<boolean> {
    const template = await this.findOne(id);

    // Soft delete by setting isActive to false
    template.isActive = false;
    await this.repository.save(template);

    return true;
  }

  async findActiveTemplates(): Promise<WorkflowTemplate[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['steps'],
      order: { id: 'ASC' }
    });
  }
}
