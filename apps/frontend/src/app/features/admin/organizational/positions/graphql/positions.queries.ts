import { gql } from 'apollo-angular';

export const GET_POSITIONS_QUERY = gql`
  query GetPositions($input: GetPositionsPaginatedInput!) {
    positions(input: $input) {
      metadata {
        message
        timestamp
      }
      data {
        id
        positionName
      }
      totalCount
      hasNextPage
    }
  }
`;

export const GET_ALL_POSITIONS_QUERY = gql`
  query GetAllPositions{
    allPositions {
      metadata {
        message
        timestamp
      }
      data {
        id
        positionName
      }
    }
  }
`;

export const GET_POSITIONS_BY_DEPARTMENT_ID = gql`
  query GetPositionByDepartmentId($departmentId: Int!) {
    allPositionsByDepartmentId(departmentId: $departmentId) {
      metadata {
        message
        timestamp
      }
      data {
        positions {
          id
          positionName
          maxSlots
          currentSlotCount
        }
      }
    }
  }
`;
