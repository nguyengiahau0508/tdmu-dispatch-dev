import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { UsersService } from '../../../../../core/services/users.service';
import { Role } from '../../../../../shared/enums/role.enum';
import { IUser } from '../../../../../core/interfaces/user.interface';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ImagePreview } from '../../../../../shared/components/image-preview/image-preview';

@Component({
  selector: 'app-user-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImagePreview],
  templateUrl: './user-roles.html',
  styleUrl: './user-roles.css'
})
export class UserRoles implements OnInit {
  @Input() isOpen = false;
  @Input({ required: true }) user!: IUser;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  allRoles = Object.values(Role);
  selectedRoles: Role[] = [];
  isLoading = false;
  rolesForm!: FormGroup;

  constructor(
    private usersService: UsersService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.rolesForm = this.fb.group({}); // form rỗng để Angular kiểm soát submit
    if (this.user) {
      this.selectedRoles = [...(this.user.roles || [])];
    }
  }

  getRoleDescription(role: Role): string {
    const descriptions: Record<Role, string> = {
      [Role.SYSTEM_ADMIN]: 'Quản trị viên hệ thống với toàn quyền truy cập',
      [Role.UNIVERSITY_LEADER]: 'Lãnh đạo cấp cao với quyền phê duyệt văn bản quan trọng',
      [Role.DEPARTMENT_HEAD]: 'Trưởng đơn vị với quyền quản lý nhân sự và phê duyệt văn bản',
      [Role.DEPARTMENT_STAFF]: 'Chuyên viên/nhân viên với quyền soạn thảo văn bản',
      [Role.CLERK]: 'Văn thư với quyền xử lý luồng văn bản và lưu trữ',
      [Role.DEGREE_MANAGER]: 'Quản lý văn bằng, chứng chỉ với quyền truy cập module phôi bằng',
      [Role.BASIC_USER]: 'Người dùng cơ bản với quyền xem thông tin cá nhân'
    };
    return descriptions[role] || 'Vai trò trong hệ thống';
  }

  onRoleChange(role: Role, checked: boolean) {
    if (checked) {
      if (!this.selectedRoles.includes(role)) {
        this.selectedRoles.push(role);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter(r => r !== role);
    }
  }

  onSubmit() {
    if (!this.user) return;
    this.isLoading = true;
    this.usersService.changeRoles(this.user.id, this.selectedRoles).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.toastr.success('Cập nhật vai trò thành công');
        this.updated.emit();
        this.onClose();
      },
      error: () => {
        this.toastr.error('Có lỗi xảy ra khi cập nhật vai trò');
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}
