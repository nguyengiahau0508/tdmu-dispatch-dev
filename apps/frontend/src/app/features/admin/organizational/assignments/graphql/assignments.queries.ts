import { gql } from "apollo-angular";

export const GET_ASSIGNMENTS_QUERY = gql`
  query GetAssignments {
    assignments {
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
        user { id name }
        position { id name }
        unit { id name }
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_ASSIGNMENT_QUERY = gql`
  query GetAssignment($id: Int!) {
    assignment(id: $id) {
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
        user { id fullName }
        position { id positionName }
        unit { id unitName}
      }
    }
  }
`;

export const GET_ASSIGNMENTS_BY_USER_QUERY = gql`
  query GetAssignmentsByUser($userId: Int!) {
    assignmentsByUser(userId: $userId) {
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
        user { id fullName }
        position { id positionName }
        unit { id unitName }
      }
      totalCount
      hasNextPage
    }
  }
`;
