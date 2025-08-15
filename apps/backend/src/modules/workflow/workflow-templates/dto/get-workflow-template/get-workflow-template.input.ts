import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType({ description: 'Dữ liệu đầu vào để lấy workflow template theo ID' })
export class GetWorkflowTemplateInput {
  @Field(() => Int, { description: 'ID của workflow template' })
  @IsInt()
  @Min(1, { message: 'ID phải là số nguyên dương' })
  id: number;
}
