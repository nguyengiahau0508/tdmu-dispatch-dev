import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { ActionType } from 'src/modules/workflow/workflow-action-logs/entities/workflow-action-log.entity';

@InputType()
export class DocumentActionInput {
  @Field(() => Int, { description: 'ID của document' })
  @IsNotEmpty()
  @IsNumber()
  documentId: number;

  @Field(() => ActionType, { description: 'Loại action' })
  @IsNotEmpty()
  @IsEnum(ActionType)
  actionType: ActionType;

  @Field(() => String, { nullable: true, description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => Int, { nullable: true, description: 'ID user chuyển tiếp (cho TRANSFER action)' })
  @IsOptional()
  @IsNumber()
  transferToUserId?: number;
}
