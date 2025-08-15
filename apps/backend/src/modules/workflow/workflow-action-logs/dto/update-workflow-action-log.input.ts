import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';
import { CreateWorkflowActionLogInput } from './create-workflow-action-log.input';

@InputType({ description: 'Dữ liệu đầu vào để cập nhật workflow action log' })
export class UpdateWorkflowActionLogInput extends PartialType(
  CreateWorkflowActionLogInput,
) {
  @Field(() => Int, { description: 'ID của workflow action log cần cập nhật' })
  @IsInt()
  @Min(1, { message: 'ID phải là số nguyên dương' })
  id: number;
}
