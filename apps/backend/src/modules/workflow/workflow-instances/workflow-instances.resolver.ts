import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { WorkflowInstancesService } from './workflow-instances.service';
import { WorkflowInstance } from './entities/workflow-instance.entity';
import { CreateWorkflowInstanceInput } from './dto/create-workflow-instance/create-workflow-instance.input';
import { UpdateWorkflowInstanceInput } from './dto/update-workflow-instance/update-workflow-instance.input';
import { WorkflowActionInput } from './dto/workflow-action/workflow-action.input';
import { WorkflowPermissionsService } from '../workflow-permissions/workflow-permissions.service';
import { WorkflowStepsService } from '../workflow-steps/workflow-steps.service';
import { User } from 'src/modules/users/entities/user.entity';
import { ActionType } from '../workflow-action-logs/entities/workflow-action-log.entity';

@Resolver(() => WorkflowInstance)
@UseGuards(GqlAuthGuard)
export class WorkflowInstancesResolver {
  constructor(
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly workflowPermissionsService: WorkflowPermissionsService,
    private readonly workflowStepsService: WorkflowStepsService,
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

  @Query(() => [WorkflowInstance], {
    name: 'myPendingWorkflows',
    description: 'Lấy workflow instances mà user hiện tại có thể xử lý',
  })
  findMyPendingWorkflows(@CurrentUser() user: User) {
    return this.workflowInstancesService.getMyPendingWorkflows(user);
  }

  @Query(() => [String], {
    name: 'availableActions',
    description: 'Lấy danh sách actions có thể thực hiện cho workflow instance',
  })
  getAvailableActions(
    @Args('instanceId', { type: () => Int }) instanceId: number,
    @CurrentUser() user: User,
  ) {
    return this.workflowInstancesService.getAvailableActions(instanceId, user);
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
  async executeWorkflowAction(
    @Args('workflowActionInput') workflowActionInput: WorkflowActionInput,
    @CurrentUser() user: User,
  ) {
    console.log('Executing workflow action:', {
      instanceId: workflowActionInput.instanceId,
      stepId: workflowActionInput.stepId,
      actionType: workflowActionInput.actionType,
      userId: user.id
    });

    // Validate input
    if (!workflowActionInput.instanceId) {
      throw new BadRequestException('instanceId is required');
    }
    if (!workflowActionInput.stepId) {
      throw new BadRequestException('stepId is required');
    }
    if (!workflowActionInput.actionType) {
      throw new BadRequestException('actionType is required');
    }

    // Kiểm tra quyền trực tiếp trong resolver
    const instance = await this.workflowInstancesService.findOne(
      workflowActionInput.instanceId,
    );
    
    if (!instance.currentStep) {
      throw new BadRequestException('Workflow instance does not have a current step');
    }
    
    const step = await this.workflowStepsService.findOne(
      workflowActionInput.stepId,
    );
    
    const canPerform = this.workflowPermissionsService.canPerformAction(
      user,
      step,
      workflowActionInput.actionType as ActionType,
    );
    
    if (!canPerform) {
      throw new BadRequestException(
        `User does not have permission to perform ${workflowActionInput.actionType} on this workflow step`,
      );
    }
    
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
