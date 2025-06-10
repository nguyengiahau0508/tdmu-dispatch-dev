import { UserModel } from "../../../../core/models/user.model";

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  user: UserModel; // Sử dụng User interface đã được chuyển đổi cho Angular
}
