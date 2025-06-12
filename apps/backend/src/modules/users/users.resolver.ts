import { Resolver, Query, Mutation, Args, Int, ObjectType } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { HttpStatus, Req } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enums';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { UserResponse } from './dto/create-user/create-user.response';
import { CreateUserInput } from './dto/create-user/create-user.input';
import { UpdateUserInput } from './dto/update-user/update-user.input';
import { ChangePasswordResponse } from './dto/change-password/change-password.response';
import { ChangePasswordInput } from './dto/change-password/change-password.input';
import { CurrentUser } from 'src/common/decorators/user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Mutation(() => UserResponse)
  @Roles(Role.SUPER_ADMIN)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<UserResponse> {
    const newUser = await this.usersService.create(createUserInput)
    return {
      metadata: createResponseMetadata(HttpStatus.CREATED, "Người dùng đã được tạo thành công"),
      data: newUser
    }
  }

  @Mutation(() => ChangePasswordResponse)
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @CurrentUser() user: User
  ): Promise<ChangePasswordResponse> {
    const updated = await this.usersService.changePassword(user.id, input.newPassword)
    const message = updated.affected != 0 ? "Đổi mật khẩu thành công" : "Đổi mật khẩu thất bại"
    const httpStatus = updated.affected != 0 ? HttpStatus.ACCEPTED : HttpStatus.BAD_REQUEST
    return {
      metadata: createResponseMetadata(httpStatus, message),
      data: {
        status: updated.affected != 0 ? 'success' : 'failed'
      }
    }
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }
}
