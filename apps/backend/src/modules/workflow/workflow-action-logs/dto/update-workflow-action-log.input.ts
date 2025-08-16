import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min, IsOptional, IsString } from 'class-validator';

@InputType({ description: 'Dữ liệu đầu vào để cập nhật workflow action log' })
export class UpdateWorkflowActionLogInput {
  @Field(() => Int, { description: 'ID của workflow action log cần cập nhật' })
  @IsInt()
  @Min(1, { message: 'ID phải là số nguyên dương' })
  id: number;

  @Field(() => String, { nullable: true, description: 'Ghi chú cho hành động' })
  @IsString()
  @IsOptional()
  note?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Metadata bổ sung (JSON string)',
  })
  @IsString()
  @IsOptional()
  metadata?: string;
}
