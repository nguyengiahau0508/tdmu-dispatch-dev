import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { GetDocumentCategoryOutput } from "./get-document-category.output";

@ObjectType()
export class GetDocumentCategoryResponse extends ApiResponse(GetDocumentCategoryOutput) {} 