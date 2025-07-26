import { gql } from "apollo-angular";

export const WORKFLOW_TEMPLATE_MUTATION_CREATE = gql`
  mutation CreateWorkflowTemplate($createWorkflowTemplateInput: CreateWorkflowTemplateInput!) {
    createWorkflowTemplate(createWorkflowTemplateInput: $createWorkflowTemplateInput) {
      metadata {
        statusCode
        message
      }
      data {
        workflowTemplate {
          id
          name
          description
          createdByUserId
          createdAt
        }
      }
    }
  }
`
