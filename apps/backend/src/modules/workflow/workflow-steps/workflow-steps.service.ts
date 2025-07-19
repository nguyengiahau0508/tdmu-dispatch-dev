import { Injectable } from '@nestjs/common';
import { CreateWorkflowStepInput } from './dto/create-workflow-step.input';
import { UpdateWorkflowStepInput } from './dto/update-workflow-step.input';

@Injectable()
export class WorkflowStepsService {
  create(createWorkflowStepInput: CreateWorkflowStepInput) {
    return 'This action adds a new workflowStep';
  }

  findAll() {
    return `This action returns all workflowSteps`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workflowStep`;
  }

  update(id: number, updateWorkflowStepInput: UpdateWorkflowStepInput) {
    return `This action updates a #${id} workflowStep`;
  }

  remove(id: number) {
    return `This action removes a #${id} workflowStep`;
  }
}
