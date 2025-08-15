import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IWorkflowStep } from '../../../../../core/modules/workflow/workflow-steps/interfaces/workflow-step.interfaces';
import { IWorkflowTemplate } from '../../../../../core/modules/workflow/workflow-templates/interfaces/workflow-templates.interface';

@Component({
  selector: 'app-workflow-steps',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="workflow-steps">
      <div class="steps-header">
        <h3>Các bước trong quy trình</h3>
        <button class="btn btn-primary" (click)="addStep()">
          <img src="/icons/add.svg" alt="Thêm" />
          Thêm bước
        </button>
      </div>

      @if (workflowTemplate && workflowTemplate.steps && workflowTemplate.steps.length > 0) {
        <div class="steps-list">
          @for (step of workflowTemplate.steps; track step.id; let i = $index) {
            <div class="step-item" [class.active]="step.isActive">
              <div class="step-header">
                <div class="step-order">
                  <span class="order-number">{{ step.orderNumber }}</span>
                </div>
                <div class="step-info">
                  <div class="step-name">{{ step.name }}</div>
                  @if (step.description) {
                    <div class="step-description">{{ step.description }}</div>
                  }
                </div>
                <div class="step-meta">
                  <span class="step-type">{{ getStepTypeLabel(step.type) }}</span>
                  <span class="step-role">{{ step.assignedRole }}</span>
                </div>
                <div class="step-actions">
                  <button class="btn-icon" (click)="editStep(step)" title="Chỉnh sửa">
                    <img src="/icons/edit.svg" alt="Sửa" />
                  </button>
                  <button class="btn-icon" (click)="deleteStep(step)" title="Xóa">
                    <img src="/icons/delete.svg" alt="Xóa" />
                  </button>
                </div>
              </div>
              
              @if (workflowTemplate && workflowTemplate.steps && i < workflowTemplate.steps.length - 1) {
                <div class="step-connector">
                  <div class="connector-line"></div>
                  <div class="connector-arrow">↓</div>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="empty-steps">
          <img src="/icons/empty.svg" alt="Không có bước" />
          <p>Chưa có bước nào trong quy trình này.</p>
          <button class="btn btn-primary" (click)="addStep()">
            Thêm bước đầu tiên
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .workflow-steps {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .steps-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .steps-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn img {
      width: 16px;
      height: 16px;
    }

    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .step-item {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      background: #f8f9fa;
      transition: all 0.2s;
    }

    .step-item.active {
      border-color: #28a745;
      background: #d4edda;
    }

    .step-header {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .step-order {
      flex-shrink: 0;
    }

    .order-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      font-weight: 600;
      font-size: 16px;
    }

    .step-info {
      flex: 1;
    }

    .step-name {
      font-weight: 600;
      color: #333;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .step-description {
      color: #666;
      font-size: 14px;
    }

    .step-meta {
      display: flex;
      flex-direction: column;
      gap: 5px;
      align-items: flex-end;
    }

    .step-type {
      background: #6c757d;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .step-role {
      color: #666;
      font-size: 12px;
      font-weight: 500;
    }

    .step-actions {
      display: flex;
      gap: 5px;
    }

    .btn-icon {
      background: none;
      border: none;
      padding: 5px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .btn-icon:hover {
      background: rgba(0, 0, 0, 0.1);
    }

    .btn-icon img {
      width: 16px;
      height: 16px;
    }

    .step-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 15px;
    }

    .connector-line {
      width: 2px;
      height: 20px;
      background: #ddd;
    }

    .connector-arrow {
      color: #666;
      font-size: 16px;
      margin-top: 5px;
    }

    .empty-steps {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .empty-steps img {
      width: 60px;
      height: 60px;
      margin-bottom: 15px;
      opacity: 0.5;
    }

    .empty-steps p {
      margin-bottom: 20px;
      font-size: 16px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .steps-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .step-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .step-meta {
        align-items: flex-start;
        width: 100%;
      }

      .step-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class WorkflowSteps {
  @Input() workflowTemplate: IWorkflowTemplate | null = null;
  @Output() addStepEvent = new EventEmitter<void>();
  @Output() editStepEvent = new EventEmitter<IWorkflowStep>();
  @Output() deleteStepEvent = new EventEmitter<IWorkflowStep>();

  addStep() {
    this.addStepEvent.emit();
  }

  editStep(step: IWorkflowStep) {
    this.editStepEvent.emit(step);
  }

  deleteStep(step: IWorkflowStep) {
    if (confirm(`Bạn có chắc chắn muốn xóa bước "${step.name}"?`)) {
      this.deleteStepEvent.emit(step);
    }
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
