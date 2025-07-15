import { ObjectType, Field } from "@nestjs/graphql";
import { DocumentType } from "../../entities/document-type.entity";

@ObjectType()
export class GetDocumentTypeOutput {
  @Field(() => DocumentType, { description: 'Thông tin loại văn bản' })
  documentType: DocumentType;
} 