import { CreateDocumentCategoryInput } from './create-document-category.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDocumentCategoryInput extends PartialType(
  CreateDocumentCategoryInput,
) {
  @Field(() => Int)
  id: number;
}
