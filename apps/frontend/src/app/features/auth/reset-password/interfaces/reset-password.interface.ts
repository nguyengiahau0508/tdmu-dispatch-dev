export interface IResetPasswordInput {
  newPassword: string
}

export interface IResetPasswordOutput {
  status: 'success' | 'failed'
}
