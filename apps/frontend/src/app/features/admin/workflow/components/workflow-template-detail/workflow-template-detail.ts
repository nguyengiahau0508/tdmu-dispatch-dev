import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IWorkflowTemplate } from '../../../../../core/modules/workflow/workflow-templates/interfaces/workflow-templates.interface';
import { WorkflowTemplatesService } from '../../../../../core/modules/workflow/workflow-templates/workflow-templates.service';

@Component({
  selector: 'app-workflow-template-detail',
  standalone: true,
  imports: [CommonModule],
  providers: [WorkflowTemplatesService],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Chi tiết quy trình</h2>
          <button class="close-btn" (click)="close()">×</button>
        </div>
        
        <div class="modal-body">
          @if (workflowTemplate) {
            <div class="detail-section">
              <h3>Thông tin cơ bản</h3>
              <div class="detail-row">
                <span class="label">ID:</span>
                <span class="value">{{ workflowTemplate.id }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Tên quy trình:</span>
                <span class="value">{{ workflowTemplate.name }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Mô tả:</span>
                <span class="value">{{ workflowTemplate.description || 'Không có mô tả' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Trạng thái:</span>
                <span class="value">
                  <span class="status-badge" [class.active]="workflowTemplate.isActive">
                    {{ workflowTemplate.isActive ? 'Đang hoạt động' : 'Không hoạt động' }}
                  </span>
                </span>
              </div>
              <div class="detail-row">
                <span class="label">Người tạo:</span>
                <span class="value">{{ workflowTemplate.createdByUser.fullName || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Ngày tạo:</span>
                <span class="value">{{ workflowTemplate.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Ngày cập nhật:</span>
                <span class="value">{{ workflowTemplate.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>

            <div class="detail-section">
              <h3>Các bước trong quy trình ({{ workflowTemplate.steps.length || 0 }})</h3>
              @if (workflowTemplate.steps && workflowTemplate.steps.length > 0) {
                <div class="steps-list">
                  @for (step of workflowTemplate.steps; track step.id) {
                    <div class="step-item">
                      <div class="step-header">
                        <span class="step-order">{{ step.orderNumber }}</span>
                        <span class="step-name">{{ step.name }}</span>
                        <span class="step-type">{{ getStepTypeLabel(step.type) }}</span>
                      </div>
                      @if (step.description) {
                        <div class="step-description">{{ step.description }}</div>
                      }
                      <div class="step-details">
                        <span class="step-role">Vai trò: {{ step.assignedRole }}</span>
                        <span class="step-status" [class.active]="step.isActive">
                          {{ step.isActive ? 'Hoạt động' : 'Không hoạt động' }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="no-data">Chưa có bước nào trong quy trình này.</p>
              }
            </div>

            <div class="detail-section">
              <h3>Thống kê</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-number">{{ workflowTemplate.instances.length || 0 }}</span>
                  <span class="stat-label">Lần thực thi</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ workflowTemplate.steps.length || 0 }}</span>
                  <span class="stat-label">Số bước</span>
                </div>
              </div>
            </div>
          } @else {
            <div class="loading">Đang tải...</div>
          }
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="close()">Đóng</button>
        </div>
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
      border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }

    .modal-body {
      padding: 20px;
    }

    .detail-section {
      margin-bottom: 30px;
    }

    .detail-section h3 {
      margin: 0 0 15px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 5px;
    }

    .detail-row {
      display: flex;
      margin-bottom: 10px;
      align-items: center;
    }

    .label {
      font-weight: 500;
      color: #666;
      min-width: 120px;
      margin-right: 10px;
    }

    .value {
      color: #333;
      flex: 1;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      background: #dc3545;
      color: white;
    }

    .status-badge.active {
      background: #28a745;
    }

    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .step-item {
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 15px;
      background: #f9f9f9;
    }

    .step-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .step-order {
      background: #007bff;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }

    .step-name {
      font-weight: 600;
      color: #333;
      flex: 1;
    }

    .step-type {
      background: #6c757d;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .step-description {
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .step-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }

    .step-role {
      color: #666;
    }

    .step-status {
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 11px;
      background: #dc3545;
      color: white;
    }

    .step-status.active {
      background: #28a745;
    }

    .no-data {
      color: #666;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 15px;
    }

    .stat-item {
      text-align: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #dee2e6;
    }

    .stat-number {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #007bff;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .modal-footer {
      padding: 20px;
      border-top: 1px solid #eee;
      text-align: right;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }
  `]
})
export class WorkflowTemplateDetail implements OnInit {
  @Input() isOpen = false;
  @Input() workflowTemplateId: number | null = null;
  @Output() closeModal = new EventEmitter<void>();

  workflowTemplate: IWorkflowTemplate | null = null;

  constructor(
    private workflowTemplatesService: WorkflowTemplatesService
  ) {}

  ngOnInit() {
    if (this.workflowTemplateId) {
      this.loadWorkflowTemplate();
    }
  }

  loadWorkflowTemplate() {
    if (this.workflowTemplateId) {
      this.workflowTemplatesService.findOne(this.workflowTemplateId).subscribe({
        next: (template: IWorkflowTemplate) => {
          this.workflowTemplate = template;
        },
        error: (error: any) => {
          console.error('Error loading workflow template:', error);
        }
      });
    }
  }

  close() {
    this.closeModal.emit();
  }

  getStepTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      'START': 'Bắt đầu',
      'APPROVAL': 'Phê duyệt',
      'TRANSFER': 'Chuyển tiếp',
      'END': 'Kết thúc'
    };
    return typeLabels[type] || type;
  }
}
