import { Order } from '../../../../../core/interfaces/page-options.interface';

export interface IGetUnitsPaginatedInput {
  page: number;
  take: number;
  order: Order;
  search?: string;
  unitTypeId?: number;
  parentUnitId?: number;
} 