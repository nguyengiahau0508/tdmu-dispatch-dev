import { Component } from '@angular/core';
import { DepartmentsService } from '../../../../core/services/oraganizational/departments.service';
import { ToastrService } from 'ngx-toastr';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { IPageOptions, Order } from '../../../../core/interfaces/page-options.interface';
import { IGetDepartmentsPaginatedInput } from './interfaces/get-departments-paginated.interface';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { GraphQLResponseError } from '../../../../shared/models/graphql-error.model';
import { DepartmentCreate } from './components/department-create/department-create';
import { DepartmentUpdate } from './components/department-update/department-update';
import { IDepartment } from '../../../../core/interfaces/oraganizational.interface';

@Component({
  selector: 'app-departments',
  imports: [Pagination, ConfirmDialogModule, DepartmentCreate, DepartmentUpdate],
  templateUrl: './departments.html',
  styleUrl: './departments.css',
  providers: [ConfirmationService]
})
export class Departments {
 departments: IDepartment[] = [];
  totalCount = 0;
  selectedMenuId: number | null = null;

  isDepartmentCreateOpen = false;
  isDepartmentUpdateOpen = false;
  departmentUpdateSelected: null | IDepartment = null;

  pageOptions: IGetDepartmentsPaginatedInput = {
    page: 1,
    take: 10,
    order: Order.ASC
  };

  constructor(
    private departmentsService: DepartmentsService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService,
    private errorHandlerService: ErrorHandlerService
  ) {
    this.initQuery();
  }

  initQuery() {
    this.departmentsService.initDepartmentsQuery(this.pageOptions).subscribe({
      next: (response) => {
        this.departments = response.data ?? [];
        this.totalCount = response.totalCount ?? 0;
      },
      error: (err) => {
        console.log(err);
        this.toastr.error("Đã xảy ra lỗi khi tải dữ liệu");
      }
    });
  }

  refetchDepartments() {
    this.departmentsService.refetchDepartments(this.pageOptions)
  }

  toggleCreateDepartment() {
    this.isDepartmentCreateOpen = !this.isDepartmentCreateOpen;
  }

  onCreated() {
    this.refetchDepartments();
    this.toastr.success("Tạo mới thành công");
    this.isDepartmentCreateOpen = false;
  }

  onPageSizeChange(size: number) {
    this.pageOptions.take = size;
    this.refetchDepartments();
  }

  onOrderChange(order: Order) {
    this.pageOptions.order = order;
    this.refetchDepartments();
  }

  onPageChange(page: number) {
    this.pageOptions.page = page;
    this.refetchDepartments();
  }

  toggleMenu(id: number) {
    this.selectedMenuId = this.selectedMenuId === id ? null : id;
  }

  onEditDepartment(department: IDepartment) {
    this.departmentUpdateSelected = department;
    this.isDepartmentUpdateOpen = true;
  }

  onDeleteDepartment(department: IDepartment) {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn muốn xóa phòng ban "${department.name}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.departmentsService.removeDepartment(department.id).subscribe({
          next: (response) => {
            this.refetchDepartments();
            this.toastr.success("Xóa thành công");
          },
          error: (err: GraphQLResponseError) => {
           const { message } = this.errorHandlerService.extractGraphQLError(err);
            this.toastr.error(message || "Đã xảy ra lỗi khi xóa phòng ban");
          }
        });
      }
    });
  }

  onCloseUpdate() {
    this.isDepartmentUpdateOpen = false;
    this.departmentUpdateSelected = null;
  }
}
