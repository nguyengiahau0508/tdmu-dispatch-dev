import { gql } from 'apollo-angular';

export const GET_ALL_BY_USER = gql`
  query GetAllByUser($userId: Int!) {
    getAllByUser(userId: $userId) {
      metadata {
        statusCode
        message
      }
      data {
        userPositions {
          id
          userId
          startDate
          positionId
          position{
            id
            positionName
            department{
              id
              name
            }
          }
        }
      }
    }
  }
`;