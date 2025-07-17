import { CreateUserPositionInput } from './create-user-position.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserPositionInput extends PartialType(CreateUserPositionInput) {
  @Field(() => Int)
  id: number;
}
