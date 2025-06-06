import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from '../create-user/create-user.input';

@InputType({ description: 'Input để cập nhật người dùng' })
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => Int, { description: 'ID của người dùng cần cập nhật' })
  id: number;
}

