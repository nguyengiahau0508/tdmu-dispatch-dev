import { gql } from 'apollo-angular';

export const WORKFLOW_INSTANCE_MUTATION_CREATE = gql`
  mutation CreateWorkflowInstance($createWorkflowInstanceInput: CreateWorkflowInstanceInput!) {
    createWorkflowInstance(createWorkflowInstanceInput: $createWorkflowInstanceInput) {
      id
      templateId
      documentId
      currentStepId
      status
      createdByUserId
      notes
      createdAt
      updatedAt
      template {
        id
        name
        description
        isActive
      }
      currentStep {
        id
        name
        type
        assignedRole
        orderNumber
      }
      createdByUser {
        id
        firstName
        lastName
        fullName
        email
      }
      logs {
        id
        actionType
        actionAt
        note
        metadata
        actionByUser {
          id
          firstName
          lastName
          fullName
        }
        step {
          id
          name
          type
        }
      }
    }
  }
`;

export const WORKFLOW_INSTANCE_MUTATION_UPDATE = gql`
  mutation UpdateWorkflowInstance($updateWorkflowInstanceInput: UpdateWorkflowInstanceInput!) {
    updateWorkflowInstance(updateWorkflowInstanceInput: $updateWorkflowInstanceInput) {
      id
      templateId
      documentId
      currentStepId
      status
      createdByUserId
      notes
      createdAt
      updatedAt
      template {
        id
        name
        description
        isActive
      }
      currentStep {
        id
        name
        type
        assignedRole
        orderNumber
      }
      createdByUser {
        id
        firstName
        lastName
        fullName
        email
      }
      logs {
        id
        actionType
        actionAt
        note
        metadata
        actionByUser {
          id
          firstName
          lastName
          fullName
        }
        step {
          id
          name
          type
        }
      }
    }
  }
`;

export const WORKFLOW_INSTANCE_MUTATION_REMOVE = gql`
  mutation RemoveWorkflowInstance($id: Int!) {
    removeWorkflowInstance(id: $id)
  }
`;

export const WORKFLOW_INSTANCE_MUTATION_EXECUTE_ACTION = gql`
  mutation ExecuteWorkflowAction($workflowActionInput: WorkflowActionInput!) {
    executeWorkflowAction(workflowActionInput: $workflowActionInput) {
      id
      templateId
      documentId
      currentStepId
      status
      createdByUserId
      notes
      createdAt
      updatedAt
      template {
        id
        name
        description
        isActive
      }
      currentStep {
        id
        name
        type
        assignedRole
        orderNumber
      }
      createdByUser {
        id
        firstName
        lastName
        fullName
        email
      }
      logs {
        id
        actionType
        actionAt
        note
        metadata
        actionByUser {
          id
          firstName
          lastName
          fullName
        }
        step {
          id
          name
          type
        }
      }
    }
  }
`;
