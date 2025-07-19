import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateWorkflowStepInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
