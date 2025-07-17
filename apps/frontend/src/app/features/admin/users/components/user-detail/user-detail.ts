import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IUser } from '../../../../core/interfaces/user.interface';
import { ImagePreview } from '../../../../shared/components/image-preview/image-preview';
import { DatePipe } from '@angular/common';
import { UsersService } from '../../../../core/services/users.service';
import { AssignmentsService } from '../../../../core/services/oraganizational/assignments.service';
import { IAssignment } from '../../../../core/interfaces/oraganizational.interface';
import { Role } from '../../../../shared/enums/role.enum';
import { take } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [ImagePreview, DatePipe],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css'
})
export class UserDetail implements OnChanges {
  @Input() isOpen = false;
  @Input({ required: true }) userId!: number;
  @Output() close = new EventEmitter<void>();

  user: IUser | null = null;
  roles: Role[] = [];
  assignments: IAssignment[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private usersService: UsersService,
    private assignmentsService: AssignmentsService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isOpen && this.userId) {
      this.fetchAll();
    }
    if (!this.isOpen) {
      this.user = null;
      this.roles = [];
      this.assignments = [];
      this.error = null;
    }
  }

  fetchAll() {
    this.loading = true;
    this.error = null;
    this.user = null;
    this.roles = [];
    this.assignments = [];
    this.usersService.getUserById(this.userId).pipe(take(1)).subscribe({
      next: user => {
        this.user = user;
        this.fetchRoles();
        this.fetchAssignments();
      },
      error: err => {
        this.error = 'Không thể tải thông tin người dùng.';
        this.loading = false;
      }
    });
  }

  fetchRoles() {
    this.usersService.getUserRoles(this.userId).pipe(take(1)).subscribe({
      next: res => {
        this.roles = res.data?.roles || [];
      },
      error: () => {
        this.roles = [];
      }
    });
  }

  fetchAssignments() {
    this.assignmentsService.initAssignmentsByUserQuery(this.userId).pipe(take(1)).subscribe({
      next: res => {
        this.assignments = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.assignments = [];
        this.loading = false;
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}
