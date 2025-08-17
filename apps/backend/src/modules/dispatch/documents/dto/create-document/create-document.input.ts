import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt, IsDateString } from 'class-validator';
import { DocumentTypeEnum, DocumentPriority, DocumentStatus } from '../../entities/document.entity';

@InputType()
export class CreateDocumentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @Field(() => DocumentTypeEnum)
  @IsEnum(DocumentTypeEnum)
  documentType: DocumentTypeEnum;

  @Field(() => Int)
  @IsInt()
  documentCategoryId: number;

  @Field(() => DocumentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @Field(() => DocumentPriority, { nullable: true })
  @IsOptional()
  @IsEnum(DocumentPriority)
  priority?: DocumentPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  assignedToUserId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  workflowTemplateId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  fileId?: number;
}
