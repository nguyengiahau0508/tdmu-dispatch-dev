import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserPositionsService } from './user-positions.service';
import { UserPosition } from './entities/user-position.entity';
import { CreateUserPositionInput } from './dto/create-user-position/create-user-position.input';
import { CreateUserPositionResponse } from './dto/create-user-position/create-user-position.response';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';
import { GetAllByUserReponse } from './dto/get-all-by-user/get-all-by-user.response';

@Resolver(() => UserPosition)
export class UserPositionsResolver {
  constructor(private readonly userPositionsService: UserPositionsService) { }

  @Mutation(() => CreateUserPositionResponse)
  async createUserPosition(@Args('createUserPositionInput') createUserPositionInput: CreateUserPositionInput): Promise<CreateUserPositionResponse> {
    const result = await this.userPositionsService.create(createUserPositionInput);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Tạo thành công"),
      data: { userPosition: result }
    }
  }

  @Query(() => GetAllByUserReponse)
  async getAllByUser(@Args('userId', { type: () => Int }) userId: number): Promise<GetAllByUserReponse> {
    const userPositions = await this.userPositionsService.getAllByUser(userId)
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Lấy thành công tất cả vị trí của người dùng"),
      data: { userPositions }
    }
  }

  @Mutation(() => CreateUserPositionResponse)
  async endUserPosition(@Args('id', { type: () => Int }) id: number): Promise<CreateUserPositionResponse> {
    const userPosition = await this.userPositionsService.endUserPosition(id)
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Cập nhật thành công"),
      data: { userPosition }
    }
  }

  // @Query(() => [UserPosition], { name: 'userPositions' })
  // findAll() {
  //   return this.userPositionsService.findAll();
  // }

  // @Query(() => UserPosition, { name: 'userPosition' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.userPositionsService.findOne(id);
  // }

  // @Mutation(() => UserPosition)
  // updateUserPosition(@Args('updateUserPositionInput') updateUserPositionInput: UpdateUserPositionInput) {
  //   return this.userPositionsService.update(updateUserPositionInput.id, updateUserPositionInput);
  // }

  // @Mutation(() => UserPosition)
  // removeUserPosition(@Args('id', { type: () => Int }) id: number) {
  //   return this.userPositionsService.remove(id);
  // }
}
