import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateWorkflowInstanceInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
