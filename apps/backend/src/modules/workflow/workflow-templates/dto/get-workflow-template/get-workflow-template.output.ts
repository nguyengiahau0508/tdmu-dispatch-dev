import { ObjectType, Field } from "@nestjs/graphql";
import { WorkflowTemplate } from "../../entities/workflow-template.entity";


@ObjectType()
export class GetWorkflowTemplateOuput {
  @Field(() => WorkflowTemplate)
  workflowTemplate: WorkflowTemplate
}
