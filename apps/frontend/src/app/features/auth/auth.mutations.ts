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

export const LOGOUT_MUTATION = gql`
mutation{
  logout{
    metadata{
      statusCode
      message
    }
    data{
      status
    }
  }
}
`
