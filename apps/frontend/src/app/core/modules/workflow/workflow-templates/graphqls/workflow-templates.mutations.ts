import { gql } from "apollo-angular";

export const WORKFLOW_TEMPLATE_MUTATION_CREATE = gql`
  mutation CreateWorkflowTemplate($createWorkflowTemplateInput: CreateWorkflowTemplateInput!) {
    createWorkflowTemplate(createWorkflowTemplateInput: $createWorkflowTemplateInput) {
      id
      name
      description
      isActive
      createdByUserId
      createdAt
      updatedAt
      createdByUser {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const WORKFLOW_TEMPLATE_MUTATION_UPDATE = gql`
  mutation UpdateWorkflowTemplate($updateWorkflowTemplateInput: UpdateWorkflowTemplateInput!) {
    updateWorkflowTemplate(updateWorkflowTemplateInput: $updateWorkflowTemplateInput) {
      id
      name
      description
      isActive
      createdByUserId
      createdAt
      updatedAt
      createdByUser {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const WORKFLOW_TEMPLATE_MUTATION_REMOVE = gql`
  mutation RemoveWorkflowTemplate($id: Int!) {
    removeWorkflowTemplate(id: $id)
  }
`;
