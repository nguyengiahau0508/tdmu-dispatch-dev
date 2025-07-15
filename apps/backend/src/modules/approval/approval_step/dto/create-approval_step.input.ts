import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateApprovalStepInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
