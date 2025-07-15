import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class RemoveDocumentCategoryOutput {
  @Field(() => Boolean, { description: 'Kết quả xóa' })
  success: boolean;
} 