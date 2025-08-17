import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { gql } from 'apollo-angular';

export interface TaskRequest {
  id: number;
  requestedByUserId: number;
  requestedByUser: {
    id: number;
    fullName: string;
    email: string;
  };
  assignedToUserId: number;
  assignedToUser: {
    id: number;
    fullName: string;
    email: string;
  };
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline?: string;
  instructions?: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequestInput {
  assignedToUserId: number;
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline?: string;
  instructions?: string;
  notes?: string;
}

export interface ApproveTaskRequestInput {
  taskRequestId: number;
  notes?: string;
}

export interface RejectTaskRequestInput {
  taskRequestId: number;
  rejectionReason: string;
}

const CREATE_TASK_REQUEST = gql`
  mutation CreateTaskRequest($createTaskRequestInput: CreateTaskRequestInput!) {
    createTaskRequest(createTaskRequestInput: $createTaskRequestInput) {
      id
      requestedByUserId
      requestedByUser {
        id
        fullName
        email
      }
      assignedToUserId
      assignedToUser {
        id
        fullName
        email
      }
      title
      description
      priority
      deadline
      instructions
      notes
      status
      createdAt
      updatedAt
    }
  }
`;

const APPROVE_TASK_REQUEST = gql`
  mutation ApproveTaskRequest($approveTaskRequestInput: ApproveTaskRequestInput!) {
    approveTaskRequest(approveTaskRequestInput: $approveTaskRequestInput) {
      id
      status
      approvedAt
      notes
      updatedAt
    }
  }
`;

const REJECT_TASK_REQUEST = gql`
  mutation RejectTaskRequest($rejectTaskRequestInput: RejectTaskRequestInput!) {
    rejectTaskRequest(rejectTaskRequestInput: $rejectTaskRequestInput) {
      id
      status
      rejectedAt
      rejectionReason
      updatedAt
    }
  }
`;

const CANCEL_TASK_REQUEST = gql`
  mutation CancelTaskRequest($taskRequestId: Int!) {
    cancelTaskRequest(taskRequestId: $taskRequestId) {
      id
      status
      cancelledAt
      updatedAt
    }
  }
`;

const GET_MY_TASK_REQUESTS = gql`
  query GetMyTaskRequests {
    myTaskRequests {
      id
      requestedByUserId
      requestedByUser {
        id
        fullName
        email
      }
      assignedToUserId
      assignedToUser {
        id
        fullName
        email
      }
      title
      description
      priority
      deadline
      instructions
      notes
      status
      rejectionReason
      approvedAt
      rejectedAt
      cancelledAt
      createdAt
      updatedAt
    }
  }
`;

const GET_MY_CREATED_TASK_REQUESTS = gql`
  query GetMyCreatedTaskRequests {
    myCreatedTaskRequests {
      id
      requestedByUserId
      requestedByUser {
        id
        fullName
        email
      }
      assignedToUserId
      assignedToUser {
        id
        fullName
        email
      }
      title
      description
      priority
      deadline
      instructions
      notes
      status
      rejectionReason
      approvedAt
      rejectedAt
      cancelledAt
      createdAt
      updatedAt
    }
  }
`;

const GET_TASK_REQUEST_STATISTICS = gql`
  query GetTaskRequestStatistics {
    taskRequestStatistics {
      total
      pending
      approved
      rejected
      cancelled
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class TaskRequestService {
  constructor(private apollo: Apollo) {}

  createTaskRequest(input: CreateTaskRequestInput): Observable<TaskRequest> {
    return this.apollo.mutate<{
      createTaskRequest: TaskRequest
    }>({
      mutation: CREATE_TASK_REQUEST,
      variables: { createTaskRequestInput: input }
    }).pipe(
      map(result => result.data!.createTaskRequest)
    );
  }

  approveTaskRequest(input: ApproveTaskRequestInput): Observable<TaskRequest> {
    return this.apollo.mutate<{
      approveTaskRequest: TaskRequest
    }>({
      mutation: APPROVE_TASK_REQUEST,
      variables: { approveTaskRequestInput: input }
    }).pipe(
      map(result => result.data!.approveTaskRequest)
    );
  }

  rejectTaskRequest(input: RejectTaskRequestInput): Observable<TaskRequest> {
    return this.apollo.mutate<{
      rejectTaskRequest: TaskRequest
    }>({
      mutation: REJECT_TASK_REQUEST,
      variables: { rejectTaskRequestInput: input }
    }).pipe(
      map(result => result.data!.rejectTaskRequest)
    );
  }

  cancelTaskRequest(taskRequestId: number): Observable<TaskRequest> {
    return this.apollo.mutate<{
      cancelTaskRequest: TaskRequest
    }>({
      mutation: CANCEL_TASK_REQUEST,
      variables: { taskRequestId }
    }).pipe(
      map(result => result.data!.cancelTaskRequest)
    );
  }

  getMyTaskRequests(): Observable<TaskRequest[]> {
    return this.apollo.watchQuery<{
      myTaskRequests: TaskRequest[]
    }>({
      query: GET_MY_TASK_REQUESTS
    }).valueChanges.pipe(
      map(result => result.data.myTaskRequests)
    );
  }

  getMyCreatedTaskRequests(): Observable<TaskRequest[]> {
    return this.apollo.watchQuery<{
      myCreatedTaskRequests: TaskRequest[]
    }>({
      query: GET_MY_CREATED_TASK_REQUESTS
    }).valueChanges.pipe(
      map(result => result.data.myCreatedTaskRequests)
    );
  }

  getTaskRequestStatistics(): Observable<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
  }> {
    return this.apollo.watchQuery<{
      taskRequestStatistics: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        cancelled: number;
      }
    }>({
      query: GET_TASK_REQUEST_STATISTICS
    }).valueChanges.pipe(
      map(result => result.data.taskRequestStatistics)
    );
  }

  getTaskRequestById(id: number): Observable<TaskRequest> {
    return this.apollo.watchQuery<{ taskRequest: TaskRequest }>({
      query: gql`
        query GetTaskRequestById($id: Int!) {
          taskRequest(id: $id) {
            id
            requestedByUserId
            requestedByUser {
              id
              fullName
              email
            }
            assignedToUserId
            assignedToUser {
              id
              fullName
              email
            }
            title
            description
            priority
            deadline
            instructions
            notes
            status
            rejectionReason
            approvedAt
            rejectedAt
            cancelledAt
            createdAt
            updatedAt
          }
        }
      `,
      variables: { id }
    }).valueChanges.pipe(
      map(result => result.data.taskRequest)
    );
  }
}
