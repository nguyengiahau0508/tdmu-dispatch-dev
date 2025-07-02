import { Field, InputType, Int } from "@nestjs/graphql";
import { IsOptional, IsString, IsEnum } from "class-validator";
import { PageOptionsDto } from "src/common/shared/pagination/dtos";

@InputType()
export class GetUnitsPaginatedInput extends PageOptionsDto {
  @Field(() => String, { nullable: true, description: 'Từ khóa tìm kiếm' })
  @IsString()
  @IsOptional()
  search?: string

  @Field(() => Int, { nullable: true, description: 'ID loại đơn vị để lọc' })
  @IsOptional()
  unitTypeId?: number

  @Field(() => Int, { nullable: true, description: 'ID đơn vị cha để lọc' })
  @IsOptional()
  parentUnitId?: number
} 
