import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class DocumentWorkflowInfo {
  @Field(() => Int, { description: 'ID của document' })
  documentId: number;

  @Field(() => String, { description: 'Tiêu đề document' })
  documentTitle: string;

  @Field(() => String, { description: 'Loại document' })
  documentType: string;

  @Field(() => Int, { nullable: true, description: 'ID của workflow instance' })
  workflowInstanceId?: number;

  @Field(() => String, { nullable: true, description: 'Trạng thái workflow' })
  workflowStatus?: string;

  @Field(() => String, { nullable: true, description: 'Bước hiện tại' })
  currentStep?: string;

  @Field(() => Boolean, { description: 'Có workflow đang hoạt động không' })
  hasActiveWorkflow: boolean;
}
