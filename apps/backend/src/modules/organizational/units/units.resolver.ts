import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UnitsService } from './units.service';
import { Unit } from './entities/unit.entity';
import { CreateUnitResponse } from './dto/create-unit/create-unit.response';
import { CreateUnitInput } from './dto/create-unit/create-unit.input';
import { UpdateUnitResponse } from './dto/update-unit/update-unit.response';
import { UpdateUnitInput } from './dto/update-unit/update-unit.input';
import { RemoveUnitResponse } from './dto/remove-unit/remove-unit.response';
import { GetUnitResponse } from './dto/get-unit/get-unit.response';
import { GetUnitsPaginatedResponse } from './dto/get-units-paginated/get-units-paginated.response';
import { GetUnitsPaginatedInput } from './dto/get-units-paginated/get-units-paginated.input';
import { Role } from 'src/common/enums/role.enums';
import { Roles } from 'src/common/decorators/roles.decorator';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';
import { GetAllUnitsResponse } from './dto/get-all-units.response';

@Resolver(() => Unit)
export class UnitsResolver {
  constructor(private readonly unitsService: UnitsService) { }

  @Mutation(() => CreateUnitResponse)
  @Roles(Role.SUPER_ADMIN)
  async createUnit(@Args('createUnitInput') createUnitInput: CreateUnitInput): Promise<CreateUnitResponse> {
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, "Tạo đơn vị thành công"),
      data: await this.unitsService.create(createUnitInput)
    }
  }

  @Query(() => GetUnitsPaginatedResponse, { name: 'units' })
  async findAll(@Args('input') input: GetUnitsPaginatedInput): Promise<GetUnitsPaginatedResponse> {
    const pageData = await this.unitsService.findAll(input);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Lấy danh sách đơn vị thành công"),
      data: pageData.data,
      totalCount: pageData.meta.itemCount,
      hasNextPage: pageData.meta.hasNextPage
    }
  }

  @Query(() => GetUnitResponse, { name: 'unit' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<GetUnitResponse> {
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Lấy thông tin đơn vị thành công"),
      data: await this.unitsService.findOne(id)
    }
  }

  @Mutation(() => UpdateUnitResponse)
  @Roles(Role.SUPER_ADMIN)
  async updateUnit(@Args('updateUnitInput') updateUnitInput: UpdateUnitInput): Promise<UpdateUnitResponse> {
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, "Cập nhật đơn vị thành công"),
      data: await this.unitsService.update(updateUnitInput.id, updateUnitInput)
    }
  }

  @Mutation(() => RemoveUnitResponse)
  @Roles(Role.SUPER_ADMIN)
  async removeUnit(@Args('id', { type: () => Int }) id: number): Promise<RemoveUnitResponse> {
    const data = await this.unitsService.remove(id)
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, "Xóa đơn vị thành công"),
      data: data
    }
  }

  @Query(() => GetAllUnitsResponse, { name: 'allUnits' })
  async findAllUnits(): Promise<GetAllUnitsResponse> {
    const data = await this.unitsService.findAllUnits();
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Lấy tất cả đơn vị thành công"),
      data,
    };
  }
}
