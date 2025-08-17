import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskAssignmentService } from '../../../core/services/dispatch/task-assignment.service';
import { UsersService } from '../../../core/services/users.service';
import { IUser } from '../../../core/interfaces/user.interface';
import { Order } from '../../../core/interfaces/page-options.interface';
import { Role } from '../../../shared/enums/role.enum';

@Component({
  selector: 'app-task-assignment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Giao việc</h3>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>

        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="modal-content">
          <div class="form-group">
            <label for="assignedToUserId">Giao cho *</label>
            <select 
              id="assignedToUserId"
              formControlName="assignedToUserId"
              class="form-control"
              [class.error]="taskForm.get('assignedToUserId')?.invalid && taskForm.get('assignedToUserId')?.touched"
            >
              <option value="">Chọn nhân viên</option>
              @for (user of availableUsers; track user.id) {
                <option [value]="user.id">{{ user.fullName }} - {{ user.email }}</option>
              }
            </select>
            @if (taskForm.get('assignedToUserId')?.invalid && taskForm.get('assignedToUserId')?.touched) {
              <div class="error-message">Vui lòng chọn nhân viên</div>
            }
          </div>

          <div class="form-group">
            <label for="taskDescription">Mô tả công việc *</label>
            <textarea 
              id="taskDescription"
              formControlName="taskDescription"
              class="form-control"
              rows="3"
              placeholder="Mô tả chi tiết công việc cần thực hiện..."
            ></textarea>
            @if (taskForm.get('taskDescription')?.invalid && taskForm.get('taskDescription')?.touched) {
              <div class="error-message">Mô tả công việc là bắt buộc</div>
            }
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="deadline">Deadline</label>
              <input 
                type="datetime-local" 
                id="deadline"
                formControlName="deadline"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="priority">Mức độ ưu tiên</label>
              <select 
                id="priority"
                formControlName="priority"
                class="form-control"
              >
                <option value="">Chọn mức độ</option>
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
                <option value="URGENT">Khẩn cấp</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="instructions">Hướng dẫn thực hiện</label>
            <textarea 
              id="instructions"
              formControlName="instructions"
              class="form-control"
              rows="3"
              placeholder="Hướng dẫn chi tiết cách thực hiện công việc..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="notes">Ghi chú</label>
            <textarea 
              id="notes"
              formControlName="notes"
              class="form-control"
              rows="2"
              placeholder="Ghi chú bổ sung..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button 
              type="button" 
              class="btn btn-secondary" 
              (click)="close()"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="taskForm.invalid || isSubmitting"
            >
              @if (isSubmitting) {
                <span class="loading-spinner"></span>
              }
              Giao việc
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-container {
      background: var(--color-background-primary);
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 24px;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--color-text-secondary);
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
    }

    .modal-content {
      padding: 0 24px 24px 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--color-text-primary);
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      font-size: 14px;
      background-color: var(--color-background-primary);
      color: var(--color-text-primary);
      transition: all 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .form-control::placeholder {
      color: var(--color-text-secondary);
    }

    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 4px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid var(--color-border);
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: var(--color-primary);
      color: var(--color-text-on-primary);
    }

    .btn-primary:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--color-primary) 80%, black);
    }

    .btn-secondary {
      background-color: var(--color-background-secondary);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: var(--color-border);
      color: var(--color-text-primary);
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .modal-container {
        width: 95%;
        margin: 20px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-actions {
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class TaskAssignmentModalComponent implements OnInit {
  @Input() documentId!: number;
  @Output() taskAssigned = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  private taskAssignmentService = inject(TaskAssignmentService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);

  taskForm!: FormGroup;
  availableUsers: IUser[] = [];
  isLoadingUsers = false;
  isSubmitting = false;

  ngOnInit(): void {
    this.initForm();
    this.loadAvailableUsers();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      assignedToUserId: ['', Validators.required],
      taskDescription: ['', Validators.required],
      deadline: [''],
      priority: [''],
      instructions: [''],
      notes: ['']
    });
  }

  private loadAvailableUsers(): void {
    this.isLoadingUsers = true;
    this.usersService.initUsersQuery({
      page: 1,
      take: 100,
      order: Order.ASC
    }).subscribe({
      next: (response) => {
        if (response && response.data && Array.isArray(response.data)) {
          // Filter users by roles that can be assigned tasks
          this.availableUsers = response.data.filter(user => 
            user.roles && Array.isArray(user.roles) && 
            (user.roles.includes(Role.DEPARTMENT_STAFF) || 
             user.roles.includes(Role.CLERK) ||
             user.roles.includes(Role.UNIVERSITY_LEADER))
          );
        }
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoadingUsers = false;
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.taskForm.value;

    const taskInput = {
      documentId: this.documentId,
      assignedToUserId: parseInt(formData.assignedToUserId),
      taskDescription: formData.taskDescription,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      priority: formData.priority || undefined,
      instructions: formData.instructions || undefined,
      notes: formData.notes || undefined
    };

    this.taskAssignmentService.assignTask(taskInput).subscribe({
      next: (result) => {
        this.taskAssigned.emit(result);
        this.isSubmitting = false;
        this.close();
      },
      error: (error) => {
        console.error('Error assigning task:', error);
        this.isSubmitting = false;
        alert('Có lỗi xảy ra khi giao việc. Vui lòng thử lại.');
      }
    });
  }

  close(): void {
    this.cancelled.emit();
  }
}
