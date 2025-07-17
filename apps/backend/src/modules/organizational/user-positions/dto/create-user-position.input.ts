import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserPositionInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
