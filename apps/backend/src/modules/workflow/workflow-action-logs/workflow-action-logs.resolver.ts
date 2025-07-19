import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkflowActionLogsService } from './workflow-action-logs.service';
import { WorkflowActionLog } from './entities/workflow-action-log.entity';
import { CreateWorkflowActionLogInput } from './dto/create-workflow-action-log.input';
import { UpdateWorkflowActionLogInput } from './dto/update-workflow-action-log.input';

@Resolver(() => WorkflowActionLog)
export class WorkflowActionLogsResolver {
  constructor(private readonly workflowActionLogsService: WorkflowActionLogsService) {}

  @Mutation(() => WorkflowActionLog)
  createWorkflowActionLog(@Args('createWorkflowActionLogInput') createWorkflowActionLogInput: CreateWorkflowActionLogInput) {
    return this.workflowActionLogsService.create(createWorkflowActionLogInput);
  }

  @Query(() => [WorkflowActionLog], { name: 'workflowActionLogs' })
  findAll() {
    return this.workflowActionLogsService.findAll();
  }

  @Query(() => WorkflowActionLog, { name: 'workflowActionLog' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.workflowActionLogsService.findOne(id);
  }

  @Mutation(() => WorkflowActionLog)
  updateWorkflowActionLog(@Args('updateWorkflowActionLogInput') updateWorkflowActionLogInput: UpdateWorkflowActionLogInput) {
    return this.workflowActionLogsService.update(updateWorkflowActionLogInput.id, updateWorkflowActionLogInput);
  }

  @Mutation(() => WorkflowActionLog)
  removeWorkflowActionLog(@Args('id', { type: () => Int }) id: number) {
    return this.workflowActionLogsService.remove(id);
  }
}
