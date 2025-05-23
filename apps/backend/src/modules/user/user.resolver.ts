// src/modules/users/users.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UsePipes, ValidationPipe } from '@nestjs/common'; // Để sử dụng ValidationPipe
import { UsersService } from './user.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Mutation(() => User, { description: 'Create a new user' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) // Áp dụng validation
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users', description: 'Get all users' })
  // @UseGuards(JwtAuthGuard, RolesGuard) // Ví dụ về bảo vệ route
  // @Roles(Role.Admin)
  async findAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user', nullable: true, description: 'Get a single user by ID' })
  async findUserById(@Args('id', { type: () => ID }) id: string): Promise<User | null> {
    return this.usersService.findOneById(id);
  }
}
