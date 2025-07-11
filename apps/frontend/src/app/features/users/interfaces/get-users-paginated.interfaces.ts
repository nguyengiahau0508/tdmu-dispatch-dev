import { IPageOptions } from "../../../core/interfaces/page-options.interface";
import { Role } from "../../../shared/enums/role.enum";

export interface IGetUsersPaginatedInput extends IPageOptions {
  search?: string
  role?: Role
  isActive?: boolean
}
