import { Injectable } from '@nestjs/common';
import { CreateWorkflowTemplateInput } from './dto/create-workflow-template/create-workflow-template.input';
import { UpdateWorkflowTemplateInput } from './dto/update-workflow-template/update-workflow-template.input';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkflowTemplate } from './entities/workflow-template.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { PageDto } from 'src/common/shared/pagination/page.dto';
import { GetWorkflowTemplatePaginatedInput } from './dto/get-workflow-template-paginated/get-workflow-template-paginated.input';
import { PageMetaDto } from 'src/common/shared/pagination/page-meta.dto';

@Injectable()
export class WorkflowTemplatesService {
  constructor(
    @InjectRepository(WorkflowTemplate) private readonly repository: Repository<WorkflowTemplate>
  ) { }

  async create(createWorkflowTemplateInput: CreateWorkflowTemplateInput, user: User) {
    const created = this.repository.create({
      ...createWorkflowTemplateInput,
      createdByUser: user
    })
    return this.repository.save(created)
  }

  async findPaginated(input: GetWorkflowTemplatePaginatedInput): Promise<PageDto<WorkflowTemplate>> {
    const { search, order, skip, take } = input

    const where: FindOptionsWhere<WorkflowTemplate>[] = []

    if (search) {
      where.push(
        { id: Number(search) },
        { name: ILike(`%${search}`) },
        { description: ILike(`%${search}`) },
      )
    }

    const [data, itemCount] = await this.repository.findAndCount({
      where: where.length > 0 ? where : undefined,
      order: { id: order },
      skip,
      take
    })

    const pageMetaDto = new PageMetaDto({ pageOptionsDto: input, itemCount })
    return new PageDto(data, pageMetaDto)
  }

  findAll() {
    return `This action returns all workflowTemplates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workflowTemplate`;
  }

  update(id: number, updateWorkflowTemplateInput: UpdateWorkflowTemplateInput) {
    return `This action updates a #${id} workflowTemplate`;
  }

  remove(id: number) {
    return `This action removes a #${id} workflowTemplate`;
  }
}
