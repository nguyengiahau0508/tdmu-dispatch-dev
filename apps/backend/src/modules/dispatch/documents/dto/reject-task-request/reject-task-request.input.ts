import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, Min, IsString } from 'class-validator';

@InputType({ description: 'Dữ liệu đầu vào để từ chối task request' })
export class RejectTaskRequestInput {
  @Field(() => Int, { description: 'ID của task request' })
  @IsInt()
  @Min(1, { message: 'ID task request phải là số nguyên dương' })
  taskRequestId: number;

  @Field(() => String, { description: 'Lý do từ chối' })
  @IsString()
  @IsNotEmpty({ message: 'Lý do từ chối không được để trống' })
  rejectionReason: string;
}
