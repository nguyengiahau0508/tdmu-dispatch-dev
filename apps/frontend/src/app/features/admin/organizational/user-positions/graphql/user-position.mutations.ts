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

export const END_USER_POSITION = gql`
  mutation EndUserPosition($id: Int!) {
    endUserPosition(id: $id) {
      metadata {
        message
        timestamp
        statusCode
      }
      data {
        userPosition {
          id
          startDate
          endDate
          # Thêm các field khác nếu cần (tùy thuộc vào bạn hiển thị gì)
        }
      }
    }
  }
`;