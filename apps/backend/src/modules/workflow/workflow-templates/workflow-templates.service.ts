import { Injectable } from '@nestjs/common';
import { CreateWorkflowTemplateInput } from './dto/create-workflow-template.input';
import { UpdateWorkflowTemplateInput } from './dto/update-workflow-template.input';

@Injectable()
export class WorkflowTemplatesService {
  create(createWorkflowTemplateInput: CreateWorkflowTemplateInput) {
    return 'This action adds a new workflowTemplate';
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
