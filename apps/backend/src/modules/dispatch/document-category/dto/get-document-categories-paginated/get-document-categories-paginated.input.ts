import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/common/shared/pagination/dtos';

@InputType()
export class GetDocumentCategoriesPaginatedInput extends PageOptionsDto {
  @Field(() => String, { nullable: true, description: 'Từ khóa tìm kiếm' })
  @IsString()
  @IsOptional()
  search?: string;
}
