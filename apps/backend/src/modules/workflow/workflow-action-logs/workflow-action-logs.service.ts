import { Injectable } from '@nestjs/common';
import { CreateWorkflowActionLogInput } from './dto/create-workflow-action-log.input';
import { UpdateWorkflowActionLogInput } from './dto/update-workflow-action-log.input';

@Injectable()
export class WorkflowActionLogsService {
  createAndSave(createWorkflowActionLogInput: CreateWorkflowActionLogInput) {
    return 'This action adds a new workflowActionLog';
  } 

  findAll() {
    return `This action returns all workflowActionLogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workflowActionLog`;
  }

  update(id: number, updateWorkflowActionLogInput: UpdateWorkflowActionLogInput) {
    return `This action updates a #${id} workflowActionLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} workflowActionLog`;
  }
}
