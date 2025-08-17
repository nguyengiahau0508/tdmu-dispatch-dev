import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskRequestService, TaskRequest } from '../../../core/services/dispatch/task-request.service';
import { DocumentCreationService, CreateDocumentFromTaskInput } from '../../../core/services/dispatch/document-creation.service';

@Component({
  selector: 'app-document-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="document-creation-container">
      <div class="header">
        <div class="header-left">
          <h2>Tạo văn bản từ công việc</h2>
          <p class="header-subtitle">Tạo văn bản dựa trên task request đã được phê duyệt</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="goBack()">
            <img src="/icons/arrow_back.svg" alt="Quay lại" style="width: 16px; height: 16px; margin-right: 8px;">
            Quay lại
          </button>
          <button class="btn btn-primary" (click)="createDocument()" [disabled]="!documentForm.valid || isSubmitting">
            <img src="/icons/document.svg" alt="Tạo văn bản" style="width: 16px; height: 16px; margin-right: 8px;">
            {{ isSubmitting ? 'Đang tạo...' : 'Tạo văn bản' }}
          </button>
        </div>
      </div>

      @if (taskRequest) {
        <div class="task-info">
          <h3>Thông tin công việc</h3>
          <div class="task-details">
            <div class="task-field">
              <label>Tiêu đề:</label>
              <span>{{ taskRequest.title }}</span>
            </div>
            <div class="task-field">
              <label>Mô tả:</label>
              <span>{{ taskRequest.description || 'Không có mô tả' }}</span>
            </div>
            <div class="task-field">
              <label>Độ ưu tiên:</label>
              <span class="priority-badge {{ taskRequest.priority.toLowerCase() }}">
                {{ getPriorityText(taskRequest.priority) }}
              </span>
            </div>
            <div class="task-field">
              <label>Hạn hoàn thành:</label>
              <span>{{ taskRequest.deadline ? formatDate(taskRequest.deadline) : 'Không có hạn' }}</span>
            </div>
            <div class="task-field">
              <label>Hướng dẫn:</label>
              <span>{{ taskRequest.instructions || 'Không có hướng dẫn' }}</span>
            </div>
            <div class="task-field">
              <label>Ghi chú:</label>
              <span>{{ taskRequest.notes || 'Không có ghi chú' }}</span>
            </div>
          </div>
        </div>

        <div class="document-form">
          <h3>Thông tin văn bản</h3>
          <form [formGroup]="documentForm" class="form">
            <div class="form-group">
              <label for="title">Tiêu đề văn bản *</label>
              <input 
                type="text" 
                id="title"
                formControlName="title" 
                placeholder="Nhập tiêu đề văn bản"
                class="form-control"
              />
              @if (documentForm.get('title')?.invalid && documentForm.get('title')?.touched) {
                <div class="error-message">Tiêu đề văn bản là bắt buộc</div>
              }
            </div>

            <div class="form-group">
              <label for="content">Nội dung văn bản *</label>
              <textarea 
                id="content"
                formControlName="content" 
                placeholder="Nhập nội dung văn bản"
                rows="8"
                class="form-control"
              ></textarea>
              @if (documentForm.get('content')?.invalid && documentForm.get('content')?.touched) {
                <div class="error-message">Nội dung văn bản là bắt buộc</div>
              }
            </div>

            <div class="form-group">
              <label for="category">Danh mục văn bản</label>
              <select id="category" formControlName="category" class="form-control">
                <option value="">Chọn danh mục</option>
                <option value="internal">Văn bản nội bộ</option>
                <option value="external">Văn bản đối ngoại</option>
                <option value="report">Báo cáo</option>
                <option value="decision">Quyết định</option>
              </select>
            </div>

            <div class="form-group">
              <label for="priority">Độ ưu tiên</label>
              <select id="priority" formControlName="priority" class="form-control">
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
                <option value="URGENT">Khẩn cấp</option>
              </select>
            </div>

            <div class="form-group">
              <label for="notes">Ghi chú</label>
              <textarea 
                id="notes"
                formControlName="notes" 
                placeholder="Ghi chú bổ sung"
                rows="3"
                class="form-control"
              ></textarea>
            </div>
          </form>
        </div>
      } @else {
        <div class="loading">
          <p>Đang tải thông tin công việc...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .document-creation-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }

    .header-left h2 {
      margin: 0 0 8px 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .header-subtitle {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .task-info {
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .task-info h3 {
      margin: 0 0 16px 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .task-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .task-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .task-field label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .task-field span {
      font-size: 0.875rem;
      color: var(--color-text-primary);
    }

    .priority-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .priority-badge.low {
      background: #d1fae5;
      color: #065f46;
    }

    .priority-badge.medium {
      background: #fef3c7;
      color: #92400e;
    }

    .priority-badge.high {
      background: #fed7d7;
      color: #c53030;
    }

    .priority-badge.urgent {
      background: #fecaca;
      color: #dc2626;
    }

    .document-form {
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
    }

    .document-form h3 {
      margin: 0 0 24px 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .form-control {
      padding: 12px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      font-size: 14px;
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
      transition: border-color 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    .form-control.invalid {
      border-color: #ef4444;
    }

    .error-message {
      font-size: 0.75rem;
      color: #ef4444;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: all 0.2s ease;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
    }

    .btn-secondary {
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      background: var(--color-background-primary);
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: var(--color-text-secondary);
    }

    @media (max-width: 768px) {
      .document-creation-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
      }

      .task-details {
        grid-template-columns: 1fr;
      }

      .header-actions {
        width: 100%;
        justify-content: stretch;
      }

      .btn {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class DocumentCreationComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private taskRequestService = inject(TaskRequestService);
  private documentCreationService = inject(DocumentCreationService);

  taskRequest: TaskRequest | null = null;
  documentForm!: FormGroup;
  isSubmitting = false;

  ngOnInit(): void {
    this.initForm();
    this.loadTaskRequest();
  }

  initForm(): void {
    this.documentForm = this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      category: [''],
      priority: ['MEDIUM'],
      notes: ['']
    });
  }

  loadTaskRequest(): void {
    const taskId = this.route.snapshot.paramMap.get('taskId');
    if (taskId) {
      this.taskRequestService.getTaskRequestById(parseInt(taskId)).subscribe({
        next: (task) => {
          this.taskRequest = task;
          // Pre-fill form with task data
          this.documentForm.patchValue({
            title: task.title,
            priority: task.priority,
            notes: task.notes || ''
          });
        },
        error: (error) => {
          console.error('Error loading task request:', error);
          alert('Không thể tải thông tin công việc. Vui lòng thử lại.');
          this.goBack();
        }
      });
    }
  }

  createDocument(): void {
    if (this.documentForm.valid && this.taskRequest) {
      this.isSubmitting = true;

      const input: CreateDocumentFromTaskInput = {
        taskRequestId: this.taskRequest.id,
        title: this.documentForm.value.title,
        content: this.documentForm.value.content,
        category: this.documentForm.value.category,
        priority: this.documentForm.value.priority,
        notes: this.documentForm.value.notes
      };

      this.documentCreationService.createDocumentFromTask(input).subscribe({
        next: (result) => {
          this.isSubmitting = false;
          if (result.success) {
            alert(`Văn bản đã được tạo thành công!\nDocument ID: ${result.documentId}\nWorkflow Instance ID: ${result.workflowInstanceId}`);
            this.goBack();
          } else {
            alert(`Có lỗi xảy ra: ${result.message}`);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating document:', error);
          alert('Có lỗi xảy ra khi tạo văn bản. Vui lòng thử lại.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/task-management']);
  }

  getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'LOW': 'Thấp',
      'MEDIUM': 'Trung bình',
      'HIGH': 'Cao',
      'URGENT': 'Khẩn cấp'
    };
    return priorityMap[priority] || priority;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
