import { ObjectType, Field } from '@nestjs/graphql';
import { Metadata } from 'src/common/graphql/metadata.dto';

@ObjectType()
export class RemoveDocumentData {
  @Field(() => Boolean, { description: 'Kết quả xóa' })
  success: boolean;
}

@ObjectType()
export class RemoveDocumentOutput {
  @Field(() => Metadata, { description: 'Thông tin metadata của response' })
  metadata: Metadata;

  @Field(() => RemoveDocumentData, { description: 'Dữ liệu trả về' })
  data: RemoveDocumentData;
}
