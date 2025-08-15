import { gql } from 'apollo-angular';

export const WORKFLOW_STEP_MUTATION_CREATE = gql`
  mutation CreateWorkflowStep($createWorkflowStepInput: CreateWorkflowStepInput!) {
    createWorkflowStep(createWorkflowStepInput: $createWorkflowStepInput) {
      id
      name
      description
      type
      assignedRole
      orderNumber
      isActive
      templateId
      createdAt
      updatedAt
      template {
        id
        name
        description
      }
    }
  }
`;

export const WORKFLOW_STEP_MUTATION_UPDATE = gql`
  mutation UpdateWorkflowStep($updateWorkflowStepInput: UpdateWorkflowStepInput!) {
    updateWorkflowStep(updateWorkflowStepInput: $updateWorkflowStepInput) {
      id
      name
      description
      type
      assignedRole
      orderNumber
      isActive
      templateId
      createdAt
      updatedAt
      template {
        id
        name
        description
      }
    }
  }
`;

export const WORKFLOW_STEP_MUTATION_REMOVE = gql`
  mutation RemoveWorkflowStep($id: Int!) {
    removeWorkflowStep(id: $id)
  }
`;

export const WORKFLOW_STEP_MUTATION_MOVE = gql`
  mutation MoveWorkflowStep($stepId: Int!, $newOrder: Int!) {
    moveWorkflowStep(stepId: $stepId, newOrder: $newOrder) {
      id
      name
      description
      type
      assignedRole
      orderNumber
      isActive
      templateId
    }
  }
`;

export const WORKFLOW_STEP_MUTATION_DUPLICATE = gql`
  mutation DuplicateWorkflowStep($stepId: Int!) {
    duplicateWorkflowStep(stepId: $stepId) {
      id
      name
      description
      type
      assignedRole
      orderNumber
      isActive
      templateId
      createdAt
      updatedAt
    }
  }
`;

export const WORKFLOW_STEP_MUTATION_REORDER = gql`
  mutation ReorderWorkflowSteps($templateId: Int!) {
    reorderWorkflowSteps(templateId: $templateId) {
      id
      name
      description
      type
      assignedRole
      orderNumber
      isActive
      templateId
    }
  }
`;
