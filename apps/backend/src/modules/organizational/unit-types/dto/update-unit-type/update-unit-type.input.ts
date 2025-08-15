import { Field, InputType, Int } from '@nestjs/graphql';
import { IsString, MaxLength, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class UpdateUnitTypeInput {
  @Field(() => Int, { description: 'ID của loại đơn vị' })
  @IsNumber()
  id: number;

  @Field(() => String, { nullable: true, description: 'Tên của loại đơn vị' })
  @IsString()
  @MaxLength(256)
  @IsOptional()
  typeName?: string;

  @Field(() => String, { nullable: true, description: 'Mô tả của loại đơn vị' })
  @IsString()
  @IsOptional()
  description?: string;
}
