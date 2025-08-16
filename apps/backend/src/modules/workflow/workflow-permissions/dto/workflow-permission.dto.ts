import { Field, ObjectType, InputType, Int } from '@nestjs/graphql';

@ObjectType()
export class WorkflowPermissionDto {
  @Field(() => Int)
  instanceId: number;

  @Field(() => Int)
  stepId: number;

  @Field()
  actionType: string;

  @Field()
  canPerform: boolean;

  @Field({ nullable: true })
  reason?: string;
}

@ObjectType()
export class WorkflowViewPermissionDto {
  @Field(() => Int)
  instanceId: number;

  @Field()
  canView: boolean;

  @Field({ nullable: true })
  reason?: string;
}

@ObjectType()
export class WorkflowCreatePermissionDto {
  @Field(() => Int)
  templateId: number;

  @Field()
  canCreate: boolean;

  @Field({ nullable: true })
  reason?: string;
}

@ObjectType()
export class AvailableActionsDto {
  @Field(() => Int)
  stepId: number;

  @Field(() => [String])
  availableActions: string[];
}

@ObjectType()
export class RoleLabelDto {
  @Field()
  role: string;

  @Field()
  label: string;
}

@ObjectType()
export class ActionTypeLabelDto {
  @Field()
  actionType: string;

  @Field()
  label: string;
}

@InputType()
export class CheckWorkflowPermissionInput {
  @Field(() => Int)
  instanceId: number;

  @Field(() => Int)
  stepId: number;

  @Field()
  actionType: string;
}

@InputType()
export class CheckWorkflowViewPermissionInput {
  @Field(() => Int)
  instanceId: number;
}

@InputType()
export class CheckWorkflowCreatePermissionInput {
  @Field(() => Int)
  templateId: number;
}
