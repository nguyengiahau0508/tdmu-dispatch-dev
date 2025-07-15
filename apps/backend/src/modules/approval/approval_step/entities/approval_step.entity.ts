import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ApprovalStep {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
