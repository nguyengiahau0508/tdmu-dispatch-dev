import { gql } from 'apollo-angular';

export const WORKFLOW_STEP_QUERY_FIND_PAGINATED = gql`
  query GetWorkflowStepPaginated($input: GetWorkflowStepPaginatedInput!) {
    workflowStepsPaginated(input: $input) {
      data {
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
      meta {
        page
        take
        itemCount
        pageCount
        hasPreviousPage
        hasNextPage
      }
    }
  }
`;

export const WORKFLOW_STEP_QUERY_FIND_ALL = gql`
  query GetWorkflowSteps {
    workflowSteps {
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

export const WORKFLOW_STEP_QUERY_FIND_ONE = gql`
  query GetWorkflowStep($id: Int!) {
    workflowStep(id: $id) {
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
      actionLogs {
        id
        actionType
        actionAt
        note
        actionByUser {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

export const WORKFLOW_STEP_QUERY_BY_TEMPLATE = gql`
  query GetWorkflowStepsByTemplate($templateId: Int!) {
    workflowStepsByTemplate(templateId: $templateId) {
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

export const WORKFLOW_STEP_QUERY_TYPES = gql`
  query GetWorkflowStepTypes {
    workflowStepTypes {
      value
      label
    }
  }
`;

export const WORKFLOW_STEP_QUERY_ROLES = gql`
  query GetWorkflowRoles {
    workflowRoles {
      value
      label
    }
  }
`;
