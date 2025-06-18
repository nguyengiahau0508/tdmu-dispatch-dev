import { gql } from "apollo-angular";

export const GET_CURRENT_USER_DATA_MUTATIONS = gql`
mutation {
  getCurrentUserData{
    metadata{
      statusCode
}
    data{
      user{
        id
        lastName
        firstName
        email
        role
        fullName
        avatar
      }
    }
  }
}
`
