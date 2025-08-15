import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RemoveDocumentTypeOutput {
  @Field(() => Boolean, { description: 'Kết quả xóa' })
  success: boolean;
}
