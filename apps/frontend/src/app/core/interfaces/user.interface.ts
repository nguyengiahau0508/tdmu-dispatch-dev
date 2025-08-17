import { Role } from "../../shared/enums/role.enum";
import { IFile } from "./file.interface";
import { IAssignment, IUserPosition } from "./oraganizational.interface";

export interface IUser {
  id: number;
  email: string;
  // passwordHash KHÔNG NÊN được truyền ra client, nên không có trong interface này
  lastName: string;
  firstName: string;
  isActive: boolean;
  isFirstLogin: boolean;
  roles: Role[];
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  fullName?: string; // Đây là một trường tùy chọn, có thể được tạo ra ở client
  assignments: IAssignment[];
  avatarFile?: IFile;
  avatarFileId?: number;
  userPositions: IUserPosition[]; // Thêm vào đây để quản lý vị trí người dùng
  
  // Profile fields
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  jobTitle?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  isProfilePublic?: boolean;
  lastLoginAt?: Date;
  loginCount?: number;
}

