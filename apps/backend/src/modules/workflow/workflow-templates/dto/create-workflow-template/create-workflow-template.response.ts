import { Field, ObjectType } from '@nestjs/graphql';
import { WorkflowTemplate } from '../../entities/workflow-template.entity';

@ObjectType({ description: 'Response khi tạo workflow template thành công' })
export class CreateWorkflowTemplateResponse {
  @Field(() => WorkflowTemplate)
  workflowTemplate: WorkflowTemplate;
}
