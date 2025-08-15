import { ObjectType, Field } from '@nestjs/graphql';
import { Role } from 'src/common/enums/role.enums';

@ObjectType()
export class GetRolesOutput {
  @Field(() => [Role], { description: 'Danh sách role của user' })
  roles: Role[];
}
