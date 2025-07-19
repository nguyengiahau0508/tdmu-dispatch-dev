import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateWorkflowTemplateInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
