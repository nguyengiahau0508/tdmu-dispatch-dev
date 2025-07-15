import { ObjectType } from "@nestjs/graphql";
import { PaginatedResponse } from "src/common/graphql/api-response.dto";
import { DocumentType } from "../../entities/document-type.entity";

@ObjectType()
export class GetDocumentTypesPaginatedResponse extends PaginatedResponse(DocumentType) {} 