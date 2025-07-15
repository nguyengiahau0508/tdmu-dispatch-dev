import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { RemoveDocumentTypeOutput } from "./remove-document-type.output";

@ObjectType()
export class RemoveDocumentTypeResponse extends ApiResponse(RemoveDocumentTypeOutput) {} 