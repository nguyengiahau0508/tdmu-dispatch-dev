import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TaskAssignmentService } from './task-assignment.service';
import { TaskAssignment, TaskStatus } from './entities/task-assignment.entity';
import { AssignTaskInput } from './dto/assign-task/assign-task.input';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/common/enums/role.enums';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { Metadata } from 'src/common/graphql/metadata.dto';

@ObjectType()
export class TaskAssignmentResponse extends ApiResponse(TaskAssignment) {}

@ObjectType()
export class TaskStatistics {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  pending: number;

  @Field(() => Int)
  inProgress: number;

  @Field(() => Int)
  completed: number;

  @Field(() => Int)
  cancelled: number;
}

@ObjectType()
export class TaskStatisticsResponse {
  @Field(() => Metadata)
  metadata: Metadata;

  @Field(() => TaskStatistics)
  data: TaskStatistics;
}

@ObjectType()
export class TasksResponse {
  @Field(() => Metadata)
  metadata: Metadata;

  @Field(() => [TaskAssignment])
  data: TaskAssignment[];
}

// Helper function để tạo metadata
function createMetadata(statusCode: number, message: string): Metadata {
  return {
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };
}

@Resolver(() => TaskAssignment)
@UseGuards(GqlAuthGuard, RolesGuard)
export class TaskAssignmentResolver {
  constructor(private readonly taskAssignmentService: TaskAssignmentService) {}

  @Mutation(() => TaskAssignmentResponse)
  @Roles(Role.SYSTEM_ADMIN, Role.UNIVERSITY_LEADER, Role.DEPARTMENT_STAFF)
  async assignTask(
    @Args('assignTaskInput') assignTaskInput: AssignTaskInput,
    @CurrentUser() user: User,
  ): Promise<TaskAssignmentResponse> {
    try {
      const task = await this.taskAssignmentService.assignTask(assignTaskInput, user);
      return {
        metadata: createMetadata(201, 'Task assigned successfully'),
        data: task,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: null,
      };
    }
  }

  @Query(() => TasksResponse)
  async myAssignedTasks(@CurrentUser() user: User): Promise<TasksResponse> {
    try {
      const tasks = await this.taskAssignmentService.getTasksAssignedToUser(user.id);
      return {
        metadata: createMetadata(200, 'Tasks retrieved successfully'),
        data: tasks,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: [],
      };
    }
  }

  @Query(() => TasksResponse)
  async tasksAssignedByMe(@CurrentUser() user: User): Promise<TasksResponse> {
    try {
      const tasks = await this.taskAssignmentService.getTasksAssignedByUser(user.id);
      return {
        metadata: createMetadata(200, 'Tasks retrieved successfully'),
        data: tasks,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: [],
      };
    }
  }

  @Query(() => TaskAssignmentResponse)
  async taskAssignment(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<TaskAssignmentResponse> {
    try {
      const task = await this.taskAssignmentService.getTaskAssignmentById(id);
      return {
        metadata: createMetadata(200, 'Task retrieved successfully'),
        data: task,
      };
    } catch (error) {
      return {
        metadata: createMetadata(404, error.message),
        data: null,
      };
    }
  }

  @Mutation(() => TaskAssignmentResponse)
  async updateTaskStatus(
    @Args('taskId', { type: () => Int }) taskId: number,
    @Args('status') status: TaskStatus,
    @CurrentUser() user: User,
  ): Promise<TaskAssignmentResponse> {
    try {
      const task = await this.taskAssignmentService.updateTaskStatus(taskId, status, user.id);
      return {
        metadata: createMetadata(200, 'Task status updated successfully'),
        data: task,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: null,
      };
    }
  }

  @Query(() => TasksResponse)
  async tasksByStatus(
    @Args('status') status: TaskStatus,
    @CurrentUser() user: User,
  ): Promise<TasksResponse> {
    try {
      const tasks = await this.taskAssignmentService.getTasksByStatus(user.id, status);
      return {
        metadata: createMetadata(200, 'Tasks retrieved successfully'),
        data: tasks,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: [],
      };
    }
  }

  @Query(() => TaskStatisticsResponse)
  async taskStatistics(@CurrentUser() user: User): Promise<TaskStatisticsResponse> {
    try {
      const statistics = await this.taskAssignmentService.getTaskStatistics(user.id);
      return {
        metadata: createMetadata(200, 'Task statistics retrieved successfully'),
        data: statistics,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
        },
      };
    }
  }

  @Mutation(() => TaskAssignmentResponse)
  @Roles(Role.SYSTEM_ADMIN, Role.UNIVERSITY_LEADER, Role.DEPARTMENT_STAFF)
  async cancelTask(
    @Args('taskId', { type: () => Int }) taskId: number,
    @CurrentUser() user: User,
  ): Promise<TaskAssignmentResponse> {
    try {
      const task = await this.taskAssignmentService.cancelTask(taskId, user.id);
      return {
        metadata: createMetadata(200, 'Task cancelled successfully'),
        data: task,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: null,
      };
    }
  }

  @Query(() => TasksResponse)
  async searchTasks(
    @CurrentUser() user: User,
    @Args('searchTerm', { nullable: true }) searchTerm?: string,
    @Args('status', { nullable: true }) status?: TaskStatus,
    @Args('assignedByUserId', { type: () => Int, nullable: true }) assignedByUserId?: number,
  ): Promise<TasksResponse> {
    try {
      const tasks = await this.taskAssignmentService.searchTasks(
        user.id,
        searchTerm,
        status,
        assignedByUserId,
      );
      return {
        metadata: createMetadata(200, 'Tasks search completed successfully'),
        data: tasks,
      };
    } catch (error) {
      return {
        metadata: createMetadata(400, error.message),
        data: [],
      };
    }
  }
}
