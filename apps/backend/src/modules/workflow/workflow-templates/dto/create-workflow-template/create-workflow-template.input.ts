
import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

@InputType()
export class CreateWorkflowTemplateInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Tên quy trình không được để trống' })
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Int)
  @IsInt()
  @Min(1, { message: 'ID người tạo phải là số nguyên dương' })
  createdByUserId: number;
}

