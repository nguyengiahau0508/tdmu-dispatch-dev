import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Metadata } from 'src/common/graphql/metadata.dto';

@ObjectType()
export class ProcessDocumentData {
  @Field(() => Int, { description: 'ID của document' })
  documentId: number;

  @Field(() => Int, { description: 'ID của workflow instance' })
  workflowInstanceId: number;

  @Field(() => String, { description: 'Loại action đã thực hiện' })
  actionType: string;

  @Field(() => String, { description: 'Thông báo kết quả' })
  message: string;

  @Field(() => String, { description: 'Trạng thái workflow sau khi xử lý' })
  workflowStatus: string;
}

@ObjectType()
export class ProcessDocumentOutput {
  @Field(() => Metadata, { description: 'Thông tin metadata của response' })
  metadata: Metadata;

  @Field(() => ProcessDocumentData, { description: 'Dữ liệu kết quả xử lý' })
  data: ProcessDocumentData;
}
