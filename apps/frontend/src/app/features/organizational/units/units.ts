import { Component } from '@angular/core';
import { UnitsService } from '../../../core/services/oraganizational/units.service';
import { IUnit } from '../../../core/interfaces/oraganizational.interface';
import { ToastrService } from 'ngx-toastr';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { IGetUnitsPaginatedInput } from './interfaces/get-units-paginated.interface';
import { Order } from '../../../core/interfaces/page-options.interface';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { GraphQLResponseError } from '../../../shared/models/graphql-error.model';
import { DatePipe } from '@angular/common';
import { UnitCreate } from './components/unit-create/unit-create';
import { UnitUpdate } from './components/unit-update/unit-update';

@Component({
  selector: 'app-units',
  imports: [Pagination, ConfirmDialogModule, DatePipe, UnitCreate, UnitUpdate],
  templateUrl: './units.html',
  styleUrl: './units.css',
  providers: [ConfirmationService]
})
export class Units {
  units: IUnit[] = [];
  totalCount = 0;
  selectedMenuId: number | null = null;

  isUnitCreateOpen = false;
  isUnitUpdateOpen = false;
  unitUpdateSelected: null | IUnit = null;

  pageOptions: IGetUnitsPaginatedInput = {
    page: 1,
    take: 10,
    order: Order.ASC
  };

  constructor(
    private unitsService: UnitsService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService,
    private errorHandlerService: ErrorHandlerService
  ) {
    this.initQuery();
  }

  initQuery() {
    this.unitsService.initUnitsQuery(this.pageOptions).subscribe({
      next: (response) => {
        this.units = response.data ?? [];
        this.totalCount = response.totalCount ?? 0;
      },
      error: (err) => {
        console.log(err)
        this.toastr.error("Đã xảy ra lỗi khi tải dữ liệu");
      }
    });
  }

  refetchUnits() {
    this.unitsService.refetchUnits(this.pageOptions);
  }

  toggleUnitCreate() {
    this.isUnitCreateOpen = !this.isUnitCreateOpen;
  }

  onCreated() {
    this.refetchUnits();
    this.toastr.success("Tạo mới thành công");
    this.isUnitCreateOpen = false;
  }

  onPageSizeChange(size: number) {
    this.pageOptions.take = size;
    this.refetchUnits();
  }

  onOrderChange(order: Order) {
    this.pageOptions.order = order;
    this.refetchUnits();
  }

  onPageChange(page: number) {
    this.pageOptions.page = page;
    this.refetchUnits();
  }

  toggleMenu(id: number) {
    this.selectedMenuId = this.selectedMenuId === id ? null : id;
  }

  onEditUnit(unit: IUnit) {
    this.unitUpdateSelected = unit;
    this.isUnitUpdateOpen = true;
  }

  onDeleteUnit(unit: IUnit) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa đơn vị này không?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      accept: () => {
        this.unitsService.removeUnit(unit.id).subscribe({
          next: (res) => {
            this.refetchUnits();
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
    this.unitUpdateSelected = null
    this.isUnitUpdateOpen = false
  }
}
