import { gql } from 'apollo-angular';

export const GET_ALL_BY_USER = gql`
  query GetAllByUser($userId: Int!) {
    getAllByUser(userId: $userId) {
      metadata {
        code
        message
      }
      data {
        userPositions {
          id
          userId
          positionId
        }
      }
    }
  }
`;