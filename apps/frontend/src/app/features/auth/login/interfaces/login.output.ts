import { IUser } from "../../../../core/interfaces/user.model";

export interface ILoginOutput {
  accessToken: string;
  //refreshToken: string;
  user: IUser; // Sử dụng User interface đã được chuyển đổi cho Angular
}
