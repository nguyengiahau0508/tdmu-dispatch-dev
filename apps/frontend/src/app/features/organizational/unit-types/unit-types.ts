
import { Component } from '@angular/core';
import { UnitTypeCreate } from './components/unit-type-create/unit-type-create';
import { UnitTypesService } from '../../../core/services/oraganizational/unit-types.service';
import { IUnitType } from '../../../core/interfaces/oraganizational.interface';
import { ToastrService } from 'ngx-toastr';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { IGetUnitTypesPaginatedInput } from './interfaces/get-unit-types-paginated.interface';
import { Order } from '../../../core/interfaces/page-options.interface';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { GraphQLResponseError } from '../../../shared/models/graphql-error.model';
import { UnitTypeUpdate } from './components/unit-type-update/unit-type-update';


@Component({
  selector: 'app-unit-types',
  imports: [UnitTypeCreate, UnitTypeUpdate, Pagination, ConfirmDialogModule],
  templateUrl: './unit-types.html',
  styleUrl: './unit-types.css',
  providers: [ConfirmationService]
})
export class UnitTypes {
  unitTypes: IUnitType[] = [];
  totalCount = 0;
  selectedMenuId: number | null = null;

  isUnitTypeCreateOpen = false;
  isUnitTypeUpdateOpen = false;
  unitTypeUpdateSelected: null | IUnitType = null

  pageOptions: IGetUnitTypesPaginatedInput = {
    page: 1,
    take: 10,
    order: Order.ASC
  };

  constructor(
    private unitTypesService: UnitTypesService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService,
    private errorHandlerService: ErrorHandlerService
  ) {
    this.initQuery();
  }

  initQuery() {
    this.unitTypesService.initUnitTypesQuery(this.pageOptions).subscribe({
      next: (response) => {
        this.unitTypes = response.data ?? [];
        this.totalCount = response.totalCount ?? 0;
      },
      error: () => {
        this.toastr.error("Đã xảy ra lỗi khi tải dữ liệu");
      }
    });
  }

  refetchUnitTypes() {
    this.unitTypesService.refetchUnitTypes(this.pageOptions);
  }

  toggleUnitTypeCreate() {
    this.isUnitTypeCreateOpen = !this.isUnitTypeCreateOpen;
  }

  onCreated() {
    this.refetchUnitTypes();
    this.toastr.success("Tạo mới thành công");
    this.isUnitTypeCreateOpen = false;
  }

  onPageSizeChange(size: number) {
    this.pageOptions.take = size;
    this.refetchUnitTypes();
  }

  onOrderChange(order: Order) {
    this.pageOptions.order = order;
    this.refetchUnitTypes();
  }

  onPageChange(page: number) {
    this.pageOptions.page = page;
    this.refetchUnitTypes();
  }

  toggleMenu(id: number) {
    this.selectedMenuId = this.selectedMenuId === id ? null : id;
  }

  onEditUnitType(type: IUnitType) {
    this.unitTypeUpdateSelected = type
    this.isUnitTypeUpdateOpen = true
  }

  onDeleteUnitType(type: IUnitType) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa mục này không?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      accept: () => {
        this.unitTypesService.removeUnitType(type.id).subscribe({
          next: (res) => {
            this.refetchUnitTypes();
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
}

