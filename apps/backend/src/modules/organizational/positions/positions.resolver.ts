import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PositionsService } from './positions.service';
import { Position } from './entities/position.entity';
import { CreatePositionInput } from './dto/create-position/create-position.input';
import { CreatePositionResponse } from './dto/create-position/create-position.response';
import { UpdatePositionInput } from './dto/update-position/update-position.input';
import { UpdatePositionResponse } from './dto/update-position/update-position.response';
import { RemovePositionResponse } from './dto/remove-position/remove-position.response';
import { GetPositionResponse } from './dto/get-position/get-position.response';
import { GetPositionsPaginatedInput } from './dto/get-positions-paginated/get-positions-paginated.input';
import { GetPositionsPaginatedResponse } from './dto/get-positions-paginated/get-positions-paginated.response';
import { GetAllPositionsResponse } from './dto';
import { Role } from 'src/common/enums/role.enums';
import { Roles } from 'src/common/decorators/roles.decorator';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';

@Resolver(() => Position)
export class PositionsResolver {
  constructor(private readonly positionsService: PositionsService) { }

  @Mutation(() => CreatePositionResponse)
  @Roles(Role.SYSTEM_ADMIN)
  async createPosition(@Args('createPositionInput') createPositionInput: CreatePositionInput): Promise<CreatePositionResponse> {
    const position = await this.positionsService.create(createPositionInput)
    console.log(position)
    return {
      metadata: createResponseMetadata(HttpStatus.CREATED, 'Tạo chức vụ thành công'),
      data: { position },
    };
  }

  @Query(() => GetPositionsPaginatedResponse, { name: 'positions' })
  async findAll(@Args('input') input: GetPositionsPaginatedInput): Promise<GetPositionsPaginatedResponse> {
    const pageData = await this.positionsService.findPaginated(input);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, 'Lấy danh sách chức vụ thành công'),
      data: pageData.data,
      totalCount: pageData.totalCount,
      hasNextPage: pageData.hasNextPage,
    };
  }

  @Query(() => GetAllPositionsResponse, { name: 'allPositions' })
  async findAllPositions(): Promise<GetAllPositionsResponse> {
    const data = await this.positionsService.findAll();
    return {
      metadata: createResponseMetadata(HttpStatus.OK, 'Lấy tất cả chức vụ thành công'),
      data,
    };
  }

  @Query(() => GetPositionResponse, { name: 'position' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<GetPositionResponse> {
    const position = await this.positionsService.findOne(id);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, 'Lấy thông tin chức vụ thành công'),
      data: { position },
    };
  }

  @Mutation(() => UpdatePositionResponse)
  @Roles(Role.SYSTEM_ADMIN)
  async updatePosition(@Args('updatePositionInput') updatePositionInput: UpdatePositionInput): Promise<UpdatePositionResponse> {
    const position = await this.positionsService.update(updatePositionInput.id, updatePositionInput);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Cập nhật chức vụ thành công'),
      data: { position },
    };
  }

  @Mutation(() => RemovePositionResponse)
  @Roles(Role.SYSTEM_ADMIN)
  async removePosition(@Args('id', { type: () => Int }) id: number): Promise<RemovePositionResponse> {
    const result = await this.positionsService.remove(id);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Xóa chức vụ thành công'),
      data: result,
    };
  }
}
