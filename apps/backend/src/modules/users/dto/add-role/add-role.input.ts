import { InputType, Field, Int } from '@nestjs/graphql';
import { Role } from 'src/common/enums/role.enums';

@InputType()
export class AddRoleInput {
  @Field(() => Int, { description: 'ID của user cần thêm role' })
  userId: number;

  @Field(() => Role, { description: 'Role cần thêm cho user' })
  role: Role;
} 