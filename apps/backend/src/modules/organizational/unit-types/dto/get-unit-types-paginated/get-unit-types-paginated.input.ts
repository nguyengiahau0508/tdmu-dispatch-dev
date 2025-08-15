import { Field, InputType } from '@nestjs/graphql';
import { PageOptionsDto } from 'src/common/shared/pagination/dtos';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class GetUnitTypesPaginatedInput extends PageOptionsDto {
  @Field(() => String, {
    nullable: true,
    description: 'Từ khóa tìm kiếm theo tên hoặc mô tả',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
