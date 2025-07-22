import { Injectable } from '@nestjs/common';
import { CreateWorkflowTemplateInput } from './dto/create-workflow-template/create-workflow-template.input';
import { UpdateWorkflowTemplateInput } from './dto/update-workflow-template/update-workflow-template.input';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkflowTemplate } from './entities/workflow-template.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WorkflowTemplatesService {
  constructor(
    @InjectRepository(WorkflowTemplate) private readonly repository: Repository<WorkflowTemplate>
  ) { }

  async create(createWorkflowTemplateInput: CreateWorkflowTemplateInput) {
    const created = this.repository.create(createWorkflowTemplateInput)
    return this.repository.save(created)
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
