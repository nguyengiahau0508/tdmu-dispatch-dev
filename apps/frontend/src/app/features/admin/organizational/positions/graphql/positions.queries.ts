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
  query GetAllPositions {
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
