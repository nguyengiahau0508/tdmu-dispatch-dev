import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Metadata } from 'src/common/graphql/metadata.dto';

@ObjectType()
export class RemoveWorkflowData {
  @Field(() => Int, { description: 'ID của document' })
  documentId: number;

  @Field(() => String, { description: 'Thông báo' })
  message: string;
}

@ObjectType()
export class RemoveWorkflowOutput {
  @Field(() => Metadata, { description: 'Thông tin metadata của response' })
  metadata: Metadata;

  @Field(() => RemoveWorkflowData, { description: 'Dữ liệu trả về' })
  data: RemoveWorkflowData;
}
