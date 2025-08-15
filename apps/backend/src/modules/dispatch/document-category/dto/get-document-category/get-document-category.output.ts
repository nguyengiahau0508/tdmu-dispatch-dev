import { ObjectType, Field } from '@nestjs/graphql';
import { DocumentCategory } from '../../entities/document-category.entity';

@ObjectType()
export class GetDocumentCategoryOutput {
  @Field(() => DocumentCategory, { description: 'Thông tin nhóm văn bản' })
  documentCategory: DocumentCategory;
}
