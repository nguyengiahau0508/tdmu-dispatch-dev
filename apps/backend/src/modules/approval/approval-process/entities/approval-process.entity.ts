import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ApprovalProcess {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
