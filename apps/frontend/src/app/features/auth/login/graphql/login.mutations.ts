import { gql } from 'apollo-angular';

export const LOGIN_MUTATION = gql`
  mutation SignIn($email: String!, $password: String!) {
        signIn(input: {
          email: $email,
          password: $password
        }) {
          metadata {
            statusCode
            message
          }
          data {
            refreshToken
            accessToken
            user {
              fullName
            }
          }
        }
      }
`;
