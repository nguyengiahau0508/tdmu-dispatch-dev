import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { WorkflowInstance } from '../models/workflow-instance.model';
import { WorkflowActionInput } from '../models/workflow-action-input.model';

// GraphQL Queries
const GET_ALL_WORKFLOW_INSTANCES = gql`
  query GetAllWorkflowInstances {
    workflowInstances {
      id
      templateId
      template {
        id
        name
        description
      }
      documentId
      currentStepId
      currentStep {
        id
        name
        description
        type
        assignedRole
        orderNumber
      }
      status
      createdByUserId
      createdByUser {
        id
        fullName
        email
      }
      notes
      createdAt
      updatedAt
      logs {
        id
        actionType
        actionByUser {
          id
          fullName
        }
        actionAt
        note
        createdAt
      }
    }
  }
`;

const GET_MY_WORKFLOW_INSTANCES = gql`
  query GetMyWorkflowInstances {
    myWorkflowInstances {
      id
      templateId
      template {
        id
        name
        description
      }
      documentId
      currentStepId
      currentStep {
        id
        name
        description
        type
        assignedRole
        orderNumber
      }
      status
      createdByUserId
      createdByUser {
        id
        fullName
        email
      }
      notes
      createdAt
      updatedAt
      logs {
        id
        actionType
        actionByUser {
          id
          fullName
        }
        actionAt
        note
        createdAt
      }
    }
  }
`;

const GET_MY_PENDING_WORKFLOWS = gql`
  query GetMyPendingWorkflows {
    myPendingWorkflows {
      id
      templateId
      template {
        id
        name
        description
      }
      documentId
      currentStepId
      currentStep {
        id
        name
        description
        type
        assignedRole
        orderNumber
      }
      status
      createdByUserId
      createdByUser {
        id
        fullName
        email
      }
      notes
      createdAt
      updatedAt
      logs {
        id
        actionType
        actionByUser {
          id
          fullName
        }
        actionAt
        note
        createdAt
      }
    }
  }
`;

const GET_WORKFLOW_INSTANCE = gql`
  query GetWorkflowInstance($id: Int!) {
    workflowInstance(id: $id) {
      id
      templateId
      template {
        id
        name
        description
      }
      documentId
      currentStepId
      currentStep {
        id
        name
        description
        type
        assignedRole
        orderNumber
      }
      status
      createdByUserId
      createdByUser {
        id
        fullName
        email
      }
      notes
      createdAt
      updatedAt
      logs {
        id
        actionType
        actionByUser {
          id
          fullName
        }
        actionAt
        note
        createdAt
      }
    }
  }
`;

const GET_AVAILABLE_ACTIONS = gql`
  query GetAvailableActions($instanceId: Int!) {
    availableActions(instanceId: $instanceId)
  }
`;

// GraphQL Mutations
const EXECUTE_WORKFLOW_ACTION = gql`
  mutation ExecuteWorkflowAction($input: WorkflowActionInput!) {
    executeWorkflowAction(workflowActionInput: $input) {
      id
      status
      currentStepId
      currentStep {
        id
        name
        description
        type
        assignedRole
      }
      logs {
        id
        actionType
        actionByUser {
          id
          fullName
        }
        actionAt
        note
        createdAt
      }
    }
  }
`;

const CREATE_WORKFLOW_INSTANCE = gql`
  mutation CreateWorkflowInstance($input: CreateWorkflowInstanceInput!) {
    createWorkflowInstance(createWorkflowInstanceInput: $input) {
      id
      templateId
      template {
        id
        name
        description
      }
      documentId
      currentStepId
      currentStep {
        id
        name
        description
        type
        assignedRole
      }
      status
      createdByUserId
      createdByUser {
        id
        fullName
        email
      }
      notes
      createdAt
      updatedAt
    }
  }
`;

// Workflow Permissions Queries
const CHECK_WORKFLOW_PERMISSION = gql`
  query CheckWorkflowPermission($input: CheckWorkflowPermissionInput!) {
    checkWorkflowPermission(input: $input) {
      instanceId
      stepId
      actionType
      canPerform
      reason
    }
  }
`;

const CHECK_WORKFLOW_VIEW_PERMISSION = gql`
  query CheckWorkflowViewPermission($input: CheckWorkflowViewPermissionInput!) {
    checkWorkflowViewPermission(input: $input) {
      instanceId
      canView
      reason
    }
  }
`;

const GET_WORKFLOW_ROLES = gql`
  query GetWorkflowRoles {
    workflowRoles {
      value
      label
    }
  }
`;

const GET_WORKFLOW_ACTION_TYPES = gql`
  query GetWorkflowActionTypes {
    workflowActionTypes
  }
`;

const GET_ROLE_LABEL = gql`
  query GetRoleLabel($role: String!) {
    getRoleLabel(role: $role) {
      role
      label
    }
  }
`;

