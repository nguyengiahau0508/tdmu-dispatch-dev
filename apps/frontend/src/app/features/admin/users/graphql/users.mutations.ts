
import { gql } from 'apollo-angular';

export const CREATE_USER_MUTATION = gql`
  mutation($createUserInput: CreateUserInput!, $avatarImageFile: Upload) {
    createUser(
      createUserInput: $createUserInput
      avatarImageFile: $avatarImageFile
    ) {
      metadata {
        statusCode
        message
      }
      data {
        id
        lastName
        firstName
        email
        roles
        fullName
        avatar
        isActive
      }
    }
  }
`;

// Cập nhật user
export const UPDATE_USER_MUTATION = gql`
mutation($updateUserInput: UpdateUserInput!, $avatarImageFile: Upload) {
  updateUser(
    updateUserInput: $updateUserInput
    avatarImageFile: $avatarImageFile
  ) {
    metadata {
      statusCode
      message
    }
    data {
      id
      lastName
      firstName
      email
      roles
      fullName
      avatar
      isActive
    }
  }
}
`;


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
        roles
        fullName
        avatar
        avatarFileId
      }
    }
  }
}
`

export const ADD_ROLE_MUTAION = gql`
mutation AddRole($input: AddRoleInput!) {
  addRole(input: $input) {
    metadata {
      statusCode
      message
    }
    data {
      user {
        id
        email
        roles
      }
    }
  }
}
`

export const REMOVE_ROLE_MUTAION = gql`
mutation RemoveRole($input: RemoveRoleInput!) {
  removeRole(input: $input) {
    metadata {
      statusCode
      message
    }
    data {
      user {
        id
        email
        roles
      }
    }
  }
}
`
