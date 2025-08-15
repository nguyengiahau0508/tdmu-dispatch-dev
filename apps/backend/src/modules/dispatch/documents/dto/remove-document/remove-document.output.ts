import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RemoveDocumentOutput {
  @Field(() => Boolean, { description: 'Kết quả xóa' })
  success: boolean;
}
