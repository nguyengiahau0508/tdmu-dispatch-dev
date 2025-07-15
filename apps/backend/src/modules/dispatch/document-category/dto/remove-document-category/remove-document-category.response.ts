import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { RemoveDocumentCategoryOutput } from "./remove-document-category.output";

@ObjectType()
export class RemoveDocumentCategoryResponse extends ApiResponse(RemoveDocumentCategoryOutput) {} 