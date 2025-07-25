import { ObjectType } from "@nestjs/graphql";
import { WorkflowTemplate } from "../../entities/workflow-template.entity";


@ObjectType()
export class GetWorkflowTemplateOuput {
  workflowTemplate: WorkflowTemplate
}
