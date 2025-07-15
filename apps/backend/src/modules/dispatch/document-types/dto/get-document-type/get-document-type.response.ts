import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { GetDocumentTypeOutput } from "./get-document-type.output";

@ObjectType()
export class GetDocumentTypeResponse extends ApiResponse(GetDocumentTypeOutput) {} 