import { ObjectType, Field } from '@nestjs/graphql';
import { DocumentType } from '../../entities/document-type.entity';

@ObjectType()
export class UpdateDocumentTypeOutput {
  @Field(() => DocumentType)
  documentType: DocumentType;
}
