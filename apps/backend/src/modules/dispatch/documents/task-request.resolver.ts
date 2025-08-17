import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { TaskRequestService } from './task-request.service';
import { TaskRequest } from './entities/task-request.entity';
import { CreateTaskRequestInput } from './dto/create-task-request/create-task-request.input';
import { ApproveTaskRequestInput } from './dto/approve-task-request/approve-task-request.input';
import { RejectTaskRequestInput } from './dto/reject-task-request/reject-task-request.input';
import { TaskRequestStatus } from './entities/task-request.entity';
import { TaskRequestStatistics } from './dto/task-request-statistics/task-request-statistics.output';
import { CreateDocumentFromTaskInput } from './dto/create-document-from-task/create-document-from-task.input';
import { CreateDocumentFromTaskOutput } from './dto/create-document-from-task/create-document-from-task.output';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';

@Resolver(() => TaskRequest)
@UseGuards(GqlAuthGuard)
export class TaskRequestResolver {
  constructor(private readonly taskRequestService: TaskRequestService) {}

  @Mutation(() => TaskRequest, { name: 'createTaskRequest' })
  async createTaskRequest(
    @Args('createTaskRequestInput') createTaskRequestInput: CreateTaskRequestInput,
    @CurrentUser() user: User,
  ): Promise<TaskRequest> {
    return this.taskRequestService.createTaskRequest(createTaskRequestInput, user);
  }

  @Mutation(() => TaskRequest, { name: 'approveTaskRequest' })
  async approveTaskRequest(
    @Args('approveTaskRequestInput') approveTaskRequestInput: ApproveTaskRequestInput,
    @CurrentUser() user: User,
  ): Promise<TaskRequest> {
    return this.taskRequestService.approveTaskRequest(approveTaskRequestInput, user);
  }

  @Mutation(() => TaskRequest, { name: 'rejectTaskRequest' })
  async rejectTaskRequest(
    @Args('rejectTaskRequestInput') rejectTaskRequestInput: RejectTaskRequestInput,
    @CurrentUser() user: User,
  ): Promise<TaskRequest> {
    return this.taskRequestService.rejectTaskRequest(rejectTaskRequestInput, user);
  }

  @Mutation(() => TaskRequest, { name: 'cancelTaskRequest' })
  async cancelTaskRequest(
    @Args('taskRequestId', { type: () => Int }) taskRequestId: number,
    @CurrentUser() user: User,
  ): Promise<TaskRequest> {
    return this.taskRequestService.cancelTaskRequest(taskRequestId, user);
  }

  @Query(() => TaskRequest, { name: 'taskRequest' })
  async getTaskRequest(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<TaskRequest> {
    return this.taskRequestService.getTaskRequestById(id);
  }

  @Query(() => [TaskRequest], { name: 'myTaskRequests' })
  async getMyTaskRequests(
    @CurrentUser() user: User,
  ): Promise<TaskRequest[]> {
    return this.taskRequestService.getTaskRequestsAssignedToUser(user.id);
  }

  @Query(() => [TaskRequest], { name: 'myCreatedTaskRequests' })
  async getMyCreatedTaskRequests(
    @CurrentUser() user: User,
  ): Promise<TaskRequest[]> {
    return this.taskRequestService.getTaskRequestsCreatedByUser(user.id);
  }

  @Query(() => [TaskRequest], { name: 'taskRequestsByStatus' })
  async getTaskRequestsByStatus(
    @Args('status', { type: () => TaskRequestStatus }) status: TaskRequestStatus,
    @CurrentUser() user: User,
  ): Promise<TaskRequest[]> {
    return this.taskRequestService.getTaskRequestsByStatus(user.id, status);
  }

  @Query(() => TaskRequestStatistics, { name: 'taskRequestStatistics' })
  async getTaskRequestStatistics(
    @CurrentUser() user: User,
  ): Promise<TaskRequestStatistics> {
    return this.taskRequestService.getTaskRequestStatistics(user.id);
  }

  @Mutation(() => CreateDocumentFromTaskOutput, { name: 'createDocumentFromTask' })
  async createDocumentFromTask(
    @Args('input') input: CreateDocumentFromTaskInput,
    @CurrentUser() user: User,
  ): Promise<CreateDocumentFromTaskOutput> {
    return this.taskRequestService.createDocumentFromTask(input, user);
  }
}
