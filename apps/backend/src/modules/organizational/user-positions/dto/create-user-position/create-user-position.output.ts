import { Field, ObjectType } from '@nestjs/graphql';
import { UserPosition } from '../../entities/user-position.entity';

@ObjectType()
export class CreateUserPositionOutput {
  @Field(() => UserPosition)
  userPosition: UserPosition;
}
