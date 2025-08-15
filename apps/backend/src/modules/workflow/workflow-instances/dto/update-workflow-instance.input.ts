import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';
import { CreateWorkflowInstanceInput } from './create-workflow-instance.input';

@InputType({ description: 'Dữ liệu đầu vào để cập nhật workflow instance' })
export class UpdateWorkflowInstanceInput extends PartialType(CreateWorkflowInstanceInput) {
  @Field(() => Int, { description: 'ID của workflow instance cần cập nhật' })
  @IsInt()
  @Min(1, { message: 'ID phải là số nguyên dương' })
  id: number;
}
