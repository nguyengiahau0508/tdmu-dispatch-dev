import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowTemplatesService } from '../../../../../core/modules/workflow/workflow-templates/workflow-templates.service';
import { IWorkflowTemplate } from '../../../../../core/modules/workflow/workflow-templates/interfaces/workflow-templates.interface';
import { WorkflowStepsManager } from '../workflow-steps-manager/workflow-steps-manager';

@Component({
  selector: 'app-workflow-template-detail',
  standalone: true,
  imports: [CommonModule, WorkflowStepsManager],
  providers: [WorkflowTemplatesService],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Chi tiết quy trình</h3>
          <button class="btn btn-icon" (click)="close()">
            <span class="btn-icon">✕</span>
          </button>
        </div>
        
        <div class="modal-body">
          @if (workflowTemplate) {
            <!-- Basic Info -->
            <div class="info-section">
              <h4>Thông tin cơ bản</h4>
              <div class="info-grid">
                <div class="info-item">
                  <label>Tên quy trình:</label>
                  <span>{{ workflowTemplate.name }}</span>
                </div>
                <div class="info-item">
                  <label>Mô tả:</label>
                  <span>{{ workflowTemplate.description || 'Không có mô tả' }}</span>
                </div>
                <div class="info-item">
                  <label>Trạng thái:</label>
                  <span class="status-badge" [class]="getStatusClass(workflowTemplate.isActive)">
                    {{ getStatusLabel(workflowTemplate.isActive) }}
                  </span>
                </div>
                <div class="info-item">
                  <label>Người tạo:</label>
                  <span>{{ workflowTemplate.createdByUser.fullName || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Ngày tạo:</label>
                  <span>{{ workflowTemplate.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <div class="info-item">
                  <label>Cập nhật lần cuối:</label>
                  <span>{{ workflowTemplate.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>
            </div>

            <!-- Statistics -->
            <div class="stats-section">
              <h4>Thống kê</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-label">Số bước</div>
                  <div class="stat-number">{{ workflowTemplate.steps.length || 0 }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Số instance</div>
                  <div class="stat-number">{{ workflowTemplate.instances.length || 0 }}</div>
                </div>
              </div>
            </div>

            <!-- Steps Management -->
            <div class="steps-section">
              <app-workflow-steps-manager 
                [workflowTemplate]="workflowTemplate"
                (stepsUpdated)="onStepsUpdated()"
              ></app-workflow-steps-manager>
            </div>
          } @else {
            <div class="loading">Đang tải...</div>
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
      background: var(--color-background-primary);
      border-radius: 8px;
      width: 95%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid var(--color-border);
    }

    .modal-header h3 {
      margin: 0;
      color: var(--color-text-primary);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--color-text-secondary);
    }

    .close-btn:hover {
      color: var(--color-text-primary);
    }

    .modal-body {
      padding: 20px;
    }

    .info-section, .stats-section, .steps-section {
      margin-bottom: 30px;
    }

    .info-section h4, .stats-section h4 {
      margin: 0 0 16px 0;
      color: var(--color-text-primary);
      font-size: 18px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-weight: 500;
      color: var(--color-text-secondary);
      font-size: 14px;
    }

    .info-item span {
      color: var(--color-text-primary);
      font-size: 16px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-align: center;
      display: inline-block;
      width: fit-content;
    }

    .status-active {
      background: color-mix(in srgb, var(--color-primary) 15%, var(--color-background-secondary));
      color: var(--color-primary);
    }

    .status-inactive {
      background: color-mix(in srgb, #dc3545 15%, var(--color-background-secondary));
      color: #dc3545;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .stat-item {
      background: var(--color-background-secondary);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }

    .stat-label {
      font-size: 14px;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
    }

    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: var(--color-primary);
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: var(--color-text-secondary);
    }

    .btn-icon {
      width: 36px;
      height: 36px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 16px;
    }

    .btn-icon:hover {
      background: var(--color-background-secondary);
    }
  `]
})
export class WorkflowTemplateDetail implements OnInit {
  @Input() isOpen = false;
  @Input() workflowTemplateId!: number;
  @Output() closeModal = new EventEmitter<void>();

  private workflowTemplatesService = inject(WorkflowTemplatesService);

  workflowTemplate: IWorkflowTemplate | null = null;

  ngOnInit() {
    if (this.workflowTemplateId) {
      this.loadWorkflowTemplate();
    }
  }

  loadWorkflowTemplate() {
    this.workflowTemplatesService.findOne(this.workflowTemplateId).subscribe({
      next: (template) => {
        this.workflowTemplate = template;
      },
      error: (error: any) => {
        console.error('Error loading workflow template:', error);
      }
    });
  }

  onStepsUpdated() {
    // Reload template to get updated steps
    this.loadWorkflowTemplate();
  }

  close() {
    this.closeModal.emit();
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Đang hoạt động' : 'Không hoạt động';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }
}
