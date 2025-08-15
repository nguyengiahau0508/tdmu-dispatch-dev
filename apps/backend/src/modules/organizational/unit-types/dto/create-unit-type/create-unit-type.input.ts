import { Field, InputType } from '@nestjs/graphql';
import { IsString, MaxLength, IsOptional } from 'class-validator';

@InputType()
export class CreateUnitTypeInput {
  @Field(() => String, { description: 'Tên của loại đơn vị' })
  @IsString()
  @MaxLength(256)
  typeName: string;

  @Field(() => String, { nullable: true, description: 'Mô tả của loại đơn vị' })
  @IsString()
  @IsOptional()
  description?: string;
}
