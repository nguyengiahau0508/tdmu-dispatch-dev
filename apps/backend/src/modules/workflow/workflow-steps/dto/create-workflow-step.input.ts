import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsInt, Min, IsEnum, IsBoolean } from 'class-validator';
import { StepType } from '../entities/workflow-step.entity';

@InputType({ description: 'Dữ liệu đầu vào để tạo workflow step mới' })
export class CreateWorkflowStepInput {
  @Field(() => String, { description: 'Tên của workflow step' })
  @IsString()
  @IsNotEmpty({ message: 'Tên bước không được để trống' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Mô tả của workflow step' })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => StepType, { description: 'Loại bước trong workflow' })
  @IsEnum(StepType, { message: 'Loại bước không hợp lệ' })
  type: StepType;

  @Field(() => String, { description: 'Vai trò được gán cho bước này' })
  @IsString()
  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  assignedRole: string;

  @Field(() => Int, { description: 'Thứ tự của bước trong workflow' })
  @IsInt()
  @Min(1, { message: 'Thứ tự phải là số nguyên dương' })
  orderNumber: number;

  @Field(() => Int, { nullable: true, description: 'ID của bước tiếp theo' })
  @IsInt()
  @IsOptional()
  nextStepId?: number;

  @Field(() => Boolean, { nullable: true, description: 'Trạng thái kích hoạt', defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => Int, { description: 'ID của workflow template' })
  @IsInt()
  @Min(1, { message: 'ID template phải là số nguyên dương' })
  templateId: number;
}
