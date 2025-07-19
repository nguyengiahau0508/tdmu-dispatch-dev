import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateWorkflowActionLogInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
