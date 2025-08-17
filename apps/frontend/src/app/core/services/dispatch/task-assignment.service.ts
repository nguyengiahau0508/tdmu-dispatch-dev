import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export interface TaskAssignment {
  id: number;
  documentId: number;
  document: {
    id: number;
    title: string;
    documentType: string;
    status: string;
  };
  assignedToUser: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedByUser: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  taskDescription?: string;
  deadline?: Date;
  instructions?: string;
  notes?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export interface AssignTaskInput {
  documentId: number;
  assignedToUserId: number;
  taskDescription?: string;
  deadline?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  instructions?: string;
  notes?: string;
}

export interface TaskStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface ApiResponse<T> {
  metadata: {
    statusCode: number;
    message: string;
  };
  data: T;
}

// GraphQL Queries and Mutations
const ASSIGN_TASK = gql`
  mutation AssignTask($assignTaskInput: AssignTaskInput!) {
    assignTask(assignTaskInput: $assignTaskInput) {
      metadata {
        statusCode
        message
      }
      data {
        id
        documentId
        document {
          id
          title
          documentType
          status
        }
        assignedToUser {
          id
          firstName
          lastName
          email
        }
        assignedByUser {
          id
          firstName
          lastName
          email
        }
        taskDescription
        deadline
        instructions
        notes
        status
        assignedAt
        completedAt
        updatedAt
      }
    }
  }
`;

const GET_MY_ASSIGNED_TASKS = gql`
  query GetMyAssignedTasks {
    myAssignedTasks {
      metadata {
        statusCode
        message
      }
      data {
        id
        documentId
        document {
          id
          title
          documentType
          status
        }
        assignedToUser {
          id
          firstName
          lastName
          email
        }
        assignedByUser {
          id
          firstName
          lastName
          email
        }
        taskDescription
        deadline
        instructions
        notes
        status
        assignedAt
        completedAt
        updatedAt
      }
    }
  }
`;

const GET_TASKS_ASSIGNED_BY_ME = gql`
  query GetTasksAssignedByMe {
    tasksAssignedByMe {
      metadata {
        statusCode
        message
      }
      data {
        id
        documentId
        document {
          id
          title
          documentType
          status
        }
        assignedToUser {
          id
          firstName
          lastName
          email
        }
        assignedByUser {
          id
          firstName
          lastName
          email
        }
        taskDescription
        deadline
        instructions
        notes
        status
        assignedAt
        completedAt
        updatedAt
      }
    }
  }
`;

const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($taskId: Int!, $status: TaskStatus!) {
    updateTaskStatus(taskId: $taskId, status: $status) {
      metadata {
        statusCode
        message
      }
      data {
        id
        status
        updatedAt
      }
    }
  }
`;

const GET_TASK_STATISTICS = gql`
  query GetTaskStatistics {
    taskStatistics {
      metadata {
        statusCode
        message
      }
      data {
        total
        pending
        inProgress
        completed
        cancelled
      }
    }
  }
`;

const SEARCH_TASKS = gql`
  query SearchTasks($searchTerm: String, $status: TaskStatus, $assignedByUserId: Int) {
    searchTasks(searchTerm: $searchTerm, status: $status, assignedByUserId: $assignedByUserId) {
      metadata {
        statusCode
        message
      }
      data {
        id
        documentId
        document {
          id
          title
          documentType
          status
        }
        assignedToUser {
          id
          firstName
          lastName
          email
        }
        assignedByUser {
          id
          firstName
          lastName
          email
        }
        taskDescription
        deadline
        instructions
        notes
        status
        assignedAt
        completedAt
        updatedAt
      }
    }
  }
`;

const CANCEL_TASK = gql`
  mutation CancelTask($taskId: Int!) {
    cancelTask(taskId: $taskId) {
      metadata {
        statusCode
        message
      }
      data {
        id
        status
        updatedAt
      }
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class TaskAssignmentService {

  constructor(private apollo: Apollo) {}

  /**
   * Giao việc cho người dùng
   */
  assignTask(input: AssignTaskInput): Observable<TaskAssignment> {
    return this.apollo.mutate<{
      assignTask: ApiResponse<TaskAssignment>
    }>({
      mutation: ASSIGN_TASK,
      variables: { assignTaskInput: input },
      refetchQueries: [
        { query: GET_MY_ASSIGNED_TASKS },
        { query: GET_TASKS_ASSIGNED_BY_ME },
        { query: GET_TASK_STATISTICS }
      ]
    }).pipe(
      map(result => result.data!.assignTask.data)
    );
  }

  /**
   * Lấy danh sách task được giao cho tôi
   */
  getMyAssignedTasks(): Observable<TaskAssignment[]> {
    return this.apollo.watchQuery<{
      myAssignedTasks: ApiResponse<TaskAssignment[]>
    }>({
      query: GET_MY_ASSIGNED_TASKS
    }).valueChanges.pipe(
      map(result => result.data.myAssignedTasks.data)
    );
  }

  /**
   * Lấy danh sách task tôi đã giao cho người khác
   */
  getTasksAssignedByMe(): Observable<TaskAssignment[]> {
    return this.apollo.watchQuery<{
      tasksAssignedByMe: ApiResponse<TaskAssignment[]>
    }>({
      query: GET_TASKS_ASSIGNED_BY_ME
    }).valueChanges.pipe(
      map(result => result.data.tasksAssignedByMe.data)
    );
  }

  /**
   * Cập nhật trạng thái task
   */
  updateTaskStatus(taskId: number, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): Observable<TaskAssignment> {
    return this.apollo.mutate<{
      updateTaskStatus: ApiResponse<TaskAssignment>
    }>({
      mutation: UPDATE_TASK_STATUS,
      variables: { taskId, status },
      refetchQueries: [
        { query: GET_MY_ASSIGNED_TASKS },
        { query: GET_TASKS_ASSIGNED_BY_ME },
        { query: GET_TASK_STATISTICS }
      ]
    }).pipe(
      map(result => result.data!.updateTaskStatus.data)
    );
  }

  /**
   * Lấy thống kê task
   */
  getTaskStatistics(): Observable<TaskStatistics> {
    return this.apollo.watchQuery<{
      taskStatistics: ApiResponse<TaskStatistics>
    }>({
      query: GET_TASK_STATISTICS
    }).valueChanges.pipe(
      map(result => result.data.taskStatistics.data)
    );
  }

  /**
   * Tìm kiếm task
   */
  searchTasks(
    searchTerm?: string,
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    assignedByUserId?: number
  ): Observable<TaskAssignment[]> {
    return this.apollo.watchQuery<{
      searchTasks: ApiResponse<TaskAssignment[]>
    }>({
      query: SEARCH_TASKS,
      variables: { searchTerm, status, assignedByUserId }
    }).valueChanges.pipe(
      map(result => result.data.searchTasks.data)
    );
  }

  /**
   * Hủy task
   */
  cancelTask(taskId: number): Observable<TaskAssignment> {
    return this.apollo.mutate<{
      cancelTask: ApiResponse<TaskAssignment>
    }>({
      mutation: CANCEL_TASK,
      variables: { taskId },
      refetchQueries: [
        { query: GET_MY_ASSIGNED_TASKS },
        { query: GET_TASKS_ASSIGNED_BY_ME },
        { query: GET_TASK_STATISTICS }
      ]
    }).pipe(
      map(result => result.data!.cancelTask.data)
    );
  }

  /**
   * Helper methods
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Chờ xử lý',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Đã hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'PENDING': 'warning',
      'IN_PROGRESS': 'info',
      'COMPLETED': 'success',
      'CANCELLED': 'danger'
    };
    return colors[status] || 'secondary';
  }

  isOverdue(task: TaskAssignment): boolean {
    if (!task.deadline) return false;
    return new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';
  }

  getDaysUntilDeadline(task: TaskAssignment): number {
    if (!task.deadline) return 0;
    const deadline = new Date(task.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
