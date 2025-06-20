import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPageOptions, Order } from '../../../core/interfaces/page-options.interface';
import { IUnitType } from '../../../core/interfaces/oraganizational.interface';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class Pagination {
  @Input() totalCount = 0;
  @Input() pageOptions: IPageOptions = { page: 1, take: 10, order: Order.ASC };

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() orderChange = new EventEmitter<Order>();

  orders = Object.values(Order);

  get totalPages(): number {
    const pageSize = this.pageOptions.take || 10;
    return Math.ceil(this.totalCount / pageSize);
  }

  nextPage() {
    if ((this.pageOptions.page || 1) < this.totalPages) {
      this.pageChange.emit((this.pageOptions.page || 1) + 1);
    }
  }

  prevPage() {
    if ((this.pageOptions.page || 1) > 1) {
      this.pageChange.emit((this.pageOptions.page || 1) - 1);
    }
  }

  changePageSize(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = parseInt(target.value, 10);
    this.pageSizeChange.emit(value);
  }

  changeOrder(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.orderChange.emit(target.value as Order);
  }


}
