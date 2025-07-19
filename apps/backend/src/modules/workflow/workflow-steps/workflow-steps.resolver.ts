import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkflowStepsService } from './workflow-steps.service';
import { WorkflowStep } from './entities/workflow-step.entity';
import { CreateWorkflowStepInput } from './dto/create-workflow-step.input';
import { UpdateWorkflowStepInput } from './dto/update-workflow-step.input';

@Resolver(() => WorkflowStep)
export class WorkflowStepsResolver {
  constructor(private readonly workflowStepsService: WorkflowStepsService) {}

  @Mutation(() => WorkflowStep)
  createWorkflowStep(@Args('createWorkflowStepInput') createWorkflowStepInput: CreateWorkflowStepInput) {
    return this.workflowStepsService.create(createWorkflowStepInput);
  }

  @Query(() => [WorkflowStep], { name: 'workflowSteps' })
  findAll() {
    return this.workflowStepsService.findAll();
  }

  @Query(() => WorkflowStep, { name: 'workflowStep' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.workflowStepsService.findOne(id);
  }

  @Mutation(() => WorkflowStep)
  updateWorkflowStep(@Args('updateWorkflowStepInput') updateWorkflowStepInput: UpdateWorkflowStepInput) {
    return this.workflowStepsService.update(updateWorkflowStepInput.id, updateWorkflowStepInput);
  }

  @Mutation(() => WorkflowStep)
  removeWorkflowStep(@Args('id', { type: () => Int }) id: number) {
    return this.workflowStepsService.remove(id);
  }
}
