import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';
import { CreateWorkflowTemplateInput } from '../create-workflow-template/create-workflow-template.input';

@InputType({ description: 'Dữ liệu đầu vào để cập nhật workflow template' })
export class UpdateWorkflowTemplateInput extends PartialType(
  CreateWorkflowTemplateInput,
) {
  @Field(() => Int, { description: 'ID của workflow template cần cập nhật' })
  @IsInt()
  @Min(1, { message: 'ID phải là số nguyên dương' })
  id: number;
}
