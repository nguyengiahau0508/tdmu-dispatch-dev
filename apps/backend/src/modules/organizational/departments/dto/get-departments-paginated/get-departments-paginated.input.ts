import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/common/shared/pagination/dtos';

@InputType()
export class GetDepartmentsPaginatedInput extends PageOptionsDto {
  @Field(() => String, { nullable: true, description: 'Từ khóa tìm kiếm' })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => Int, { nullable: true, description: 'ID phòng ban cha để lọc' })
  @IsOptional()
  parentDepartmentId?: number;
}
