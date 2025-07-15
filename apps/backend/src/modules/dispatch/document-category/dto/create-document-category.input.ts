import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateDocumentCategoryInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
