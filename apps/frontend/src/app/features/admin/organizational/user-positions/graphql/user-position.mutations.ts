import { gql } from 'apollo-angular';

export const CREATE_USER_POSITION = gql`
  mutation CreateUserPosition($createUserPositionInput: CreateUserPositionInput!) {
    createUserPosition(createUserPositionInput: $createUserPositionInput) {
      metadata {
        statusCode
        message
      }
      data {
        userPosition {
          id
          userId
          positionId
        }
      }
    }
  }
`;