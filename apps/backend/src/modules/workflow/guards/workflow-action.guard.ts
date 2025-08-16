import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { WorkflowPermissionsService } from '../workflow-permissions/workflow-permissions.service';
import { WorkflowInstancesService } from '../workflow-instances/workflow-instances.service';
import { WorkflowStepsService } from '../workflow-steps/workflow-steps.service';
import { ActionType } from '../workflow-action-logs/entities/workflow-action-log.entity';

@Injectable()
export class WorkflowActionGuard implements CanActivate {
  constructor(
    private readonly workflowPermissionsService: WorkflowPermissionsService,
    private readonly workflowInstancesService: WorkflowInstancesService,
    private readonly workflowStepsService: WorkflowStepsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { args, context: gqlContext } = ctx.getContext();
    
    // Lấy user từ context
    const user = gqlContext.req?.user;
    if (!user) {
      throw new BadRequestException('User not authenticated');
    }

    // Lấy workflow action input từ args
    const workflowActionInput = args.workflowActionInput;
    if (!workflowActionInput) {
      throw new BadRequestException('Workflow action input is required');
    }

    // Lấy workflow instance và step
    const instance = await this.workflowInstancesService.findOne(
      workflowActionInput.instanceId,
    );
    const step = await this.workflowStepsService.findOne(
      workflowActionInput.stepId,
    );

    // Kiểm tra quyền thực hiện action
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

    return true;
  }
}
