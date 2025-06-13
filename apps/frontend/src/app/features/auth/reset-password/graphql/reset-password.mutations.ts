
// src/graphql/mutations.ts
import { gql } from 'apollo-angular';

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      metadata {
        statusCode
        message
      }
      data {
        status
      }
    }
  }
`;

