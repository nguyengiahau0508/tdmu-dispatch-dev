import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { UsersService } from '../../../../../core/services/users.service';
import { Role } from '../../../../../shared/enums/role.enum';
import { IUser } from '../../../../../core/interfaces/user.interface';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
