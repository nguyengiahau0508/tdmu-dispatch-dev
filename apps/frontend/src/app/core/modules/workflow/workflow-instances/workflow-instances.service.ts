import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  WORKFLOW_INSTANCE_QUERY_FIND_ALL,
  WORKFLOW_INSTANCE_QUERY_FIND_ONE,
  WORKFLOW_INSTANCE_QUERY_MY_INSTANCES,
  WORKFLOW_INSTANCE_QUERY_PENDING_WORKFLOWS,
  WORKFLOW_INSTANCE_QUERY_HISTORY
} from './graphqls/workflow-instances.queries';
import {
  WORKFLOW_INSTANCE_MUTATION_CREATE,
  WORKFLOW_INSTANCE_MUTATION_UPDATE,
  WORKFLOW_INSTANCE_MUTATION_REMOVE,
  WORKFLOW_INSTANCE_MUTATION_EXECUTE_ACTION
} from './graphqls/workflow-instances.mutations';
import {
  IWorkflowInstance,
  ICreateWorkflowInstanceInput,
  IUpdateWorkflowInstanceInput,
  IWorkflowActionInput,
  WorkflowStatus
} from './interfaces/workflow-instance.interfaces';

@Injectable({
  providedIn: 'root'
})
export class WorkflowInstancesService {
  private findAllQueryRef?: QueryRef<any>;

  constructor(private apollo: Apollo) {}

  // Queries
  findAll(): Observable<IWorkflowInstance[]> {
    return this.apollo.watchQuery<any>({
      query: WORKFLOW_INSTANCE_QUERY_FIND_ALL,
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map(result => result.data.workflowInstances)
    );
  }

  findOne(id: number): Observable<IWorkflowInstance> {
    return this.apollo.watchQuery<any>({
      query: WORKFLOW_INSTANCE_QUERY_FIND_ONE,
      variables: { id },
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map(result => result.data.workflowInstance)
    );
  }

  findMyInstances(): Observable<IWorkflowInstance[]> {
    return this.apollo.watchQuery<any>({
      query: WORKFLOW_INSTANCE_QUERY_MY_INSTANCES,
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map(result => result.data.myWorkflowInstances)
    );
  }

  findPendingWorkflows(): Observable<IWorkflowInstance[]> {
    return this.apollo.watchQuery<any>({
      query: WORKFLOW_INSTANCE_QUERY_PENDING_WORKFLOWS,
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map(result => result.data.pendingWorkflows)
    );
  }

  getWorkflowHistory(instanceId: number): Observable<IWorkflowInstance> {
    return this.apollo.watchQuery<any>({
      query: WORKFLOW_INSTANCE_QUERY_HISTORY,
      variables: { instanceId },
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map(result => result.data.workflowHistory)
    );
  }

  // Mutations
  create(input: ICreateWorkflowInstanceInput): Observable<IWorkflowInstance> {
    return this.apollo.mutate<any>({
      mutation: WORKFLOW_INSTANCE_MUTATION_CREATE,
      variables: { createWorkflowInstanceInput: input },
      refetchQueries: [
        { query: WORKFLOW_INSTANCE_QUERY_FIND_ALL },
        { query: WORKFLOW_INSTANCE_QUERY_MY_INSTANCES },
        { query: WORKFLOW_INSTANCE_QUERY_PENDING_WORKFLOWS }
      ]
    }).pipe(
      map(result => result.data.createWorkflowInstance)
    );
  }

  update(input: IUpdateWorkflowInstanceInput): Observable<IWorkflowInstance> {
    return this.apollo.mutate<any>({
      mutation: WORKFLOW_INSTANCE_MUTATION_UPDATE,
      variables: { updateWorkflowInstanceInput: input },
      refetchQueries: [
        { query: WORKFLOW_INSTANCE_QUERY_FIND_ALL },
        { query: WORKFLOW_INSTANCE_QUERY_MY_INSTANCES },
        { query: WORKFLOW_INSTANCE_QUERY_PENDING_WORKFLOWS }
      ]
    }).pipe(
      map(result => result.data.updateWorkflowInstance)
    );
  }

  remove(id: number): Observable<boolean> {
    return this.apollo.mutate<any>({
      mutation: WORKFLOW_INSTANCE_MUTATION_REMOVE,
      variables: { id },
      refetchQueries: [
        { query: WORKFLOW_INSTANCE_QUERY_FIND_ALL },
        { query: WORKFLOW_INSTANCE_QUERY_MY_INSTANCES },
        { query: WORKFLOW_INSTANCE_QUERY_PENDING_WORKFLOWS }
      ]
    }).pipe(
      map(result => result.data.removeWorkflowInstance)
    );
  }

  executeAction(input: IWorkflowActionInput): Observable<IWorkflowInstance> {
    return this.apollo.mutate<any>({
      mutation: WORKFLOW_INSTANCE_MUTATION_EXECUTE_ACTION,
      variables: { workflowActionInput: input },
      refetchQueries: [
        { query: WORKFLOW_INSTANCE_QUERY_FIND_ALL },
        { query: WORKFLOW_INSTANCE_QUERY_MY_INSTANCES },
        { query: WORKFLOW_INSTANCE_QUERY_PENDING_WORKFLOWS }
      ]
    }).pipe(
      map(result => result.data.executeWorkflowAction)
    );
  }

  // Helper methods
  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'IN_PROGRESS': 'Đang xử lý',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
      'REJECTED': 'Bị từ chối'
    };
    return statusLabels[status] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'IN_PROGRESS': 'status-progress',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled',
      'REJECTED': 'status-rejected'
    };
    return statusClasses[status] || 'status-default';
  }

  getActionTypeLabel(actionType: string): string {
    const actionLabels: Record<string, string> = {
      'APPROVE': 'Phê duyệt',
      'REJECT': 'Từ chối',
      'TRANSFER': 'Chuyển tiếp',
      'CANCEL': 'Hủy',
      'START': 'Bắt đầu',
      'COMPLETE': 'Hoàn thành'
    };
    return actionLabels[actionType] || actionType;
  }

  canPerformAction(userRoles: string[], stepAssignedRole: string): boolean {
    return userRoles.includes(stepAssignedRole);
  }
}
