import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsInt, Min, IsString } from 'class-validator';

@InputType({ description: 'Dữ liệu đầu vào để tạo workflow instance mới' })
export class CreateWorkflowInstanceInput {
  @Field(() => Int, { description: 'ID của workflow template' })
  @IsInt()
  @Min(1, { message: 'ID template phải là số nguyên dương' })
  templateId: number;

  @Field(() => Int, { description: 'ID của document' })
  @IsInt()
  @Min(1, { message: 'ID document phải là số nguyên dương' })
  documentId: number;

  @Field(() => String, {
    nullable: true,
    description: 'Ghi chú cho workflow instance',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
