import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserPositionsService } from './user-positions.service';
import { UserPosition } from './entities/user-position.entity';
import { CreateUserPositionInput } from './dto/create-user-position.input';
import { UpdateUserPositionInput } from './dto/update-user-position.input';

@Resolver(() => UserPosition)
export class UserPositionsResolver {
  constructor(private readonly userPositionsService: UserPositionsService) {}

  @Mutation(() => UserPosition)
  createUserPosition(@Args('createUserPositionInput') createUserPositionInput: CreateUserPositionInput) {
    return this.userPositionsService.create(createUserPositionInput);
  }

  @Query(() => [UserPosition], { name: 'userPositions' })
  findAll() {
    return this.userPositionsService.findAll();
  }

  @Query(() => UserPosition, { name: 'userPosition' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.userPositionsService.findOne(id);
  }

  @Mutation(() => UserPosition)
  updateUserPosition(@Args('updateUserPositionInput') updateUserPositionInput: UpdateUserPositionInput) {
    return this.userPositionsService.update(updateUserPositionInput.id, updateUserPositionInput);
  }

  @Mutation(() => UserPosition)
  removeUserPosition(@Args('id', { type: () => Int }) id: number) {
    return this.userPositionsService.remove(id);
  }
}
