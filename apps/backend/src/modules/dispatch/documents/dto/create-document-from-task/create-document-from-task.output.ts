import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Kết quả tạo document từ task request' })
export class CreateDocumentFromTaskOutput {
  @Field(() => Int, { description: 'ID của document được tạo' })
  documentId: number;

  @Field(() => Int, { description: 'ID của workflow instance được tạo' })
  workflowInstanceId: number;

  @Field(() => Boolean, { description: 'Trạng thái thành công' })
  success: boolean;

  @Field(() => String, { description: 'Thông báo kết quả' })
  message: string;
}
