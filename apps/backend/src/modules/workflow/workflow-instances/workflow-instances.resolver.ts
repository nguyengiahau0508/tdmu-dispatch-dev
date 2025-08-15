import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { WorkflowInstancesService } from './workflow-instances.service';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { CreateWorkflowInstanceInput } from './dto/create-workflow-instance/create-workflow-instance.input';
import { UpdateWorkflowInstanceInput } from './dto/update-workflow-instance/update-workflow-instance.input';
import { WorkflowActionInput } from './dto/workflow-action/workflow-action.input';
import { User } from 'src/modules/users/entities/user.entity';

@Resolver(() => WorkflowInstance)
@UseGuards(GqlAuthGuard)
export class WorkflowInstancesResolver {
  constructor(
    private readonly workflowInstancesService: WorkflowInstancesService,
  ) {}

  @Mutation(() => WorkflowInstance, {
    description: 'Tạo workflow instance mới',
  })
  createWorkflowInstance(
    @Args('createWorkflowInstanceInput')
    createWorkflowInstanceInput: CreateWorkflowInstanceInput,
    @CurrentUser() user: User,
  ) {
    return this.workflowInstancesService.create(
      createWorkflowInstanceInput,
      user,
    );
  }

  @Query(() => [WorkflowInstance], {
    name: 'workflowInstances',
    description: 'Lấy tất cả workflow instances',
  })
  findAll() {
    return this.workflowInstancesService.findAll();
  }

  @Query(() => WorkflowInstance, {
    name: 'workflowInstance',
    description: 'Lấy workflow instance theo ID',
  })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.workflowInstancesService.findOne(id);
  }

  @Query(() => [WorkflowInstance], {
    name: 'myWorkflowInstances',
    description: 'Lấy workflow instances của user hiện tại',
  })
  findMyInstances(@CurrentUser() user: User) {
    return this.workflowInstancesService.findByUser(user.id);
  }

  @Query(() => [WorkflowInstance], {
    name: 'pendingWorkflows',
    description: 'Lấy workflow instances đang chờ xử lý theo role',
  })
  findPendingWorkflows(@CurrentUser() user: User) {
    // Get the first role from user's roles array
    const userRole = user.roles[0];
    return this.workflowInstancesService.getPendingWorkflows(userRole);
  }

  @Mutation(() => WorkflowInstance, {
    description: 'Cập nhật workflow instance',
  })
  updateWorkflowInstance(
    @Args('updateWorkflowInstanceInput')
    updateWorkflowInstanceInput: UpdateWorkflowInstanceInput,
  ) {
    return this.workflowInstancesService.update(
      updateWorkflowInstanceInput.id,
      updateWorkflowInstanceInput,
    );
  }

  @Mutation(() => Boolean, { description: 'Xóa workflow instance' })
  removeWorkflowInstance(@Args('id', { type: () => Int }) id: number) {
    return this.workflowInstancesService.remove(id);
  }

  @Mutation(() => WorkflowInstance, {
    description: 'Thực hiện hành động trên workflow',
  })
  executeWorkflowAction(
    @Args('workflowActionInput') workflowActionInput: WorkflowActionInput,
    @CurrentUser() user: User,
  ) {
    return this.workflowInstancesService.executeAction(
      workflowActionInput,
      user,
    );
  }

  @Query(() => WorkflowInstance, {
    name: 'workflowHistory',
    description: 'Lấy lịch sử workflow instance',
  })
  getWorkflowHistory(
    @Args('instanceId', { type: () => Int }) instanceId: number,
  ) {
    return this.workflowInstancesService.getWorkflowHistory(instanceId);
  }
}
