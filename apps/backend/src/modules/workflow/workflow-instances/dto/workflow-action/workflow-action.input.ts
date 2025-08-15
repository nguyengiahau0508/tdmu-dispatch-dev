import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ActionType } from '../../../workflow-action-logs/entities/workflow-action-log.entity';

@InputType()
export class WorkflowActionInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  instanceId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  stepId: number;

  @Field(() => ActionType)
  @IsNotEmpty()
  actionType: ActionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  note?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metadata?: string;
}