const GET_ACTION_TYPE_LABEL = gql`
  query GetActionTypeLabel($actionType: ActionType!) {
    getActionTypeLabel(actionType: $actionType) {
      actionType
      label
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class WorkflowApolloService {
  constructor(private apollo: Apollo) {}

  // Workflow Instances
  getAllWorkflowInstances(): Observable<WorkflowInstance[]> {
    return this.apollo.watchQuery<any>({
      query: GET_ALL_WORKFLOW_INSTANCES
    }).valueChanges.pipe(
      map(result => result.data.workflowInstances)
    );
  }

  getMyWorkflowInstances(): Observable<WorkflowInstance[]> {
    return this.apollo.watchQuery<any>({
      query: GET_MY_WORKFLOW_INSTANCES
    }).valueChanges.pipe(
      map(result => result.data.myWorkflowInstances)
    );
  }

  getMyPendingWorkflows(): Observable<WorkflowInstance[]> {
    return this.apollo.watchQuery<any>({
      query: GET_MY_PENDING_WORKFLOWS
    }).valueChanges.pipe(
      map(result => result.data.myPendingWorkflows)
    );
  }

  getWorkflowInstance(id: number): Observable<WorkflowInstance> {
    return this.apollo.watchQuery<any>({
      query: GET_WORKFLOW_INSTANCE,
      variables: { id }
    }).valueChanges.pipe(
      map(result => result.data.workflowInstance)
    );
  }

  getAvailableActions(instanceId: number): Observable<string[]> {
    return this.apollo.watchQuery<any>({
      query: GET_AVAILABLE_ACTIONS,
      variables: { instanceId }
    }).valueChanges.pipe(
      map(result => result.data.availableActions)
    );
  }

  // Workflow Actions
  executeWorkflowAction(actionInput: WorkflowActionInput): Observable<WorkflowInstance> {
    return this.apollo.mutate<any>({
      mutation: EXECUTE_WORKFLOW_ACTION,
      variables: { input: actionInput }
    }).pipe(
      map(result => result.data.executeWorkflowAction)
    );
  }

  createWorkflowInstance(input: any): Observable<WorkflowInstance> {
    return this.apollo.mutate<any>({
      mutation: CREATE_WORKFLOW_INSTANCE,
      variables: { input }
    }).pipe(
      map(result => result.data.createWorkflowInstance)
    );
  }

  // Workflow Permissions
  checkWorkflowPermission(input: {
    instanceId: number;
    stepId: number;
    actionType: string;
  }): Observable<{
    instanceId: number;
    stepId: number;
    actionType: string;
    canPerform: boolean;
    reason?: string;
  }> {
    return this.apollo.watchQuery<any>({
      query: CHECK_WORKFLOW_PERMISSION,
      variables: { input }
    }).valueChanges.pipe(
      map(result => result.data.checkWorkflowPermission)
    );
  }

  checkWorkflowViewPermission(instanceId: number): Observable<{
    instanceId: number;
    canView: boolean;
    reason?: string;
  }> {
    return this.apollo.watchQuery<any>({
      query: CHECK_WORKFLOW_VIEW_PERMISSION,
      variables: { input: { instanceId } }
    }).valueChanges.pipe(
      map(result => result.data.checkWorkflowViewPermission)
    );
  }

  getWorkflowRoles(): Observable<{ value: string; label: string }[]> {
    return this.apollo.watchQuery<any>({
      query: GET_WORKFLOW_ROLES
    }).valueChanges.pipe(
      map(result => result.data.workflowRoles)
    );
  }

  getWorkflowActionTypes(): Observable<string[]> {
    return this.apollo.watchQuery<any>({
      query: GET_WORKFLOW_ACTION_TYPES
    }).valueChanges.pipe(
      map(result => result.data.workflowActionTypes)
    );
  }

  getRoleLabel(role: string): Observable<{ role: string; label: string }> {
    return this.apollo.watchQuery<any>({
      query: GET_ROLE_LABEL,
      variables: { role }
    }).valueChanges.pipe(
      map(result => result.data.getRoleLabel)
    );
  }

  getActionTypeLabel(actionType: string): Observable<{ actionType: string; label: string }> {
    return this.apollo.watchQuery<any>({
      query: GET_ACTION_TYPE_LABEL,
      variables: { actionType }
    }).valueChanges.pipe(
      map(result => result.data.getActionTypeLabel)
    );
  }

  // Cache Management
  refetchMyPendingWorkflows(): void {
    this.apollo.client.refetchQueries({
      include: ['GetMyPendingWorkflows']
    });
  }

  refetchMyWorkflowInstances(): void {
    this.apollo.client.refetchQueries({
      include: ['GetMyWorkflowInstances']
    });
  }

  refetchWorkflowInstance(id: number): void {
    this.apollo.client.refetchQueries({
      include: [`GetWorkflowInstance`]
    });
  }
}
