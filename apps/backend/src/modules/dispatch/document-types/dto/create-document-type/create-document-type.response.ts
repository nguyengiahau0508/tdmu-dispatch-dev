import { ObjectType } from "@nestjs/graphql";
import { ApiResponse } from "src/common/graphql/api-response.dto";
import { CreateDocumentTypeOutput } from "./create-document-type.output";

@ObjectType()
export class CreateDocumentTypeResponse extends ApiResponse(CreateDocumentTypeOutput) { }