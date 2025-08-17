import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsInt, Min, IsString, IsEnum, IsDateString } from 'class-validator';
import { TaskPriority } from '../../entities/task-request.entity';

@InputType({ description: 'Dữ liệu đầu vào để tạo task request mới' })
export class CreateTaskRequestInput {
  @Field(() => Int, { description: 'ID của người được giao việc' })
  @IsInt()
  @Min(1, { message: 'ID người được giao việc phải là số nguyên dương' })
  assignedToUserId: number;

  @Field(() => String, { description: 'Tiêu đề công việc' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề công việc không được để trống' })
  title: string;

  @Field(() => String, { 
    nullable: true, 
    description: 'Mô tả chi tiết công việc' 
  })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => TaskPriority, { 
    nullable: true, 
    description: 'Mức độ ưu tiên' 
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @Field(() => String, { 
    nullable: true, 
    description: 'Deadline (ISO string)' 
  })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @Field(() => String, { 
    nullable: true, 
    description: 'Hướng dẫn thực hiện' 
  })
  @IsString()
  @IsOptional()
  instructions?: string;

  @Field(() => String, { 
    nullable: true, 
    description: 'Ghi chú bổ sung' 
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
