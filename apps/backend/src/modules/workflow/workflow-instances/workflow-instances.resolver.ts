import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkflowInstancesService } from './workflow-instances.service';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { CreateWorkflowInstanceInput } from './dto/create-workflow-instance.input';
import { UpdateWorkflowInstanceInput } from './dto/update-workflow-instance.input';

@Resolver(() => WorkflowInstance)
export class WorkflowInstancesResolver {
  constructor(private readonly workflowInstancesService: WorkflowInstancesService) {}

  @Mutation(() => WorkflowInstance)
  createWorkflowInstance(@Args('createWorkflowInstanceInput') createWorkflowInstanceInput: CreateWorkflowInstanceInput) {
    return this.workflowInstancesService.create(createWorkflowInstanceInput);
  }

  @Query(() => [WorkflowInstance], { name: 'workflowInstances' })
  findAll() {
    return this.workflowInstancesService.findAll();
  }

  @Query(() => WorkflowInstance, { name: 'workflowInstance' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.workflowInstancesService.findOne(id);
  }

  @Mutation(() => WorkflowInstance)
  updateWorkflowInstance(@Args('updateWorkflowInstanceInput') updateWorkflowInstanceInput: UpdateWorkflowInstanceInput) {
    return this.workflowInstancesService.update(updateWorkflowInstanceInput.id, updateWorkflowInstanceInput);
  }

  @Mutation(() => WorkflowInstance)
  removeWorkflowInstance(@Args('id', { type: () => Int }) id: number) {
    return this.workflowInstancesService.remove(id);
  }
}
