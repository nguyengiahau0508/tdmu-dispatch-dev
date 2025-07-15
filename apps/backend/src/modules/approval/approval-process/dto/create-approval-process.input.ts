import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateApprovalProcessInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
