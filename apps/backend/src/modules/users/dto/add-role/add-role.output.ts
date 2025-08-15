import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../entities/user.entity';

@ObjectType()
export class AddRoleOutput {
  @Field(() => User, { description: 'User đã được cập nhật role' })
  user: User;
}
