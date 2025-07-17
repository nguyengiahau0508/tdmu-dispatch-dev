import { gql } from 'apollo-angular';

export const CREATE_DEPARTMENT_MUTATION = gql`
  mutation CreateDepartment($input: CreateDepartmentInput!) {
    createDepartment(input: $input) {
      metadata{
        statusCode
        message
			}
      data{
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
}
`;

export const UPDATE_DEPARTMENT_MUTATION = gql`
  mutation UpdateDepartment($input: UpdateDepartmentInput!) {
    updateDepartment(input: $input) {
 			metadata{
        statusCode
        message
			}
      data{
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
}
`;

export const REMOVE_DEPARTMENT_MUTATION = gql`
  mutation RemoveDepartment($input: RemoveDepartmentInput!) {
    removeDepartment(input: $input) {
      data{
        success
			}
    }
  }
`;
