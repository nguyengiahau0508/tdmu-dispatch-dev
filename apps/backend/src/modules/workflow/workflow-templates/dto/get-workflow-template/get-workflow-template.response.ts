import { ApiResponse } from "src/common/graphql/api-response.dto";
import { GetWorkflowTemplateOuput } from "./get-workflow-template.output";
import { ObjectType } from "@nestjs/graphql";

@ObjectType()
export class GetWorkflowTemplateReponse extends ApiResponse(GetWorkflowTemplateOuput) { }
