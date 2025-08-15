import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { WorkflowInstancesService } from '../../../../../core/modules/workflow/workflow-instances/workflow-instances.service';
import { IWorkflowInstance, IWorkflowActionInput } from '../../../../../core/modules/workflow/workflow-instances/interfaces/workflow-instance.interfaces';

@Component({
  selector: 'app-workflow-instance-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [WorkflowInstancesService],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Chi tiết quy trình #{{ workflowInstance?.id }}</h3>
          <button class="btn btn-icon" (click)="close()">✕</button>
        </div>
        
        <div class="modal-body">
          @if (workflowInstance) {
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
                        <p class="action-user">{{ log.actionByUser.fullName }}</p>
                        @if (log.note) {
                          <p class="action-note">{{ log.note }}</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .modal-body {
      padding: 20px;
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
export class WorkflowInstanceDetail implements OnInit {
  @Input() workflowInstanceId?: number;
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() actionCompleted = new EventEmitter<void>();

  workflowInstance?: IWorkflowInstance;
  actionForm: FormGroup;
  isSubmitting = false;

  private fb = inject(FormBuilder);
  private workflowInstancesService = inject(WorkflowInstancesService);

  constructor() {
    this.actionForm = this.fb.group({
      actionType: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    if (this.workflowInstanceId) {
      this.loadWorkflowInstance();
    }
  }

  loadWorkflowInstance(): void {
    if (this.workflowInstanceId) {
      this.workflowInstancesService.findOne(this.workflowInstanceId).subscribe({
        next: (instance) => {
          this.workflowInstance = instance;
        },
        error: (error) => {
          console.error('Error loading workflow instance:', error);
        }
      });
    }
  }

  onSubmitAction(): void {
    if (this.actionForm.valid && this.workflowInstance?.currentStep) {
      this.isSubmitting = true;
      
      const input: IWorkflowActionInput = {
        instanceId: this.workflowInstance.id,
        stepId: this.workflowInstance.currentStep.id,
        actionType: this.actionForm.value.actionType,
        note: this.actionForm.value.note || undefined
      };

      this.workflowInstancesService.executeAction(input).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.actionForm.reset();
          this.loadWorkflowInstance();
          this.actionCompleted.emit();
        },
        error: (error) => {
          console.error('Error executing action:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  canPerformAction(assignedRole: string): boolean {
    const userRoles = ['DEPARTMENT_HEAD', 'SYSTEM_ADMIN'];
    return userRoles.includes(assignedRole);
  }

  getStatusLabel(status: string): string {
    return this.workflowInstancesService.getStatusLabel(status);
  }

  getStatusClass(status: string): string {
    return this.workflowInstancesService.getStatusClass(status);
  }

  getActionTypeLabel(actionType: string): string {
    return this.workflowInstancesService.getActionTypeLabel(actionType);
  }

  close(): void {
    this.closeModal.emit();
  }
}
