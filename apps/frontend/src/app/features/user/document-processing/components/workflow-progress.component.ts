import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WorkflowStepProgress {
  id: number;
  name: string;
  description?: string;
  type: string;
  assignedRole: string;
  orderNumber: number;
  isActive: boolean;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  completedAt?: Date;
  completedBy?: {
    id: number;
    fullName: string;
    email: string;
  };
  notes?: string;
}

@Component({
  selector: 'app-workflow-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="workflow-progress-container">
      <div class="progress-header">
        <h3 class="progress-title">
          <span class="progress-icon">📊</span>
          Tiến độ quy trình
        </h3>
        <div class="progress-summary">
          <span class="summary-item">
            <span class="summary-label">Đã hoàn thành:</span>
            <span class="summary-value completed">{{ getCompletedCount() }}/{{ steps.length }}</span>
          </span>
          <span class="summary-item">
            <span class="summary-label">Tiến độ:</span>
            <span class="summary-value">{{ getProgressPercentage() }}%</span>
          </span>
        </div>
      </div>

      <div class="progress-steps">
        <div 
          class="step-item" 
          *ngFor="let step of steps; trackBy: trackByStepId; let i = index"
          [class]="'step-' + step.status">
          
          <!-- Step Circle -->
          <div class="step-circle">
            <div class="step-number" *ngIf="step.status !== 'completed'">{{ step.orderNumber }}</div>
            <div class="step-icon" *ngIf="step.status === 'completed'">
              <span class="check-icon">✓</span>
            </div>
            <div class="step-icon" *ngIf="step.status === 'current'">
              <span class="current-icon">●</span>
            </div>
            <div class="step-icon" *ngIf="step.status === 'pending'">
              <span class="pending-icon">○</span>
            </div>
          </div>

          <!-- Step Content -->
          <div class="step-content">
            <div class="step-header">
              <div class="step-info">
                <h4 class="step-name">{{ step.name }}</h4>
                <p class="step-description" *ngIf="step.description">{{ step.description }}</p>
              </div>
              <div class="step-meta">
                <span class="step-type" [class]="'type-' + step.type.toLowerCase()">
                  {{ getStepTypeLabel(step.type) }}
                </span>
                <span class="step-role">{{ step.assignedRole }}</span>
              </div>
            </div>

            <!-- Step Status -->
            <div class="step-status">
              <span class="status-badge" [class]="'status-' + step.status">
                {{ getStatusLabel(step.status) }}
              </span>
              
              <div class="step-details" *ngIf="step.status === 'completed'">
                <div class="completion-info">
                  <span class="completion-time">
                    Hoàn thành: {{ step.completedAt | date:'dd/MM/yyyy HH:mm' }}
                  </span>
                  <span class="completion-user" *ngIf="step.completedBy">
                    bởi {{ step.completedBy.fullName }}
                  </span>
                </div>
                <div class="step-notes" *ngIf="step.notes">
                  <span class="notes-label">Ghi chú:</span>
                  <span class="notes-text">{{ step.notes }}</span>
                </div>
              </div>

              <div class="step-details" *ngIf="step.status === 'current'">
                <div class="current-info">
                  <span class="current-time">Đang xử lý...</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Connector -->
          <div class="step-connector" *ngIf="i < steps.length - 1">
            <div class="connector-line" [class]="'connector-' + getConnectorStatus(i)"></div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            [style.width.%]="getProgressPercentage()">
          </div>
        </div>
        <div class="progress-text">
          {{ getCompletedCount() }} / {{ steps.length }} bước đã hoàn thành
        </div>
      </div>
    </div>
  `,
  styles: [`
    .workflow-progress-container {
      background: var(--color-background-secondary);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .progress-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .progress-icon {
      font-size: 1.25rem;
    }

    .progress-summary {
      display: flex;
      gap: 16px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
    }

    .summary-label {
      color: var(--color-text-secondary);
    }

    .summary-value {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .summary-value.completed {
      color: #10b981;
    }

    .progress-steps {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      position: relative;
    }

    .step-circle {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--color-border);
      background: var(--color-background-primary);
      transition: all 0.3s ease;
    }

    .step-item.step-completed .step-circle {
      border-color: #10b981;
      background: #10b981;
      color: white;
    }

    .step-item.step-current .step-circle {
      border-color: #3b82f6;
      background: #3b82f6;
      color: white;
      animation: pulse 2s infinite;
    }

    .step-item.step-pending .step-circle {
      border-color: var(--color-border);
      background: var(--color-background-primary);
      color: var(--color-text-secondary);
    }

    .step-item.step-skipped .step-circle {
      border-color: #6b7280;
      background: #6b7280;
      color: white;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    }

    .step-number {
      font-weight: 600;
      font-size: 0.875rem;
    }

    .step-icon {
      font-size: 1.25rem;
      font-weight: bold;
    }

    .check-icon {
      color: white;
    }

    .current-icon {
      color: white;
    }

    .pending-icon {
      color: var(--color-text-secondary);
    }

    .step-content {
      flex: 1;
      min-width: 0;
    }

    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .step-info {
      flex: 1;
      min-width: 0;
    }

    .step-name {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .step-description {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    .step-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-end;
    }

    .step-type {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .type-start {
      background: #dbeafe;
      color: #2563eb;
    }

    .type-approval {
      background: #dcfce7;
      color: #16a34a;
    }

    .type-transfer {
      background: #fef3c7;
      color: #d97706;
    }

    .type-end {
      background: #f3e8ff;
      color: #9333ea;
    }

    .step-role {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .step-status {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      width: fit-content;
    }

    .status-completed {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-current {
      background: #dbeafe;
      color: #2563eb;
    }

    .status-pending {
      background: #f3f4f6;
      color: #6b7280;
    }

    .status-skipped {
      background: #fee2e2;
      color: #dc2626;
    }

    .step-details {
      font-size: 0.875rem;
    }

    .completion-info {
      display: flex;
      gap: 8px;
      color: var(--color-text-secondary);
      margin-bottom: 4px;
    }

    .completion-time {
      font-weight: 500;
    }

    .completion-user {
      color: var(--color-primary);
      font-weight: 500;
    }

    .current-info {
      color: #3b82f6;
      font-weight: 500;
    }

    .step-notes {
      background: var(--color-background-primary);
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 3px solid var(--color-primary);
    }

    .notes-label {
      font-weight: 500;
      color: var(--color-text-primary);
      margin-right: 4px;
    }

    .notes-text {
      color: var(--color-text-secondary);
      font-style: italic;
    }

    .step-connector {
      position: absolute;
      left: 19px;
      top: 40px;
      bottom: -20px;
      width: 2px;
      display: flex;
      justify-content: center;
    }

    .connector-line {
      width: 2px;
      height: 100%;
      background: var(--color-border);
    }

    .connector-completed {
      background: #10b981;
    }

    .connector-current {
      background: linear-gradient(to bottom, #10b981 50%, var(--color-border) 50%);
    }

    .connector-pending {
      background: var(--color-border);
    }

    .progress-bar-container {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--color-border);
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--color-border);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .progress-text {
      text-align: center;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .progress-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .progress-summary {
        width: 100%;
        justify-content: space-between;
      }

      .step-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .step-meta {
        align-items: flex-start;
        width: 100%;
      }

      .completion-info {
        flex-direction: column;
        gap: 4px;
      }

      .step-connector {
        left: 19px;
      }
    }
  `]
})
export class WorkflowProgressComponent {
  @Input() steps: WorkflowStepProgress[] = [];

  trackByStepId(index: number, step: WorkflowStepProgress): number {
    return step.id;
  }

  getCompletedCount(): number {
    return this.steps.filter(step => step.status === 'completed').length;
  }

  getProgressPercentage(): number {
    if (this.steps.length === 0) return 0;
    return Math.round((this.getCompletedCount() / this.steps.length) * 100);
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

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'completed': 'Đã hoàn thành',
      'current': 'Đang xử lý',
      'pending': 'Chờ xử lý',
      'skipped': 'Đã bỏ qua'
    };
    return statusLabels[status] || status;
  }

  getConnectorStatus(index: number): string {
    const currentStep = this.steps[index];
    const nextStep = this.steps[index + 1];
    
    if (currentStep.status === 'completed' && nextStep.status === 'completed') {
      return 'completed';
    } else if (currentStep.status === 'completed' && nextStep.status === 'current') {
      return 'current';
    } else {
      return 'pending';
    }
  }
}
