import { IPageOptions } from '../../../../../core/interfaces/page-options.interface';

export interface IGetDepartmentsPaginatedInput extends IPageOptions {
  search?: string;
  parentDepartmentId?: number;
} 