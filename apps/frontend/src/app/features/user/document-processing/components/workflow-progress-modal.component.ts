import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowProgressComponent, WorkflowStepProgress } from './workflow-progress.component';

@Component({
  selector: 'app-workflow-progress-modal',
  standalone: true,
  imports: [CommonModule, WorkflowProgressComponent],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">
            <span class="title-icon">📊</span>
            Sơ đồ quy trình xử lý
          </h2>
          <button class="close-button" (click)="close()">
            <span class="close-icon">✕</span>
          </button>
        </div>

        <div class="modal-content">
          <div class="workflow-info" *ngIf="workflowInfo">
            <div class="info-row">
              <span class="label">Tên quy trình:</span>
              <span class="value">{{ workflowInfo.templateName }}</span>
            </div>
            <div class="info-row" *ngIf="workflowInfo.documentTitle">
              <span class="label">Văn bản:</span>
              <span class="value">{{ workflowInfo.documentTitle }}</span>
            </div>
            <div class="info-row">
              <span class="label">Trạng thái:</span>
              <span class="status-badge" [class]="'status-' + (workflowInfo.status?.toLowerCase() || 'unknown')">
                {{ getStatusLabel(workflowInfo.status || '') }}
              </span>
            </div>
          </div>

          <div class="progress-section">
            <app-workflow-progress [steps]="steps"></app-workflow-progress>
          </div>

          <div class="summary-section" *ngIf="steps.length > 0">
            <h3 class="summary-title">
              <span class="summary-icon">📈</span>
              Tóm tắt tiến độ
            </h3>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="card-icon completed">✅</div>
                <div class="card-content">
                  <div class="card-value">{{ getCompletedCount() }}</div>
                  <div class="card-label">Đã hoàn thành</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="card-icon current">●</div>
                <div class="card-content">
                  <div class="card-value">{{ getCurrentCount() }}</div>
                  <div class="card-label">Đang xử lý</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="card-icon pending">○</div>
                <div class="card-content">
                  <div class="card-value">{{ getPendingCount() }}</div>
                  <div class="card-label">Chờ xử lý</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="card-icon skipped">❌</div>
                <div class="card-content">
                  <div class="card-value">{{ getSkippedCount() }}</div>
                  <div class="card-label">Đã bỏ qua</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="action-btn secondary" (click)="close()">
            <span class="action-icon">❌</span>
            Đóng
          </button>
          <button class="action-btn primary" (click)="exportProgress()" *ngIf="steps.length > 0">
            <span class="action-icon">📄</span>
            Xuất báo cáo
          </button>
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
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-container {
      background: var(--color-background-primary);
      border-radius: 16px;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
      width: 95%;
      max-width: 1000px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { 
        opacity: 0; 
        transform: translateY(-30px) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 32px;
      border-bottom: 1px solid var(--color-border);
      background: var(--color-background-secondary);
      border-radius: 16px 16px 0 0;
    }

    .modal-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .title-icon {
      font-size: 1.5rem;
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      color: var(--color-text-secondary);
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background: var(--color-background-primary);
      color: var(--color-text-primary);
    }

    .close-icon {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .modal-content {
      padding: 32px;
    }

    .workflow-info {
      background: var(--color-background-secondary);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 0.875rem;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .label {
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .value {
      color: var(--color-text-primary);
      font-weight: 500;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-completed {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-in_progress {
      background: #dbeafe;
      color: #2563eb;
    }

    .status-cancelled {
      background: #fee2e2;
      color: #dc2626;
    }

    .progress-section {
      margin-bottom: 32px;
    }

    .summary-section {
      border-top: 1px solid var(--color-border);
      padding-top: 24px;
    }

    .summary-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 20px 0;
    }

    .summary-icon {
      font-size: 1.25rem;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--color-background-secondary);
      border-radius: 12px;
      padding: 16px;
      transition: all 0.2s ease;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .card-icon {
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-icon.completed {
      background: #dcfce7;
      color: #16a34a;
    }

    .card-icon.current {
      background: #dbeafe;
      color: #2563eb;
      animation: pulse 2s infinite;
    }

    .card-icon.pending {
      background: #f3f4f6;
      color: #6b7280;
    }

    .card-icon.skipped {
      background: #fee2e2;
      color: #dc2626;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    }

    .card-content {
      flex: 1;
    }

    .card-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-primary);
      line-height: 1;
    }

    .card-label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-top: 4px;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      padding: 24px 32px;
      border-top: 1px solid var(--color-border);
      background: var(--color-background-secondary);
      border-radius: 0 0 16px 16px;
      justify-content: flex-end;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn.secondary {
      background: var(--color-background-primary);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .action-btn.secondary:hover {
      background: var(--color-border);
    }

    .action-btn.primary {
      background: var(--color-primary);
      color: white;
    }

    .action-btn.primary:hover {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
      transform: translateY(-1px);
    }

    .action-icon {
      font-size: 1rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .modal-container {
        width: 98%;
        margin: 20px;
      }

      .modal-header {
        padding: 20px 24px;
      }

      .modal-content {
        padding: 24px;
      }

      .modal-actions {
        padding: 20px 24px;
        flex-direction: column;
      }

      .action-btn {
        justify-content: center;
      }

      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }

    @media (max-width: 480px) {
      .summary-grid {
        grid-template-columns: 1fr;
      }

      .modal-title {
        font-size: 1.25rem;
      }
    }
  `]
})
export class WorkflowProgressModalComponent {
  @Input() steps: WorkflowStepProgress[] = [];
  @Input() workflowInfo: {
    templateName?: string;
    documentTitle?: string;
    status?: string;
  } | null = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() exportRequested = new EventEmitter<void>();

  getCompletedCount(): number {
    return this.steps.filter(step => step.status === 'completed').length;
  }

  getCurrentCount(): number {
    return this.steps.filter(step => step.status === 'current').length;
  }

  getPendingCount(): number {
    return this.steps.filter(step => step.status === 'pending').length;
  }

  getSkippedCount(): number {
    return this.steps.filter(step => step.status === 'skipped').length;
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'COMPLETED': 'HOÀN THÀNH',
      'IN_PROGRESS': 'ĐANG XỬ LÝ',
      'CANCELLED': 'ĐÃ HỦY',
      'REJECTED': 'ĐÃ TỪ CHỐI'
    };
    return statusLabels[status] || status;
  }

  close(): void {
    this.modalClosed.emit();
  }

  exportProgress(): void {
    this.exportRequested.emit();
  }
}
