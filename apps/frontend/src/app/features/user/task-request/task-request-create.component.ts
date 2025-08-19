import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskRequestService, CreateTaskRequestInput } from '../../../core/services/dispatch/task-request.service';
import { UsersService } from '../../../core/services/users.service';
import { IUser } from '../../../core/interfaces/user.interface';
import { Order } from '../../../core/interfaces/page-options.interface';
import { Role } from '../../../shared/enums/role.enum';

@Component({
  selector: 'app-task-request-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="task-request-create__backdrop" (click)="close()">
      <div class="task-request-create" (click)="$event.stopPropagation()">
        <div class="task-request-create__header">
          <div class="header__content">
            <h3 class="header__title">Giao việc mới</h3>
            <p class="header__subtitle">Tạo yêu cầu giao việc cho nhân viên</p>
          </div>
          <button class="header__close-btn" (click)="close()" title="Đóng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form [formGroup]="taskRequestForm" (ngSubmit)="onSubmit()" class="task-request-create__content">
          <div class="form-section">
            <h4 class="form-section__title">Thông tin người nhận</h4>
            
            <div class="form-group">
              <label for="assignedToUserId" class="form-group__label">
                Giao cho <span class="required">*</span>
              </label>
              @if (isLoadingUsers) {
                <div class="form-group__loading">
                  <div class="loading-spinner"></div>
                  <span>Đang tải danh sách nhân viên...</span>
                </div>
              } @else {
                <select 
                  id="assignedToUserId"
                  formControlName="assignedToUserId"
                  class="form-group__select"
                  [class.error]="taskRequestForm.get('assignedToUserId')?.invalid && taskRequestForm.get('assignedToUserId')?.touched"
                >
                  <option value="">Chọn nhân viên</option>
                  @for (user of availableUsers; track user.id) {
                    <option [value]="user.id">{{ user.fullName }} - {{ user.email }}</option>
                  }
                  @if (availableUsers.length === 0) {
                    <option value="" disabled>Không có nhân viên nào khả dụng</option>
                  }
                </select>
              }
              @if (taskRequestForm.get('assignedToUserId')?.invalid && taskRequestForm.get('assignedToUserId')?.touched) {
                <div class="form-group__error">Vui lòng chọn nhân viên</div>
              }
            </div>
          </div>

          <div class="form-section">
            <h4 class="form-section__title">Thông tin công việc</h4>
            
            <div class="form-group">
              <label for="title" class="form-group__label">
                Tiêu đề công việc <span class="required">*</span>
              </label>
              <input 
                type="text"
                id="title"
                formControlName="title"
                class="form-group__input"
                placeholder="Nhập tiêu đề công việc..."
              />
              @if (taskRequestForm.get('title')?.invalid && taskRequestForm.get('title')?.touched) {
                <div class="form-group__error">Tiêu đề công việc là bắt buộc</div>
              }
            </div>

            <div class="form-group">
              <label for="description" class="form-group__label">Mô tả công việc</label>
              <textarea 
                id="description"
                formControlName="description"
                class="form-group__textarea"
                rows="3"
                placeholder="Mô tả chi tiết công việc cần thực hiện..."
              ></textarea>
              <div class="form-group__help">Mô tả rõ ràng sẽ giúp nhân viên hiểu rõ yêu cầu công việc</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="priority" class="form-group__label">Mức độ ưu tiên</label>
                <select 
                  id="priority"
                  formControlName="priority"
                  class="form-group__select"
                >
                  <option value="">Chọn mức độ</option>
                  <option value="LOW">🟢 Thấp</option>
                  <option value="MEDIUM">🟡 Trung bình</option>
                  <option value="HIGH">🟠 Cao</option>
                  <option value="URGENT">🔴 Khẩn cấp</option>
                </select>
              </div>

              <div class="form-group">
                <label for="deadline" class="form-group__label">Deadline</label>
                <input 
                  type="datetime-local" 
                  id="deadline"
                  formControlName="deadline"
                  class="form-group__input"
                />
                <div class="form-group__help">Thời hạn hoàn thành công việc</div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4 class="form-section__title">Hướng dẫn và ghi chú</h4>
            
            <div class="form-group">
              <label for="instructions" class="form-group__label">Hướng dẫn thực hiện</label>
              <textarea 
                id="instructions"
                formControlName="instructions"
                class="form-group__textarea"
                rows="3"
                placeholder="Hướng dẫn chi tiết cách thực hiện công việc..."
              ></textarea>
              <div class="form-group__help">Cung cấp hướng dẫn cụ thể để đảm bảo công việc được thực hiện đúng</div>
            </div>

            <div class="form-group">
              <label for="notes" class="form-group__label">Ghi chú</label>
              <textarea 
                id="notes"
                formControlName="notes"
                class="form-group__textarea"
                rows="2"
                placeholder="Ghi chú bổ sung..."
              ></textarea>
              <div class="form-group__help">Thông tin bổ sung hoặc lưu ý đặc biệt</div>
            </div>
          </div>

          <div class="task-request-create__actions">
            <button 
              type="button" 
              class="btn btn-secondary" 
              (click)="close()"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Hủy
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="taskRequestForm.invalid || isSubmitting"
            >
              @if (isSubmitting) {
                <div class="loading-spinner"></div>
              }
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              {{ isSubmitting ? 'Đang giao việc...' : 'Giao việc' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Backdrop ===== */
    .task-request-create__backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 1rem;
      box-sizing: border-box;
      backdrop-filter: blur(4px);
    }

    /* ===== Container chính ===== */
    .task-request-create {
      background-color: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      width: 100%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      animation: fadeIn 0.25s ease-in-out;
      border: 1px solid var(--color-border);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.98) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* ===== Header ===== */
    .task-request-create__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 2rem 2rem 1.5rem 2rem;
      border-bottom: 1px solid var(--color-border);
      background: linear-gradient(135deg, var(--color-background-primary) 0%, var(--color-background-secondary) 100%);
    }

    .header__content {
      flex: 1;
    }

    .header__title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 0.5rem 0;
      line-height: 1.2;
    }

    .header__subtitle {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.4;
    }

    .header__close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      color: var(--color-text-secondary);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 1rem;
    }

    .header__close-btn:hover {
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
      transform: scale(1.05);
    }

    /* ===== Content ===== */
    .task-request-create__content {
      padding: 2rem;
      flex: 1;
    }

    /* ===== Form Sections ===== */
    .form-section {
      margin-bottom: 2rem;
    }

    .form-section:last-child {
      margin-bottom: 0;
    }

    .form-section__title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 1.25rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--color-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-section__title::before {
      content: '';
      width: 4px;
      height: 1.1rem;
      background: var(--color-primary);
      border-radius: 2px;
    }

    /* ===== Form Groups ===== */
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-group__label {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--color-text-primary);
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }

    .required {
      color: #dc2626;
      font-weight: 600;
    }

    .form-group__input,
    .form-group__select,
    .form-group__textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
      box-sizing: border-box;
      transition: all 0.2s ease;
    }

    .form-group__input:focus,
    .form-group__select:focus,
    .form-group__textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);
      background-color: var(--color-background-primary);
    }

    .form-group__input.error,
    .form-group__select.error {
      border-color: #dc2626;
      box-shadow: 0 0 0 3px color-mix(in srgb, #dc2626 25%, transparent);
    }

    .form-group__textarea {
      resize: vertical;
      min-height: 100px;
      font-family: inherit;
    }

    .form-group__error {
      color: #dc2626;
      font-size: 0.8rem;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .form-group__error::before {
      content: '⚠️';
      font-size: 0.75rem;
    }

    .form-group__help {
      color: var(--color-text-secondary);
      font-size: 0.8rem;
      margin-top: 0.25rem;
      font-style: italic;
    }

    .form-group__loading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: var(--color-background-secondary);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      color: var(--color-text-secondary);
      font-size: 0.9rem;
    }

    /* ===== Form Row ===== */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    /* ===== Actions ===== */
    .task-request-create__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem 2rem;
      border-top: 1px solid var(--color-border);
      background: var(--color-background-secondary);
      margin: 0 -2rem -2rem -2rem;
    }

    /* ===== Buttons ===== */
    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      white-space: nowrap;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
      box-shadow: 0 2px 4px color-mix(in srgb, var(--color-primary) 30%, transparent);
    }

    .btn-primary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-primary) 90%, black);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px color-mix(in srgb, var(--color-primary) 40%, transparent);
    }

    .btn-secondary {
      background: var(--color-text-secondary);
      color: var(--color-text-on-primary);
    }

    .btn-secondary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-text-secondary) 90%, black);
      transform: translateY(-1px);
    }

    /* ===== Loading Spinner ===== */
    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-top: 2px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* ===== Responsive Design ===== */
    @media (max-width: 768px) {
      .task-request-create {
        max-width: 95%;
        margin: 0.5rem;
      }

      .task-request-create__header {
        padding: 1.5rem 1.5rem 1rem 1.5rem;
      }

      .task-request-create__content {
        padding: 1.5rem;
      }

      .task-request-create__actions {
        padding: 1rem 1.5rem;
        flex-direction: column;
        gap: 0.75rem;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .header__title {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .task-request-create__backdrop {
        padding: 0.5rem;
      }

      .task-request-create {
        max-width: 100%;
        margin: 0;
        border-radius: 8px;
      }

      .task-request-create__header {
        padding: 1rem;
      }

      .task-request-create__content {
        padding: 1rem;
      }

      .task-request-create__actions {
        padding: 1rem;
        margin: 0 -1rem -1rem -1rem;
      }
    }
  `]
})
export class TaskRequestCreateComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() createdSuccessfully = new EventEmitter<void>();

  private taskRequestService = inject(TaskRequestService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);

  taskRequestForm!: FormGroup;
  availableUsers: IUser[] = [];
  isLoadingUsers = false;
  isSubmitting = false;

  ngOnInit(): void {
    this.initForm();
    this.loadAvailableUsers();
  }

  private initForm(): void {
    this.taskRequestForm = this.fb.group({
      assignedToUserId: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      priority: [''],
      deadline: [''],
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
            (user.roles.includes(Role.CLERK) || 
             user.roles.includes(Role.DEPARTMENT_STAFF))
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
    if (this.taskRequestForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.taskRequestForm.value;

    const taskRequestInput: CreateTaskRequestInput = {
      assignedToUserId: parseInt(formData.assignedToUserId),
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority || undefined,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      instructions: formData.instructions || undefined,
      notes: formData.notes || undefined
    };

    this.taskRequestService.createTaskRequest(taskRequestInput).subscribe({
      next: (result) => {
        this.createdSuccessfully.emit();
        this.isSubmitting = false;
        this.close();
      },
      error: (error) => {
        console.error('Error creating task request:', error);
        this.isSubmitting = false;
        alert('Có lỗi xảy ra khi tạo yêu cầu giao việc. Vui lòng thử lại.');
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }
}
