
import { gql } from 'apollo-angular';

// Lấy danh sách tất cả user
export const GET_USERS_QUERY = gql` query {
  users {
    id
    lastName
    firstName
    email
    roles
    fullName
    avatar
    isActive

  }
}`;

// Lấy user theo id
export const GET_USER_BY_ID_QUERY = gql`
query($id: Int!) {
  user(id: $id) {
      id
      lastName
      firstName
      email
      roles
      fullName
      avatar
      isActive
      createdAt
      avatarFileId
  }
}
`;

// Lấy user theo vai trò
export const GET_USERS_BY_ROLE_QUERY = gql`
query($role: Role!) {
  usersByRole(role: $role) {
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
`;

// Kiểm tra email đã tồn tại
export const CHECK_EMAIL_EXISTS_QUERY = gql`
query($email: String!) {
  checkEmailExists(email: $email)
}
`;

// Lấy thống kê user
export const GET_USER_STATISTICS_QUERY = gql`
query {
  userStatistics
}
`;

// Lấy user phân trang
export const GET_USERS_PAGINATED_QUERY = gql`
query($input: GetUsersPaginatedInput!) {
  usersPaginated(input: $input) {
    metadata {
      message
      timestamp
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
      createdAt
      avatarFileId
    }
    totalCount
    hasNextPage
  }
}
`;



// Xóa (khóa) user
export const REMOVE_USER_MUTATION = gql`
mutation($id: Int!) {
  removeUser(id: $id) {
    metadata {
      statusCode
      message
    }
    data {
      id
      isActive
    }
  }
}
`;

// Đổi mật khẩu
export const CHANGE_PASSWORD_MUTATION = gql`
mutation($input: ChangePasswordInput!) {
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

// Reset mật khẩu
export const RESET_PASSWORD_MUTATION = gql`
mutation($id: Int!) {
  resetPassword(id: $id) {
    metadata {
      statusCode
      message
    }
    data {
      id
    }
  }
}
`;

// Khóa user
export const LOCK_USER_MUTATION = gql`
mutation($id: Int!) {
  lockUser(id: $id) {
    metadata {
      statusCode
      message
    }
    data {
      id
      isActive
    }
  }
}
`;

// Mở khóa user
export const UNLOCK_USER_MUTATION = gql`
mutation($id: Int!) {
  unlockUser(id: $id) {
    metadata {
      statusCode
      message
    }
    data {
      id
      isActive
    }
  }
}
`;

// Đổi vai trò user
export const CHANGE_ROLES_MUTATION = gql`
mutation($id: Int!, $roles: [Role!]!) {
  changeRoles(id: $id, roles: $roles) {
    metadata {
      statusCode
      message
    }
    data {
      id
      roles
    }
  }
}
`;

// Lấy thông tin user hiện tại
export const GET_CURRENT_USER_DATA_MUTATION = gql`
mutation {
  getCurrentUserData {
    metadata {
      statusCode
      message
    }
    data {
      user {
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
}
`;

export const GET_USER_ROLES = gql`
query GetUserRoles($userId: Int!) {
  getUserRoles(userId: $userId) {
    metadata {
      statusCode
      message
    }
    data {
      roles
    }
  }
}
`
