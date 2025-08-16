import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Metadata } from 'src/common/graphql/metadata.dto';

@ObjectType()
export class AssignWorkflowData {
  @Field(() => Int, { description: 'ID của document' })
  documentId: number;

  @Field(() => Int, { description: 'ID của workflow instance' })
  workflowInstanceId: number;

  @Field(() => String, { description: 'Trạng thái workflow' })
  workflowStatus: string;

  @Field(() => String, { nullable: true, description: 'Bước hiện tại' })
  currentStep?: string;

  @Field(() => String, { description: 'Thông báo' })
  message: string;
}

@ObjectType()
export class AssignWorkflowOutput {
  @Field(() => Metadata, { description: 'Thông tin metadata của response' })
  metadata: Metadata;

  @Field(() => AssignWorkflowData, { description: 'Dữ liệu trả về' })
  data: AssignWorkflowData;
}
