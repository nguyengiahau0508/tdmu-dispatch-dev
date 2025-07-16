import { InputType, Int, Field } from '@nestjs/graphql';
import { IsString, MaxLength, IsOptional, IsInt } from 'class-validator';

@InputType()
export class CreateDepartmentInput {
  @Field(() => String, { description: 'Tên phòng ban' })
  @IsString()
  @MaxLength(255)
  name: string;

  @Field(() => String, { nullable: true, description: 'Mô tả phòng ban' })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => Int, { nullable: true, description: 'ID phòng ban cha' })
  @IsInt()
  @IsOptional()
  parentDepartmentId?: number;
} 