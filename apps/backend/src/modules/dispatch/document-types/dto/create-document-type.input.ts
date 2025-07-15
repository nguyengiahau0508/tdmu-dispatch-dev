import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateDocumentTypeInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
