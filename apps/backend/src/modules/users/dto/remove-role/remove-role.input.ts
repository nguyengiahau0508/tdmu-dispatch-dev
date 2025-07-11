import { InputType, Field, Int } from '@nestjs/graphql';
import { Role } from 'src/common/enums/role.enums';

@InputType()
export class RemoveRoleInput {
  @Field(() => Int, { description: 'ID của user cần xóa role' })
  userId: number;

  @Field(() => Role, { description: 'Role cần xóa khỏi user' })
  role: Role;
} 