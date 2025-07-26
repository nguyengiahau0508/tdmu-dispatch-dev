import { gql } from "apollo-angular";


export const WORKFLOW_TEMPLATE_QUERY_FIND_PAGINATED = gql`
  query GetWorkflowTemplatePaginated($input: GetWorkflowTemplatePaginatedInput!) {
    findPaginated(input: $input) {
      metadata {
        statusCode
        message
        timestamp
        path
      }
      data {
        id
        name
        description
        createdByUserId
        createdAt
      }
      totalCount
      hasNextPage
    }
  }
`

