import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentInput } from './dto/create-assignment/create-assignment.input';
import { UpdateAssignmentInput } from './dto/update-assignment/update-assignment.input';
import { CreateAssignmentResponse } from './dto/create-assignment/create-assignment.response';
import { UpdateAssignmentResponse } from './dto/update-assignment/update-assignment.response';
import { RemoveAssignmentResponse } from './dto/remove-assignment/remove-assignment.response';
import { GetAssignmentResponse } from './dto/get-assignment/get-assignment.response';
import { GetAssignmentsPaginatedResponse } from './dto/get-assignments-paginated/get-assignments-paginated.response';
import { HttpStatus } from '@nestjs/common';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { CreateAssignmentsResponse } from './dto/create-assignments/create-assignments.response';

@Resolver(() => Assignment)
export class AssignmentsResolver {
  constructor(private readonly assignmentsService: AssignmentsService) { }

  @Mutation(() => CreateAssignmentResponse, { name: 'createAssignment' })
  async createAssignment(@Args('createAssignmentInput') createAssignmentInput: CreateAssignmentInput): Promise<CreateAssignmentResponse> {
    const assignment = await this.assignmentsService.create(createAssignmentInput);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Tạo phân công thành công'),
      data: assignment
    };
  }


  @Mutation(() => CreateAssignmentsResponse, { name: 'createAssignments' })
  async createAssignments(
    @Args('createAssignmentsInput', { type: () => [CreateAssignmentInput] })
    createAssignmentsInput: CreateAssignmentInput[],
  ): Promise<CreateAssignmentsResponse> {
    const assignments = await this.assignmentsService.createMany(createAssignmentsInput);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, "Tạo nhiều phân công thành công"),
      data: {
        assignments
      }
    };
  }

  @Query(() => GetAssignmentsPaginatedResponse, { name: 'assignments' })
  async findAll(): Promise<GetAssignmentsPaginatedResponse> {
    const data = await this.assignmentsService.findAll();
    return {
      metadata: createResponseMetadata(HttpStatus.OK, 'Lấy danh sách phân công thành công'),
      data,
      totalCount: data.length,
      hasNextPage: false // Nếu có phân trang thực sự thì sửa lại
    };
  }

  @Query(() => GetAssignmentsPaginatedResponse, { name: 'assignmentsByUser' })
  async findByUserId(@Args('userId', { type: () => Int }) userId: number): Promise<GetAssignmentsPaginatedResponse> {
    const data = await this.assignmentsService.findByUserId(userId);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, 'Lấy danh sách phân công theo user thành công'),
      data,
      totalCount: data.length,
      hasNextPage: false
    };
  }

  @Query(() => GetAssignmentResponse, { name: 'assignment' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<GetAssignmentResponse> {
    const assignment = await this.assignmentsService.findOne(id);
    return {
      metadata: createResponseMetadata(HttpStatus.OK, 'Lấy thông tin phân công thành công'),
      data: assignment
    };
  }

  @Mutation(() => UpdateAssignmentResponse, { name: 'updateAssignment' })
  async updateAssignment(@Args('updateAssignmentInput') updateAssignmentInput: UpdateAssignmentInput): Promise<UpdateAssignmentResponse> {
    const assignment = await this.assignmentsService.update(updateAssignmentInput.id, updateAssignmentInput);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Cập nhật phân công thành công'),
      data: assignment
    };
  }

  @Mutation(() => RemoveAssignmentResponse, { name: 'removeAssignment' })
  async removeAssignment(@Args('id', { type: () => Int }) id: number): Promise<RemoveAssignmentResponse> {
    const assignment = await this.assignmentsService.remove(id);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, 'Xóa phân công thành công'),
      data: assignment
    };
  }
}
