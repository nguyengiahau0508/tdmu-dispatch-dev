import { Role } from "../../shared/enums/role.enum";

export interface IUser {
  id: number;
  email: string;
  // passwordHash KHÔNG NÊN được truyền ra client, nên không có trong interface này
  lastName: string;
  firstName: string;
  isActive: boolean;
  isFirstLogin: boolean;
  roles: Role[];
  avatar?: string
  createdAt: Date;
  updatedAt: Date;
  fullName?: string; // Đây là một trường tùy chọn, có thể được tạo ra ở client
}

