import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';
import { CreateWorkflowStepInput } from './create-workflow-step.input';

@InputType({ description: 'Dữ liệu đầu vào để cập nhật workflow step' })
export class UpdateWorkflowStepInput extends PartialType(CreateWorkflowStepInput) {
  @Field(() => Int, { description: 'ID của workflow step cần cập nhật' })
  @IsInt()
  @Min(1, { message: 'ID phải là số nguyên dương' })
  id: number;
}
