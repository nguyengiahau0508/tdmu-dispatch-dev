import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';
import {
  CreateDepartmentInput,
  CreateDepartmentOutput,
  CreateDepartmentResponse,
} from './dto/create-department';
import {
  UpdateDepartmentInput,
  UpdateDepartmentOutput,
  UpdateDepartmentResponse,
} from './dto/update-department';
import {
  RemoveDepartmentInput,
  RemoveDepartmentOutput,
} from './dto/remove-department';
import {
  GetDepartmentInput,
  GetDepartmentOutput,
} from './dto/get-department';
import {
  GetDepartmentsPaginatedInput,
  GetDepartmentsPaginatedResponse,
} from './dto/get-departments-paginated';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';
import { GetDepartmentResponse } from './dto/get-department/get-department.response';
import { RemoveDepartmentResponse } from './dto/remove-department/remove-department.response';
import { GetAllDepartmentResponse } from './dto/get-all-department/get-all-department.response';

@Resolver(() => Department)
export class DepartmentsResolver {
  constructor(private readonly departmentsService: DepartmentsService) { }

  @Mutation(() => CreateDepartmentResponse)
  async createDepartment(@Args('input') input: CreateDepartmentInput): Promise<CreateDepartmentResponse> {
    const department = await this.departmentsService.create(input);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Tạo phòng ban thành công'),
      data: { department }
    };
  }

  @Query(() => GetDepartmentsPaginatedResponse, { name: 'departmentsPaginated' })
  async getDepartmentsPaginated(@Args('input') input: GetDepartmentsPaginatedInput): Promise<GetDepartmentsPaginatedResponse> {
    const pageData = await this.departmentsService.findPaginated(input);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, 'Lấy danh sách phòng ban thành công'),
      data: pageData.data,
      totalCount: pageData.meta.itemCount,
      hasNextPage: pageData.meta.hasNextPage
    };
  }

  @Query(()=>GetAllDepartmentResponse)
  async getAllDepartmentBySearch(@Args({name: 'search', type: ()=>String}) search: string): Promise<GetAllDepartmentResponse>{
    const data = await this.departmentsService.findAllDepartmentBySearch(search)
    return {
      metadata: createResponseMetadata(HttpStatus.OK, "Lấy thành công"),
      data: {departments: data}
    }
  }

  @Query(() => GetDepartmentResponse, { name: 'department' })
  async getDepartment(@Args('input') input: GetDepartmentInput): Promise<GetDepartmentResponse> {
    const department = await this.departmentsService.findOne(input.id);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, 'Lấy thông tin phòng ban thành công'),
      data: { department }
    };
  }

  @Mutation(() => UpdateDepartmentResponse)
  async updateDepartment(@Args('input') input: UpdateDepartmentInput): Promise<UpdateDepartmentResponse> {
    const department = await this.departmentsService.update(input.id, input);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Cập nhật phòng ban thành công'),
      data: { department }
    };
  }

  @Mutation(() => RemoveDepartmentResponse)
  async removeDepartment(@Args('input') input: RemoveDepartmentInput): Promise<RemoveDepartmentResponse> {
    const data = await this.departmentsService.remove(input.id);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Xóa phòng ban thành công'),
      data: { success: true }
    };
  }
}
