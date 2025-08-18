import { IUser } from "../../../../core/interfaces/user.interface";

export interface ILoginInput {
  email: string
  password: string
}


export interface ILoginOutput {
  accessToken: string;
  refreshToken?: string;
  user: IUser; // Sử dụng User interface đã được chuyển đổi cho Angular
}
