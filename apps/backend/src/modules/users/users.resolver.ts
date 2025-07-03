import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { BadRequestException, HttpStatus, Req } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enums';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { UserResponse } from './dto/create-user/create-user.response';
import { CreateUserInput } from './dto/create-user/create-user.input';
import { UpdateUserInput } from './dto/update-user/update-user.input';
import { ChangePasswordResponse } from './dto/change-password/change-password.response';
import { ChangePasswordInput } from './dto/change-password/change-password.input';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { getCurrentUserDataReponse } from './dto/get-current-user-data/get-current-user-data.response';
import { GetUsersPaginatedInput } from './dto/get-users-paginated/get-users-paginated.input';
import { GetUsersPaginatedResponse } from './dto/get-users-paginated/get-users-paginated.response';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Mutation(() => UserResponse)
  @Roles(Role.SYSTEM_ADMIN)
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
    if (updated.affected == 0) throw new BadRequestException("Đổi mật khẩu thất bại")
    if (user.isFirstLogin) await this.usersService.setFalseForFistLogin(user.id)
    const message = updated.affected != 0 ? "Đổi mật khẩu thành công" : "Đổi mật khẩu thất bại"
    const httpStatus = updated.affected != 0 ? HttpStatus.ACCEPTED : HttpStatus.BAD_REQUEST
    return {
      metadata: createResponseMetadata(httpStatus, message),
      data: {
        status: updated.affected != 0 ? 'success' : 'failed'
      }
    }
  }

  @Mutation(() => getCurrentUserDataReponse)
  async getCurrentUserData(
    @CurrentUser() user: User
  ): Promise<getCurrentUserDataReponse> {
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, "Thành công"),
      data: {
        user
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

  @Mutation(() => UserResponse)
  @Roles(Role.SYSTEM_ADMIN)
  async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput): Promise<UserResponse> {
    const updatedUser = await this.usersService.update(updateUserInput.id, updateUserInput);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Cập nhật người dùng thành công'),
      data: updatedUser
    };
  }

  @Mutation(() => UserResponse)
  @Roles(Role.SYSTEM_ADMIN)
  async removeUser(@Args('id', { type: () => Int }) id: number): Promise<UserResponse> {
    const removedUser = await this.usersService.remove(id);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Khóa tài khoản người dùng thành công'),
      data: removedUser
    };
  }

  @Query(() => GetUsersPaginatedResponse, { name: 'usersPaginated' })
  async usersPaginated(@Args('input') input: GetUsersPaginatedInput): Promise<GetUsersPaginatedResponse> {
    return this.usersService.findPaginated(input);
  }

  @Mutation(() => UserResponse)
  @Roles(Role.SYSTEM_ADMIN)
  async lockUser(@Args('id', { type: () => Int }) id: number): Promise<UserResponse> {
    const user = await this.usersService.update(id, { isActive: false } as any);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Khóa tài khoản thành công'),
      data: user
    };
  }

  @Mutation(() => UserResponse)
  @Roles(Role.SYSTEM_ADMIN)
  async unlockUser(@Args('id', { type: () => Int }) id: number): Promise<UserResponse> {
    const user = await this.usersService.update(id, { isActive: true } as any);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Mở khóa tài khoản thành công'),
      data: user
    };
  }

  @Mutation(() => UserResponse)
  @Roles(Role.SYSTEM_ADMIN)
  async resetPassword(@Args('id', { type: () => Int }) id: number): Promise<UserResponse> {
    const user = await this.usersService.resetPassword(id);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Reset mật khẩu thành công'),
      data: user
    };
  }

  @Mutation(() => UserResponse)
  @Roles(Role.SYSTEM_ADMIN)
  async changeRoles(
    @Args('id', { type: () => Int }) id: number,
    @Args({ name: 'roles', type: () => [Role] }) roles: Role[]
  ): Promise<UserResponse> {
    const user = await this.usersService.changeRoles(id, roles);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Cập nhật vai trò thành công'),
      data: user
    };
  }

  @Query(() => [User], { name: 'usersByRole' })
  async usersByRole(@Args('role', { type: () => Role }) role: Role): Promise<User[]> {
    return this.usersService.findByRole(role);
  }

  @Query(() => Boolean, { name: 'checkEmailExists' })
  async checkEmailExists(@Args('email', { type: () => String }) email: string): Promise<boolean> {
    return this.usersService.checkEmailExists(email);
  }

  @Query(() => String, { name: 'userStatistics' })
  async userStatistics(): Promise<string> {
    const stats = await this.usersService.statistics();
    return JSON.stringify(stats);
  }
}
