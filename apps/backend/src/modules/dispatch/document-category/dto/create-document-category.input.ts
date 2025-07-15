import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateDocumentCategoryInput {
  @Field(() => String, { description: 'Tên nhóm văn bản' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Mô tả' })
  description?: string;
}
