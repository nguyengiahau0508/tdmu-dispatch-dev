import { gql } from 'apollo-angular';

export const GET_DEPARTMENTS_PAGINATED_QUERY = gql`
  query GetDepartmentsPaginated($input: GetDepartmentsPaginatedInput!) {
    departmentsPaginated(input: $input) {
      data {
        id
        name
        description
        parentDepartmentId
        parentDepartment {
          id
          name
        }
        children {
          id
          name
        }
      }
      metadata {
        message
        timestamp
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_DEPARTMENT_QUERY = gql`
  query GetDepartment($input: GetDepartmentInput!) {
    department(input: $input) {
      department {
        id
        name
        description
        parentDepartmentId
        parentDepartment {
          id
          name
        }
        children {
          id
          name
        }
      }
    }
  }
`;


export const GET_ALL_DEPARTMENTS_BY_SEARCH = gql`
  query GetAllDepartmentsBySearch($search: String!) {
    getAllDepartmentBySearch(search: $search) {
      metadata {
        message
        timestamp
        statusCode
      }
      data {
        departments {
          id
          name
        }
      }
    }
  }
`;
