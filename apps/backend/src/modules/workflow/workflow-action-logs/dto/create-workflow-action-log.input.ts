import { InputType, Int, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsEnum,
} from 'class-validator';
import { ActionType } from '../entities/workflow-action-log.entity';

@InputType({ description: 'Dữ liệu đầu vào để tạo workflow action log mới' })
export class CreateWorkflowActionLogInput {
  @Field(() => Int, { description: 'ID của workflow instance' })
  @IsInt()
  @Min(1, { message: 'ID instance phải là số nguyên dương' })
  instanceId: number;

  @Field(() => Int, { description: 'ID của workflow step' })
  @IsInt()
  @Min(1, { message: 'ID step phải là số nguyên dương' })
  stepId: number;

  @Field(() => ActionType, { description: 'Loại hành động' })
  @IsEnum(ActionType, { message: 'Loại hành động không hợp lệ' })
  actionType: ActionType;

  @Field(() => String, { nullable: true, description: 'Ghi chú cho hành động' })
  @IsString()
  @IsOptional()
  note?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Metadata bổ sung (JSON string)',
  })
  @IsString()
  @IsOptional()
  metadata?: string;
}
