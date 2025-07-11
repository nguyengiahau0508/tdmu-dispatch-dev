import { Component } from '@angular/core';
import { Pagination } from '../../shared/components/pagination/pagination';
import { DatePipe } from '@angular/common';
import { IUser } from '../../core/interfaces/user.interface';
import { IGetUsersPaginatedInput } from './interfaces/get-users-paginated.interfaces';
import { Order } from '../../core/interfaces/page-options.interface';
import { UsersService } from '../../core/services/users.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { UserCreate } from './components/user-create/user-create';
import { UserUpdate } from './components/user-update/user-update';
import { ImagePreview } from '../../shared/components/image-preview/image-preview';
import { UserRoles } from './components/user-roles/user-roles';
import { UserPoitions } from './components/user-poitions/user-poitions';
import { UserDetail } from './components/user-detail/user-detail';

@Component({
  selector: 'app-users',
  imports: [Pagination, DatePipe, UserCreate, UserUpdate, ImagePreview, UserRoles, UserPoitions, UserDetail],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users {
  users: IUser[] = []
  totalCount = 0;

  isUserCreateOpen = false;
  isUserUpdateOpen = false;
  selectedUser: IUser | null = null;

  isUserRolesOpen = false;
  selectedUserRoles: IUser | null = null;
  isUserPoitionsOpen = false;
  selectedUserPoitions: IUser | null = null;

  isUserDetailOpen = false;
  selectedUserDetailId: number | null = null;

  pageOptions: IGetUsersPaginatedInput = {
    page: 1,
    take: 10,
    order: Order.ASC
  };

  selectedMenuId: number | null = null

  constructor(
    private usersService: UsersService,
    private toastr: ToastrService,
    private errorHandlerService: ErrorHandlerService
  ) {
    this.initQuery()
  }

  initQuery() {
    this.usersService.initUsersQuery(this.pageOptions).subscribe({
      next: response => {
        this.users = response.data ?? []
        this.totalCount = response.totalCount ?? 0
      },
      error: err => {
        this.toastr.error("Đã xảy ra lỗi khi tải dữ liệu");
      }
    })
  }

  refreshUsers() {
    this.usersService.refetchUsers(this.pageOptions)
  }

  onPageSizeChange(size: number) {
    this.pageOptions.take = size;
    this.refreshUsers();
  }

  onOrderChange(order: Order) {
    this.pageOptions.order = order;
    this.refreshUsers();
  }

  onPageChange(page: number) {
    this.pageOptions.page = page;
    this.refreshUsers();
  }

  toggleMenu(id: number) {
    this.selectedMenuId = this.selectedMenuId === id ? null : id;
  }

  onUpdateUser(user: IUser) {
    this.selectedUser = user;
    this.isUserUpdateOpen = true;
  }

  onDeleteUser(user: IUser) {

  }

  onViewDetailUser(user: IUser) {
    this.selectedUserDetailId = user.id;
    this.isUserDetailOpen = true;
  }

  onBlockUserAccount(user: IUser) {

  }

  onManageUserRole(user: IUser) {
    this.selectedUserRoles = user;
    this.isUserRolesOpen = true;
  }

  onManageUserPosition(user: IUser) {
    this.selectedUserPoitions = user;
    this.isUserPoitionsOpen = true;
  }

  toggleUserCreate() {
    this.isUserCreateOpen = !this.isUserCreateOpen
  }

  toggleUserUpdate() {
    this.isUserUpdateOpen = !this.isUserUpdateOpen;
    if (!this.isUserUpdateOpen) {
      this.selectedUser = null;
    }
  }

  toggleUserRoles() {
    this.isUserRolesOpen = !this.isUserRolesOpen;
    if (!this.isUserRolesOpen) {
      this.selectedUserRoles = null;
    }
  }

  toggleUserPoitions() {
    this.isUserPoitionsOpen = !this.isUserPoitionsOpen;
    if (!this.isUserPoitionsOpen) {
      this.selectedUserPoitions = null;
    }
  }

  toggleUserDetail() {
    this.isUserDetailOpen = !this.isUserDetailOpen;
    if (!this.isUserDetailOpen) {
      this.selectedUserDetailId = null;
    }
  }

  onUserUpdated() {
    this.refreshUsers();
  }

  onUserRolesUpdated() {
    this.refreshUsers();
  }

  onUserPoitionsUpdated() {
    this.refreshUsers();
  }
}
