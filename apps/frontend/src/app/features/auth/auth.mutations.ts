import { gql } from "apollo-angular";

export const REFRESH_TOKEN_MUTAION = gql`
  mutation{
  refreshToken{
    metadata {
			message
    }
    data {
      accessToken
    }
  }
}
`
