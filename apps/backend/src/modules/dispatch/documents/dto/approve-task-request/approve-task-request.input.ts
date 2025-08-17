import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsInt, Min, IsString } from 'class-validator';

@InputType({ description: 'Dữ liệu đầu vào để phê duyệt task request' })
export class ApproveTaskRequestInput {
  @Field(() => Int, { description: 'ID của task request' })
  @IsInt()
  @Min(1, { message: 'ID task request phải là số nguyên dương' })
  taskRequestId: number;

  @Field(() => String, { 
    nullable: true, 
    description: 'Ghi chú khi phê duyệt' 
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
