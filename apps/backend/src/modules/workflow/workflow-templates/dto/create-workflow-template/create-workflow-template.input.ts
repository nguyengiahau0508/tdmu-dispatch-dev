
import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

@InputType({ description: 'Dữ liệu đầu vào để tạo workflow template mới' })
export class CreateWorkflowTemplateInput {
  @Field(() => String, { description: 'Tên của workflow template' })
  @IsString()
  @IsNotEmpty({ message: 'Tên quy trình không được để trống' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Mô tả của workflow template' })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Boolean, { nullable: true, description: 'Trạng thái kích hoạt', defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

