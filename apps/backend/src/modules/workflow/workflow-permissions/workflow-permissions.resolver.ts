import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { WorkflowPermissionsService } from './workflow-permissions.service';
import { WorkflowInstancesService } from '../workflow-instances/workflow-instances.service';
import { WorkflowStepsService } from '../workflow-steps/workflow-steps.service';
import { User } from 'src/modules/users/entities/user.entity';
import { ActionType } from '../workflow-action-logs/entities/workflow-action-log.entity';
import {
  WorkflowPermissionDto,
  WorkflowViewPermissionDto,
  WorkflowCreatePermissionDto,
  AvailableActionsDto,
  RoleLabelDto,
  ActionTypeLabelDto,
  CheckWorkflowPermissionInput,
  CheckWorkflowViewPermissionInput,
  CheckWorkflowCreatePermissionInput,
} from './dto/workflow-permission.dto';

@Resolver()
@UseGuards(GqlAuthGuard)
export class WorkflowPermissionsResolver {
  constructor(
    private readonly workflowPermissionsService: WorkflowPermissionsService,
    @Inject(forwardRef(() => WorkflowInstancesService))
    private readonly workflowInstancesService: WorkflowInstancesService,
    @Inject(forwardRef(() => WorkflowStepsService))
    private readonly workflowStepsService: WorkflowStepsService,
  ) {}

  // Removed duplicate workflowRoles query - using the one from RolesResolver instead

  @Query(() => [String], {
    name: 'workflowActionTypes',
    description: 'Lấy danh sách các loại hành động trong workflow',
  })
  getActionTypes() {
    return Object.values(ActionType);
  }

  @Query(() => WorkflowPermissionDto, {
    name: 'checkWorkflowPermission',
    description: 'Kiểm tra user có thể thực hiện action trên workflow step không',
  })
  async checkWorkflowPermission(
    @Args('input') input: CheckWorkflowPermissionInput,
    @CurrentUser() user: User,
  ): Promise<WorkflowPermissionDto> {
    const step = await this.workflowStepsService.findOne(input.stepId);
    const canPerform = this.workflowPermissionsService.canPerformAction(user, step, input.actionType as ActionType);
    
    return {
      instanceId: input.instanceId,
      stepId: input.stepId,
      actionType: input.actionType,
      canPerform,
      reason: canPerform ? undefined : 'Không có quyền thực hiện hành động này'
    };
  }

  @Query(() => Boolean, {
    name: 'canPerformWorkflowAction',
    description: 'Kiểm tra user có thể thực hiện action trên workflow step không (legacy)',
  })
  async canPerformAction(
    @Args('instanceId', { type: () => Int }) instanceId: number,
    @Args('stepId', { type: () => Int }) stepId: number,
    @Args('actionType') actionType: ActionType,
    @CurrentUser() user: User,
  ) {
    const step = await this.workflowStepsService.findOne(stepId);
    return this.workflowPermissionsService.canPerformAction(user, step, actionType);
  }

  @Query(() => WorkflowViewPermissionDto, {
    name: 'checkWorkflowViewPermission',
    description: 'Kiểm tra user có thể xem workflow instance không',
  })
  async checkWorkflowViewPermission(
    @Args('input') input: CheckWorkflowViewPermissionInput,
    @CurrentUser() user: User,
  ): Promise<WorkflowViewPermissionDto> {
    const instance = await this.workflowInstancesService.findOne(input.instanceId);
    const canView = this.workflowPermissionsService.canViewWorkflow(user, instance);
    
    return {
      instanceId: input.instanceId,
      canView,
      reason: canView ? undefined : 'Không có quyền xem workflow này'
    };
  }

  @Query(() => Boolean, {
    name: 'canViewWorkflow',
    description: 'Kiểm tra user có thể xem workflow instance không (legacy)',
  })
  async canViewWorkflow(
    @Args('instanceId', { type: () => Int }) instanceId: number,
    @CurrentUser() user: User,
  ) {
    const instance = await this.workflowInstancesService.findOne(instanceId);
    return this.workflowPermissionsService.canViewWorkflow(user, instance);
  }

  @Query(() => WorkflowCreatePermissionDto, {
    name: 'checkWorkflowCreatePermission',
    description: 'Kiểm tra user có thể tạo workflow instance không',
  })
  async checkWorkflowCreatePermission(
    @Args('input') input: CheckWorkflowCreatePermissionInput,
    @CurrentUser() user: User,
  ): Promise<WorkflowCreatePermissionDto> {
    const canCreate = this.workflowPermissionsService.canCreateWorkflow(user, input.templateId);
    
    return {
      templateId: input.templateId,
      canCreate,
      reason: canCreate ? undefined : 'Không có quyền tạo workflow từ template này'
    };
  }

  @Query(() => Boolean, {
    name: 'canCreateWorkflow',
    description: 'Kiểm tra user có thể tạo workflow instance không (legacy)',
  })
  async canCreateWorkflow(
    @Args('templateId', { type: () => Int }) templateId: number,
    @CurrentUser() user: User,
  ) {
    return this.workflowPermissionsService.canCreateWorkflow(user, templateId);
  }

  @Query(() => AvailableActionsDto, {
    name: 'getAvailableActionsForStep',
    description: 'Lấy danh sách actions có thể thực hiện cho step',
  })
  async getAvailableActionsForStep(
    @Args('stepId', { type: () => Int }) stepId: number,
  ): Promise<AvailableActionsDto> {
    const step = await this.workflowStepsService.findOne(stepId);
    const availableActions = this.workflowPermissionsService.getAvailableActions(step);
    
    return {
      stepId,
      availableActions
    };
  }

  @Query(() => [String], {
    name: 'availableActionsForStep',
    description: 'Lấy danh sách actions có thể thực hiện cho step (legacy)',
  })
  async getAvailableActionsForStepLegacy(
    @Args('stepId', { type: () => Int }) stepId: number,
  ) {
    const step = await this.workflowStepsService.findOne(stepId);
    return this.workflowPermissionsService.getAvailableActions(step);
  }

  @Query(() => RoleLabelDto, {
    name: 'getRoleLabel',
    description: 'Lấy label cho role',
  })
  getRoleLabel(@Args('role') role: string): RoleLabelDto {
    const label = this.workflowPermissionsService.getRoleLabel(role);
    return { role, label };
  }

  @Query(() => String, {
    name: 'roleLabel',
    description: 'Lấy label cho role (legacy)',
  })
  getRoleLabelLegacy(@Args('role') role: string) {
    return this.workflowPermissionsService.getRoleLabel(role);
  }

  @Query(() => ActionTypeLabelDto, {
    name: 'getActionTypeLabel',
    description: 'Lấy label cho action type',
  })
  getActionTypeLabel(@Args('actionType') actionType: ActionType): ActionTypeLabelDto {
    const label = this.workflowPermissionsService.getActionTypeLabel(actionType);
    return { actionType, label };
  }

  @Query(() => String, {
    name: 'actionTypeLabel',
    description: 'Lấy label cho action type (legacy)',
  })
  getActionTypeLabelLegacy(@Args('actionType') actionType: ActionType) {
    return this.workflowPermissionsService.getActionTypeLabel(actionType);
  }
}
