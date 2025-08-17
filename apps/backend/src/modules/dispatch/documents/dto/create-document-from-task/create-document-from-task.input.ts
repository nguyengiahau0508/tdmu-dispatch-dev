import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { TaskPriority } from '../../entities/task-request.entity';

@InputType({ description: 'Dữ liệu đầu vào để tạo document từ task request' })
export class CreateDocumentFromTaskInput {
  @Field(() => Int, { description: 'ID của task request' })
  @IsInt()
  @Min(1, { message: 'ID task request phải là số nguyên dương' })
  taskRequestId: number;

  @Field(() => String, { description: 'Tiêu đề văn bản' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề văn bản không được để trống' })
  title: string;

  @Field(() => String, { description: 'Nội dung văn bản' })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung văn bản không được để trống' })
  content: string;

  @Field(() => String, { nullable: true, description: 'Danh mục văn bản' })
  @IsString()
  @IsOptional()
  category?: string;

  @Field(() => TaskPriority, { description: 'Độ ưu tiên' })
  @IsEnum(TaskPriority, { message: 'Độ ưu tiên không hợp lệ' })
  priority: TaskPriority;

  @Field(() => String, { nullable: true, description: 'Ghi chú' })
  @IsString()
  @IsOptional()
  notes?: string;
}
