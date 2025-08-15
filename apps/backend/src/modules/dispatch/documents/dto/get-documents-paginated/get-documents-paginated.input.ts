import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PageOptionsDto } from 'src/common/shared/pagination/dtos';
import { DocumentTypeEnum } from '../../entities/document.entity';

@InputType()
export class GetDocumentsPaginatedInput extends PageOptionsDto {
  @Field(() => String, { nullable: true, description: 'Từ khóa tìm kiếm' })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => DocumentTypeEnum, { nullable: true, description: 'Loại văn bản' })
  @IsEnum(DocumentTypeEnum)
  @IsOptional()
  documentType?: DocumentTypeEnum;
}
