import { Resolver, Query, Mutation, Args, Int, ObjectType } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { HttpStatus } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enums';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { UserResponse } from './dto/create-user/create-user.response';
import { CreateUserInput } from './dto/create-user/create-user.input';
import { UpdateUserInput } from './dto/update-user/update-user.input';

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

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
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
