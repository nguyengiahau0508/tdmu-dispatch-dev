import { gql } from "apollo-angular";

export const CREATE_ASSIGNMENT_MUTATION = gql`
  mutation CreateAssignment($createAssignmentInput: CreateAssignmentInput!) {
    createAssignment(createAssignmentInput: $createAssignmentInput) {
      metadata {
        statusCode
        message
        timestamp
        path
      }
      data {
        id
        userId
        positionId
        unitId
      }
    }
  }
`;

export const UPDATE_ASSIGNMENT_MUTAION = gql`
  mutation UpdateAssignment($updateAssignmentInput: UpdateAssignmentInput!) {
    updateAssignment(updateAssignmentInput: $updateAssignmentInput) {
      metadata {
        statusCode
        message
        timestamp
        path
      }
      data {
        id
        userId
        positionId
        unitId
      }
    }
  }
`;

export const REMOVE_ASSIGNMENT_MUTATION = gql`
  mutation RemoveAssignment($id: Int!) {
    removeAssignment(id: $id) {
      metadata {
        statusCode
        message
        timestamp
        path
      }
      data {
        userId
        positionId
        unitId
      }
    }
  }
`;

export const CREATE_ASSIGNMENTS_MUTATION = gql`
  mutation CreateAssignments($createAssignmentsInput: [CreateAssignmentInput!]!) {
    createAssignments(createAssignmentsInput: $createAssignmentsInput) {
      metadata {
        statusCode
        message
      }
      data {
        assignments {
          id
          userId
          positionId
          unitId
        }
      }
    }
  }
`;
