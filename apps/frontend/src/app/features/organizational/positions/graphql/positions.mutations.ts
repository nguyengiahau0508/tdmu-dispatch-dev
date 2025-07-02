import { gql } from 'apollo-angular';

export const CREATE_POSITION_MUTATION = gql`
  mutation CreatePosition($createPositionInput: CreatePositionInput!) {
    createPosition(createPositionInput: $createPositionInput) {
      metadata {
        statusCode
        message
      }
      data {
        position {
          id
          positionName
        }
      }
    }
  }
`;

export const UPDATE_POSITION_MUTATION = gql`
  mutation UpdatePosition($updatePositionInput: UpdatePositionInput!) {
    updatePosition(updatePositionInput: $updatePositionInput) {
      metadata {
        statusCode
        message
      }
      data {
        position {
          id
          positionName
        }
      }
    }
  }
`;

export const REMOVE_POSITION_MUTATION = gql`
  mutation RemovePosition($id: Int!) {
    removePosition(id: $id) {
      metadata {
        statusCode
        message
      }
      data {
        success
      }
    }
  }
`;
