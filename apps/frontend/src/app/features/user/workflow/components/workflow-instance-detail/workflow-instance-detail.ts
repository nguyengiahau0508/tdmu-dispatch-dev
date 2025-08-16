import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowApolloService } from '../../services/workflow-apollo.service';
import { WorkflowNavigationService } from '../../services/workflow-navigation.service';
import { WorkflowInstance } from '../../models/workflow-instance.model';
import { WorkflowActionInput } from '../../models/workflow-action-input.model';

@Component({
  selector: 'app-workflow-instance-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [WorkflowApolloService],
  template: `
    <div class="workflow-detail">
      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải thông tin workflow...</p>
        </div>
      } @else if (error) {
        <div class="error-state">
          <h3>Lỗi</h3>
          <p>{{ error }}</p>
          <button class="btn btn-primary" (click)="goBack()">Quay lại</button>
        </div>
      } @else if (workflowInstance) {
        <div class="detail-content">
          <div class="detail-header">
            <h3>Chi tiết quy trình #{{ workflowInstance.id }}</h3>
            <div class="header-actions">
              <button class="btn btn-secondary" (click)="goBack()">Quay lại</button>
              @if (workflowInstance.currentStep) {
                <button class="btn btn-primary" (click)="goToProcess()">Xử lý ngay</button>
              }
            </div>
          </div>
        
                  <div class="detail-body">
            <div class="info-section">
              <h4>Thông tin cơ bản</h4>
              <div class="info-grid">
                <div class="info-item">
                  <label>Mẫu quy trình:</label>
                  <span>{{ workflowInstance.template.name }}</span>
                </div>
                <div class="info-item">
                  <label>Trạng thái:</label>
                  <span class="status-badge" [class]="getStatusClass(workflowInstance.status)">
                    {{ getStatusLabel(workflowInstance.status) }}
                  </span>
                </div>
                <div class="info-item">
                  <label>Người tạo:</label>
                  <span>{{ workflowInstance.createdByUser.fullName }}</span>
                </div>
              </div>
            </div>

            @if (workflowInstance.currentStep) {
              <div class="info-section">
                <h4>Bước hiện tại</h4>
                <div class="current-step">
                  <h5>{{ workflowInstance.currentStep.name }}</h5>
                  <p>{{ workflowInstance.currentStep.description }}</p>
                  
                  @if (canPerformAction(workflowInstance.currentStep.assignedRole)) {
                    <form [formGroup]="actionForm" (ngSubmit)="onSubmitAction()">
                      <div class="form-group">
                        <label>Hành động</label>
                        <select formControlName="actionType" class="form-control">
                          <option value="">Chọn hành động</option>
                          <option value="APPROVE">Phê duyệt</option>
                          <option value="REJECT">Từ chối</option>
                        </select>
                      </div>
                      
                      <div class="form-group">
                        <label>Ghi chú</label>
                        <textarea formControlName="note" class="form-control" rows="3"></textarea>
                      </div>
                      
                      <button type="submit" class="btn btn-primary" [disabled]="actionForm.invalid || isSubmitting">
                        {{ isSubmitting ? 'Đang xử lý...' : 'Thực hiện' }}
                      </button>
                    </form>
                  }
                </div>
              </div>
            }

            @if (workflowInstance.logs && workflowInstance.logs.length > 0) {
              <div class="info-section">
                <h4>Lịch sử xử lý</h4>
                <div class="timeline">
                  @for (log of workflowInstance.logs; track log.id) {
                    <div class="timeline-item">
                      <div class="timeline-content">
                        <div class="timeline-header">
                          <span class="action-type">{{ getActionTypeLabel(log.actionType) }}</span>
                          <span class="action-date">{{ log.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                        </div>
                        <p class="action-user">{{ log.actionByUser ? log.actionByUser.fullName : 'Không xác định' }}</p>
                        @if (log.note) {
                          <p class="action-note">{{ log.note }}</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .workflow-detail {
      padding: 24px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .loading-state,
    .error-state {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-state h3 {
      color: #dc2626;
      margin: 0 0 8px 0;
    }

    .error-state p {
      color: #6b7280;
      margin: 0 0 16px 0;
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .detail-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .detail-body {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .info-section {
      margin-bottom: 30px;
    }

    .info-section h4 {
      margin: 0 0 16px 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-IN_PROGRESS { background: #dbeafe; color: #1e40af; }
    .status-COMPLETED { background: #d1fae5; color: #065f46; }
    .status-CANCELLED { background: #fee2e2; color: #991b1b; }
    .status-REJECTED { background: #fef3c7; color: #92400e; }

    .current-step {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      background: #f9fafb;
    }

    .current-step h5 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .current-step p {
      margin: 0 0 16px 0;
      color: #6b7280;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
    }

    .timeline-item {
      margin-bottom: 16px;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .action-type {
      font-weight: 600;
    }

    .action-date {
      font-size: 12px;
      color: #6b7280;
    }

    .action-user {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: #6b7280;
    }

    .action-note {
      margin: 0;
      font-size: 14px;
      font-style: italic;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      font-size: 16px;
    }
  `]
})
export class WorkflowInstanceDetailComponent implements OnInit {
  @Input() workflowInstance?: WorkflowInstance;
  @Output() closeModal = new EventEmitter<void>();
  @Output() actionCompleted = new EventEmitter<void>();

