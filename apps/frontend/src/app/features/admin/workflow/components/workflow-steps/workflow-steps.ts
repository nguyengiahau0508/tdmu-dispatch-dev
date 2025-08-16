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
    .steps-container {
      background: var(--color-background-primary);
      border-radius: 8px;
      padding: 20px;
    }

    .steps-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .steps-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
    }

    .btn-primary:hover {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
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
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 20px;
      background: var(--color-background-secondary);
      transition: all 0.2s;
    }

    .step-item.active {
      border-color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 10%, var(--color-background-secondary));
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
      background: var(--color-primary);
      color: var(--color-text-on-primary);
      border-radius: 50%;
      font-weight: 600;
      font-size: 16px;
    }

    .step-info {
      flex: 1;
    }

    .step-name {
      font-weight: 600;
      color: var(--color-text-primary);
      font-size: 16px;
      margin-bottom: 4px;
    }

    .step-description {
      color: var(--color-text-secondary);
      font-size: 14px;
    }

    .step-meta {
      display: flex;
      flex-direction: column;
      gap: 5px;
      align-items: flex-end;
    }

    .step-type {
      background: var(--color-text-secondary);
      color: var(--color-text-on-primary);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .step-role {
      color: var(--color-text-secondary);
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
      color: var(--color-text-secondary);
    }

    .btn-icon:hover {
      background: var(--color-background-secondary);
      color: var(--color-primary);
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
      background: var(--color-border);
    }

    .connector-arrow {
      color: var(--color-text-secondary);
      font-size: 16px;
      margin-top: 5px;
    }

    .empty-steps {
      text-align: center;
      padding: 40px 20px;
      color: var(--color-text-secondary);
    }

    .empty-steps .empty-icon {
      font-size: 3rem;
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
