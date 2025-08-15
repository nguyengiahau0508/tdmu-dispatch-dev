import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from '../create-user/create-user.input';
import { Role } from 'src/common/enums/role.enums';
import { IsOptional, IsEnum } from 'class-validator';

@InputType({ description: 'Input để cập nhật người dùng' })
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => Int, { description: 'ID của người dùng cần cập nhật' })
  id: number;

  @Field(() => [Role], { nullable: true, description: 'Danh sách vai trò mới' })
  @IsOptional()
  @IsEnum(Role, { each: true })
  roles?: Role[];

  @Field(() => String, { nullable: true, description: 'Ảnh đại diện mới' })
  @IsOptional()
  avatar?: string;
}