  actionForm: FormGroup;
  isSubmitting = false;
  isLoading = true;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private workflowApolloService: WorkflowApolloService,
    private navigationService: WorkflowNavigationService
  ) {
    this.actionForm = this.fb.group({
      actionType: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    // Nếu có workflowInstance từ Input, sử dụng nó
    if (this.workflowInstance?.id) {
      this.isLoading = false;
    } else {
      // Nếu không có, load từ route parameter
      this.loadWorkflowFromRoute();
    }
  }

  private loadWorkflowFromRoute(): void {
    this.route.params.subscribe(params => {
      const workflowId = +params['id'];
      if (workflowId) {
        this.loadWorkflowInstance(workflowId);
      } else {
        this.error = 'Không tìm thấy ID workflow';
        this.isLoading = false;
      }
    });
  }

  private loadWorkflowInstance(workflowId: number): void {
    this.isLoading = true;
    this.error = null;

    this.workflowApolloService.getWorkflowInstance(workflowId).subscribe({
      next: (workflow: WorkflowInstance) => {
        this.workflowInstance = workflow;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading workflow instance:', error);
        this.error = 'Không thể tải thông tin workflow';
        this.isLoading = false;
      }
    });
  }

  onSubmitAction(): void {
    if (this.actionForm.valid && this.workflowInstance?.currentStep) {
      this.isSubmitting = true;
      
      const actionInput: WorkflowActionInput = {
        instanceId: this.workflowInstance.id,
        stepId: this.workflowInstance.currentStep.id,
        actionType: this.actionForm.value.actionType,
        note: this.actionForm.value.note,
        metadata: ''
      };

      this.workflowApolloService.executeWorkflowAction(actionInput).subscribe({
        next: (updatedInstance: WorkflowInstance) => {
          this.isSubmitting = false;
          this.actionForm.reset();
          this.workflowInstance = updatedInstance;
          this.actionCompleted.emit();
        },
        error: (error) => {
          console.error('Error executing action:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.navigationService.goBack();
  }

  goToProcess(): void {
    if (this.workflowInstance?.id) {
      this.navigationService.navigateToWorkflowProcess(this.workflowInstance.id);
    }
  }

  canPerformAction(assignedRole: string): boolean {
    const userRoles = ['DEPARTMENT_HEAD', 'SYSTEM_ADMIN'];
    return userRoles.includes(assignedRole);
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'IN_PROGRESS': 'Đang xử lý',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
      'REJECTED': 'Từ chối'
    };
    return statusLabels[status] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'IN_PROGRESS': 'status-IN_PROGRESS',
      'COMPLETED': 'status-COMPLETED',
      'CANCELLED': 'status-CANCELLED',
      'REJECTED': 'status-REJECTED'
    };
    return statusClasses[status] || '';
  }

  getActionTypeLabel(actionType: string): string {
    const actionLabels: { [key: string]: string } = {
      'APPROVE': 'Phê duyệt',
      'REJECT': 'Từ chối',
      'TRANSFER': 'Chuyển tiếp',
      'CANCEL': 'Hủy bỏ',
      'START': 'Bắt đầu',
      'COMPLETE': 'Hoàn thành',
    };
    return actionLabels[actionType] || actionType;
  }

  close(): void {
    this.closeModal.emit();
  }
}
