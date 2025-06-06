
export enum ErrorCode {
  PASSWORD_INCORRECT = '00000',
  FIRST_LOGIN_CHANGE_PASSWORD_REQUIRED = '00001',
  ACCOUNT_NOT_FOUND = '00002',
  ACCOUNT_INACTIVE = '00003',
  REFRESH_TOKEN_MISUSED = '00004', // Người dùng dùng refresh token sai mục đích
  // ... thêm các mã lỗi khác
}

