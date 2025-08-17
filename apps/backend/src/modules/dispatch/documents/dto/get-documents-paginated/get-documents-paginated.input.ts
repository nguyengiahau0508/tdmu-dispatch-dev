import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsInt, IsDateString } from 'class-validator';
import { DocumentTypeEnum, DocumentPriority, DocumentStatus } from '../../entities/document.entity';
import { PageOptionsDto } from 'src/common/shared/pagination/dtos';

@InputType()
export class GetDocumentsPaginatedInput extends PageOptionsDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => DocumentTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(DocumentTypeEnum)
  documentType?: DocumentTypeEnum;

  @Field(() => DocumentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @Field(() => DocumentPriority, { nullable: true })
  @IsOptional()
  @IsEnum(DocumentPriority)
  priority?: DocumentPriority;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  documentCategoryId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  assignedToUserId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  createdByUserId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  deadlineFrom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  deadlineTo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  createdAtTo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  hasDeadline?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isOverdue?: boolean;
}
