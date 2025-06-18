import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UnitTypesService } from './unit-types.service';
import { UnitType } from './entities/unit-type.entity';
import { CreateUnitTypeResponse } from './dto/create-unit-type/create-unit-type.response';
import { CreateUnitTypeInput } from './dto/create-unit-type/create-unit-type.input';
import { UpdateUnitTypeResponse } from './dto/update-unit-type/update-unit-type.response';
import { UpdateUnitTypeInput } from './dto/update-unit-type/update-unit-type.input';
import { RemoveUnitTypeResponse } from './dto/remove-unit-type/remove-unit-type.response';
import { GetUnitTypeResponse } from './dto/get-unit-type/get-unit-type.response';
import { Role } from 'src/common/enums/role.enums';
import { Roles } from 'src/common/decorators/roles.decorator';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';

@Resolver(() => UnitType)
export class UnitTypesResolver {
  constructor(private readonly unitTypesService: UnitTypesService) { }

  @Mutation(() => CreateUnitTypeResponse)
  @Roles(Role.SUPER_ADMIN)
  async createUnitType(@Args('createUnitTypeInput') createUnitTypeInput: CreateUnitTypeInput): Promise<CreateUnitTypeResponse> {
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, "Tạo thành công"),
      data: await this.unitTypesService.create(createUnitTypeInput)
    }
  }

  @Query(() => [UnitType], { name: 'unitTypes' })
  findAll() {
    return this.unitTypesService.findAll();
  }

  @Query(() => GetUnitTypeResponse, { name: 'unitType' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<GetUnitTypeResponse> {
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Lấy dữ liệu thành công"),
      data: await this.unitTypesService.findOne(id)
    }
  }

  @Mutation(() => UpdateUnitTypeResponse)
  @Roles(Role.SUPER_ADMIN)
  async updateUnitType(@Args('updateUnitTypeInput') updateUnitTypeInput: UpdateUnitTypeInput): Promise<UpdateUnitTypeResponse> {
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, "Cập nhật thành công"),
      data: await this.unitTypesService.update(updateUnitTypeInput.id, updateUnitTypeInput)
    }
  }

  @Mutation(() => RemoveUnitTypeResponse)
  @Roles(Role.SUPER_ADMIN)
  async removeUnitType(@Args('id', { type: () => Int }) id: number): Promise<RemoveUnitTypeResponse> {
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, "Xóa thành công"),
      data: await this.unitTypesService.remove(id)
    }
  }
}
