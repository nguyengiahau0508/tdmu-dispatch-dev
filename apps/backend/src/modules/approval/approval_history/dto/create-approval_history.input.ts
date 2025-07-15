import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateApprovalHistoryInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
