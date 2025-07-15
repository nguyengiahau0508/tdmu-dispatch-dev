import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ApprovalHistory {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
