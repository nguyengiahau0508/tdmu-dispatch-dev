import { gql } from "apollo-angular";

export const LOGIN_WITH_OTP_MUTATION = gql`
  mutation SignInWithOtp($email: String!, $otp: String!) {
    signInWithOtp(input: {
      email: $email,
      otp: $otp
    }) {
      metadata {
        statusCode
        message
      }
      data {
        accessToken
      }
    }
  }
`;

export const SENT_OTP_MUTATION = gql`
  mutation SentOtp($input: SentOtpInput!) {
    sentOtp(input: $input) {
      metadata {
        message
        statusCode
      }
      data {
        status
      }
    }
  }
`;
