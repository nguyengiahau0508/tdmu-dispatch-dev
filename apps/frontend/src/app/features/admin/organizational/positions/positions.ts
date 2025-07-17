import { Component } from '@angular/core';
import { PositionsService } from '../../../../core/services/oraganizational/positions.service';
import { IPosition } from '../../../../core/interfaces/oraganizational.interface';
import { ToastrService } from 'ngx-toastr';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { IGetPositionsPaginatedInput } from './interfaces/get-positions-paginated.interface';
import { Order } from '../../../../core/interfaces/page-options.interface';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { GraphQLResponseError } from '../../../../shared/models/graphql-error.model';
import { PositionCreate } from './components/position-create/position-create';
import { PositionUpdate } from './components/position-update/position-update';

@Component({
  selector: 'app-positions',
  imports: [Pagination, ConfirmDialogModule,  PositionCreate, PositionUpdate],
  templateUrl: './positions.html',
  styleUrl: './positions.css',
  providers: [ConfirmationService]
})
export class Positions {
  positions: IPosition[] = [];
  totalCount = 0;
  selectedMenuId: number | null = null;

  isPositionCreateOpen = false;
  isPositionUpdateOpen = false;
  positionUpdateSelected: null | IPosition = null;

  pageOptions: IGetPositionsPaginatedInput = {
    page: 1,
    take: 10,
    order: Order.ASC
  };

  constructor(
    private positionsService: PositionsService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService,
    private errorHandlerService: ErrorHandlerService
  ) {
    this.initQuery();
  }

  initQuery() {
    this.positionsService.initPositionsQuery(this.pageOptions).subscribe({
      next: (response) => {
        this.positions = response.data ?? [];
        this.totalCount = response.totalCount ?? 0;
      },
      error: (err) => {
        console.log(err)
        this.toastr.error("Đã xảy ra lỗi khi tải dữ liệu");
      }
    });
  }

  refetchPositions() {
    this.positionsService.refetchPositions(this.pageOptions);
  }

  togglePositionCreate() {
    this.isPositionCreateOpen = !this.isPositionCreateOpen;
  }

  onCreated() {
    this.refetchPositions();
    this.toastr.success("Tạo mới thành công");
    this.isPositionCreateOpen = false;
  }

  onPageSizeChange(size: number) {
    this.pageOptions.take = size;
    this.refetchPositions();
  }

  onOrderChange(order: Order) {
    this.pageOptions.order = order;
    this.refetchPositions();
  }

  onPageChange(page: number) {
    this.pageOptions.page = page;
    this.refetchPositions();
  }

  toggleMenu(id: number) {
    this.selectedMenuId = this.selectedMenuId === id ? null : id;
  }

  onEditPosition(position: IPosition) {
    this.positionUpdateSelected = position;
    this.isPositionUpdateOpen = true;
  }

  onDeletePosition(position: IPosition) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa chức vụ này không?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      accept: () => {
        this.positionsService.removePosition(position.id).subscribe({
          next: (res) => {
            this.refetchPositions();
            this.toastr.success(res.metadata.message);
          },
          error: (err: GraphQLResponseError) => {
            const { message } = this.errorHandlerService.extractGraphQLError(err);
            this.toastr.error(message || "Xóa thất bại");
          }
        });
      }
    });
  }

  onCloseUpdateForm() {
    this.positionUpdateSelected = null;
    this.isPositionUpdateOpen = false;
  }
}
