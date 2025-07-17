import { Order } from '../../../../core/interfaces/page-options.interface';

export interface IGetPositionsPaginatedInput {
  page: number;
  take: number;
  order: Order;
  search?: string;
} 