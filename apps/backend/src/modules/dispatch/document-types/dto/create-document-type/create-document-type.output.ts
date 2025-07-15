import { Field, ObjectType } from "@nestjs/graphql";
import { DocumentType } from "../../entities/document-type.entity";


@ObjectType()
export class CreateDocumentTypeOutput {
    @Field(()=> DocumentType)
    documentType: DocumentType;
}