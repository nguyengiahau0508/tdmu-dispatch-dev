import { gql } from 'apollo-angular';

export const WORKFLOW_TEMPLATE_QUERY_FIND_PAGINATED = gql`
  query GetWorkflowTemplatePaginated($input: GetWorkflowTemplatePaginatedInput!) {
    workflowTemplatesPaginated(input: $input) {
      data {
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
        steps {
          id
          name
          description
          type
          assignedRole
          orderNumber
          isActive
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

export const WORKFLOW_TEMPLATE_QUERY_FIND_ALL = gql`
  query GetWorkflowTemplates {
    workflowTemplates {
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
      steps {
        id
        name
        description
        type
        assignedRole
        orderNumber
        isActive
      }
    }
  }
`;

export const WORKFLOW_TEMPLATE_QUERY_FIND_ONE = gql`
  query GetWorkflowTemplate($id: Int!) {
    workflowTemplate(id: $id) {
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
      steps {
        id
        name
        description
        type
        assignedRole
        orderNumber
        isActive
      }
      instances {
        id
        templateId
        documentId
        currentStepId
        status
        createdByUserId
        notes
        createdAt
        updatedAt
      }
    }
  }
`;

export const WORKFLOW_TEMPLATE_QUERY_ACTIVE_TEMPLATES = gql`
  query GetActiveWorkflowTemplates {
    activeWorkflowTemplates {
      id
      name
      description
      isActive
      createdByUserId
      createdAt
      updatedAt
      steps {
        id
        name
        description
        type
        assignedRole
        orderNumber
        isActive
      }
    }
  }
`;

