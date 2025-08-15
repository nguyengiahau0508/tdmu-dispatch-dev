import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorkflowActionLogsService } from './workflow-action-logs.service';
import { WorkflowActionLog } from './entities/workflow-action-log.entity';
import { CreateWorkflowActionLogInput } from './dto/create-workflow-action-log.input';
import { UpdateWorkflowActionLogInput } from './dto/update-workflow-action-log.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { ActionType } from './entities/workflow-action-log.entity';

@Resolver(() => WorkflowActionLog)
@UseGuards(GqlAuthGuard)
export class WorkflowActionLogsResolver {
  constructor(private readonly workflowActionLogsService: WorkflowActionLogsService) {}

  @Mutation(() => WorkflowActionLog, { description: 'Tạo workflow action log mới' })
  createWorkflowActionLog(
    @Args('createWorkflowActionLogInput') createWorkflowActionLogInput: CreateWorkflowActionLogInput,
    @CurrentUser() user: User
  ) {
    return this.workflowActionLogsService.create(createWorkflowActionLogInput, user);
  }

  @Query(() => [WorkflowActionLog], { name: 'workflowActionLogs', description: 'Lấy tất cả workflow action logs' })
  findAll() {
    return this.workflowActionLogsService.findAll();
  }

  @Query(() => [WorkflowActionLog], { name: 'workflowActionLogsByInstance', description: 'Lấy workflow action logs theo instance ID' })
  findByInstanceId(@Args('instanceId', { type: () => Int }) instanceId: number) {
    return this.workflowActionLogsService.findByInstanceId(instanceId);
  }

  @Query(() => [WorkflowActionLog], { name: 'workflowActionLogsByUser', description: 'Lấy workflow action logs theo user ID' })
  findByUser(@Args('userId', { type: () => Int }) userId: number) {
    return this.workflowActionLogsService.findByUser(userId);
  }

  @Query(() => WorkflowActionLog, { name: 'workflowActionLog', description: 'Lấy workflow action log theo ID' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.workflowActionLogsService.findOne(id);
  }

  @Query(() => [WorkflowActionLog], { name: 'workflowTimeline', description: 'Lấy timeline của workflow instance' })
  getWorkflowTimeline(@Args('instanceId', { type: () => Int }) instanceId: number) {
    return this.workflowActionLogsService.getWorkflowTimeline(instanceId);
  }

  @Query(() => [WorkflowActionLog], { name: 'recentWorkflowActions', description: 'Lấy các hành động workflow gần đây' })
  getRecentActions(@Args('limit', { type: () => Int, defaultValue: 10 }) limit: number) {
    return this.workflowActionLogsService.getRecentActions(limit);
  }

  @Mutation(() => WorkflowActionLog, { description: 'Cập nhật workflow action log' })
  updateWorkflowActionLog(
    @Args('updateWorkflowActionLogInput') updateWorkflowActionLogInput: UpdateWorkflowActionLogInput
  ) {
    return this.workflowActionLogsService.update(updateWorkflowActionLogInput.id, updateWorkflowActionLogInput);
  }

  @Mutation(() => Boolean, { description: 'Xóa workflow action log' })
  removeWorkflowActionLog(@Args('id', { type: () => Int }) id: number) {
    return this.workflowActionLogsService.remove(id);
  }

  @Mutation(() => WorkflowActionLog, { description: 'Ghi log hành động workflow' })
  logWorkflowAction(
    @Args('instanceId', { type: () => Int }) instanceId: number,
    @Args('stepId', { type: () => Int }) stepId: number,
    @Args('actionType', { type: () => ActionType }) actionType: ActionType,
    @CurrentUser() user: User,
    @Args('note', { nullable: true }) note?: string,
    @Args('metadata', { nullable: true }) metadata?: string
  ) {
    return this.workflowActionLogsService.logAction(
      instanceId,
      stepId,
      actionType,
      user,
      note,
      metadata ? JSON.parse(metadata) : null
    );
  }
}
