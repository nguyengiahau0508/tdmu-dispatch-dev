import { ObjectType } from "@nestjs/graphql";
import { PaginatedResponse } from "src/common/graphql/api-response.dto";
import { WorkflowTemplate } from "../../entities/workflow-template.entity";


@ObjectType()
export class GetWorkflowTemplatePaginatedResponse extends PaginatedResponse(WorkflowTemplate) { }
