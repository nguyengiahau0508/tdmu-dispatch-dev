export interface ILoginOtpInput {
  email: string
  otp: string
}

export interface ILoginOtpOutput {
  accessToken: string;
  refreshToken?: string;
}
