import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowApolloService } from '../../services/workflow-apollo.service';
import { WorkflowNavigationService } from '../../services/workflow-navigation.service';
import { WorkflowInstance } from '../../models/workflow-instance.model';
import { WorkflowActionInput } from '../../models/workflow-action-input.model';

@Component({
  selector: 'app-workflow-action',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [WorkflowApolloService],
  template: `
    <div class="workflow-action">
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
      } @else if (workflowInstance && workflowInstance.currentStep) {
        <div class="action-panel">
          <h3>Thực hiện hành động</h3>
          <div class="current-step-info">
            <h4>Bước hiện tại: {{ workflowInstance.currentStep.name }}</h4>
            <p>{{ workflowInstance.currentStep.description }}</p>
            <p><strong>Vai trò phụ trách:</strong> {{ getRoleLabel(workflowInstance.currentStep.assignedRole) }}</p>
          </div>

          @if (availableActions.length > 0) {
            <form [formGroup]="actionForm" (ngSubmit)="onSubmit()" class="action-form">
              <div class="form-group">
                <label for="actionType">Hành động</label>
                <select id="actionType" formControlName="actionType" class="form-control">
                  <option value="">Chọn hành động</option>
                  @for (action of availableActions; track action) {
                    <option [value]="action">{{ getActionTypeLabel(action) }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label for="note">Ghi chú</label>
                <textarea 
                  id="note" 
                  formControlName="note" 
                  class="form-control" 
                  rows="3"
                  placeholder="Nhập ghi chú (tùy chọn)"
                ></textarea>
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  [disabled]="actionForm.invalid || isSubmitting"
                >
                  {{ isSubmitting ? 'Đang xử lý...' : 'Thực hiện' }}
                </button>
                <button 
                  type="button" 
                  class="btn btn-secondary" 
                  (click)="onCancel()"
                  [disabled]="isSubmitting"
                >
                  Hủy
                </button>
              </div>
            </form>
          } @else {
            <div class="no-actions">
              <p>Không có hành động nào có thể thực hiện cho bước này.</p>
            </div>
          }
        </div>
      } @else {
        <div class="no-current-step">
          <p>Không có bước nào đang chờ xử lý.</p>
          <button class="btn btn-secondary" (click)="goBack()">Quay lại</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .workflow-action {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .action-panel h3 {
      margin: 0 0 20px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .current-step-info {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .current-step-info h4 {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .current-step-info p {
      margin: 0 0 4px 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .current-step-info strong {
      color: #374151;
    }

    .action-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 500;
      color: #374151;
      font-size: 0.9rem;
    }

    .form-control {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-control:invalid {
      border-color: #ef4444;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .no-actions,
    .no-current-step {
      text-align: center;
      padding: 40px;
      color: #6b7280;
    }

    .no-actions p,
    .no-current-step p {
      margin: 0 0 16px 0;
      font-size: 1rem;
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

    @media (max-width: 768px) {
      .workflow-action {
        padding: 16px;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class WorkflowActionComponent implements OnInit {
  @Input() workflowInstance?: WorkflowInstance;
  @Output() actionCompleted = new EventEmitter<WorkflowInstance>();
  @Output() actionCancelled = new EventEmitter<void>();

  actionForm: FormGroup;
  availableActions: string[] = [];
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
      this.loadWorkflowData();
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

    console.log('Loading workflow instance:', workflowId);

    this.workflowApolloService.getWorkflowInstance(workflowId).subscribe({
      next: (workflow: WorkflowInstance) => {
        console.log('Workflow instance loaded:', workflow);
        this.workflowInstance = workflow;
        this.loadWorkflowData();
      },
      error: (error: any) => {
        console.error('Error loading workflow instance:', error);
        this.error = 'Không thể tải thông tin workflow';
        this.isLoading = false;
      }
    });
  }

  private loadWorkflowData(): void {
    if (this.workflowInstance?.id) {
      this.loadAvailableActions();
    }
    this.isLoading = false;
  }

  async loadAvailableActions(): Promise<void> {
    if (!this.workflowInstance?.id) return;

    try {
      this.workflowApolloService.getAvailableActions(this.workflowInstance.id).subscribe({
        next: (actions: string[]) => {
          this.availableActions = actions;
        },
        error: (error) => {
          console.error('Error loading available actions:', error);
          this.availableActions = [];
        }
      });
    } catch (error) {
      console.error('Error loading available actions:', error);
      this.availableActions = [];
    }
  }

  async onSubmit(): Promise<void> {
    if (this.actionForm.invalid || !this.workflowInstance?.currentStep) {
      console.error('Form validation failed:', {
        formValid: this.actionForm.valid,
        workflowInstance: !!this.workflowInstance,
        currentStep: !!this.workflowInstance?.currentStep
      });
      return;
    }

    this.isSubmitting = true;

    // Validate required fields
    if (!this.workflowInstance.id) {
      console.error('Workflow instance ID is missing');
      this.isSubmitting = false;
      return;
    }

    if (!this.workflowInstance.currentStep.id) {
      console.error('Current step ID is missing');
      this.isSubmitting = false;
      return;
    }

    const actionInput: WorkflowActionInput = {
      instanceId: this.workflowInstance.id,
      stepId: this.workflowInstance.currentStep.id,
      actionType: this.actionForm.value.actionType,
      note: this.actionForm.value.note,
      metadata: ''
    };

    console.log('Submitting workflow action:', actionInput);

    try {
      this.workflowApolloService.executeWorkflowAction(actionInput).subscribe({
        next: (updatedInstance: WorkflowInstance) => {
          this.actionCompleted.emit(updatedInstance);
          this.isSubmitting = false;
          // Chuyển về trang pending documents sau khi hoàn thành
          this.navigationService.navigateToPendingDocuments();
        },
        error: (error) => {
          console.error('Error executing workflow action:', error);
          this.isSubmitting = false;
          // Có thể hiển thị thông báo lỗi ở đây
        }
      });
    } catch (error) {
      console.error('Error executing workflow action:', error);
      this.isSubmitting = false;
    }
  }

  goBack(): void {
    this.navigationService.goBack();
  }

  onCancel(): void {
    this.actionCancelled.emit();
  }

  getRoleLabel(role: string): string {
    const roleLabels: { [key: string]: string } = {
      'SYSTEM_ADMIN': 'Quản trị viên hệ thống',
      'UNIVERSITY_LEADER': 'Lãnh đạo cấp cao',
      'DEPARTMENT_HEAD': 'Trưởng đơn vị',
      'DEPARTMENT_STAFF': 'Chuyên viên/Nhân viên',
      'CLERK': 'Văn thư',
      'DEGREE_MANAGER': 'Quản lý văn bằng',
      'BASIC_USER': 'Người dùng cơ bản',
    };
    return roleLabels[role] || role;
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
}
