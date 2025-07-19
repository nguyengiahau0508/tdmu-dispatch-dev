import { Injectable } from '@nestjs/common';
import { CreateWorkflowInstanceInput } from './dto/create-workflow-instance.input';
import { UpdateWorkflowInstanceInput } from './dto/update-workflow-instance.input';

@Injectable()
export class WorkflowInstancesService {
  create(createWorkflowInstanceInput: CreateWorkflowInstanceInput) {
    return 'This action adds a new workflowInstance';
  }

  findAll() {
    return `This action returns all workflowInstances`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workflowInstance`;
  }

  update(id: number, updateWorkflowInstanceInput: UpdateWorkflowInstanceInput) {
    return `This action updates a #${id} workflowInstance`;
  }

  remove(id: number) {
    return `This action removes a #${id} workflowInstance`;
  }
}
