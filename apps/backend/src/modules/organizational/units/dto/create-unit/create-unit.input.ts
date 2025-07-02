import { Field, InputType, Int } from "@nestjs/graphql";
import { IsString, MaxLength, IsOptional, IsDateString, IsEmail, IsNumber } from "class-validator";

@InputType()
export class CreateUnitInput {
  @Field(() => String, { description: 'Tên đơn vị' })
  @IsString()
  @MaxLength(256)
  unitName: string

  @Field(() => Int, { nullable: true, description: 'ID loại đơn vị' })
  @IsNumber()
  @IsOptional()
  unitTypeId?: number

  @Field(() => Int, { nullable: true, description: 'ID đơn vị cha' })
  @IsNumber()
  @IsOptional()
  parentUnitId?: number

  @Field(() => String, { nullable: true, description: 'Ngày thành lập (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  establishmentDate?: string

  @Field(() => String, { nullable: true, description: 'Email đơn vị' })
  @IsEmail()
  @IsOptional()
  email?: string

  @Field(() => String, { nullable: true, description: 'Số điện thoại đơn vị' })
  @IsString()
  @IsOptional()
  phone?: string
} 
