import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowActionLog } from '../services/document-details.service';

@Component({
  selector: 'app-workflow-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="workflow-history-container">
      <div class="history-item" *ngFor="let log of logs; trackBy: trackByLogId">
        <div class="history-icon">
          <span [class]="getActionIcon(log.actionType)">{{ getActionIcon(log.actionType) }}</span>
        </div>
        <div class="history-content">
          <div class="history-action">{{ getActionLabel(log.actionType) }}</div>
          <div class="history-details">
            <span class="user">{{ log.actionByUser.fullName }}</span>
            <span class="time">{{ log.actionAt | date:'dd/MM/yyyy HH:mm' }}</span>
            <span class="step">{{ log.step.name }}</span>
          </div>
          <div class="history-notes" *ngIf="log.note">
            {{ log.note }}
          </div>
        </div>
      </div>
      
      <div class="no-history" *ngIf="!logs || logs.length === 0">
        <span class="no-history-icon">📝</span>
        <p>Chưa có lịch sử xử lý</p>
      </div>
    </div>
  `,
  styles: [`
    .workflow-history-container {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
    }

    .history-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--color-border);
    }

    .history-item:last-child {
      border-bottom: none;
    }

    .history-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
      width: 24px;
      text-align: center;
    }

    .history-content {
      flex: 1;
    }

    .history-action {
      font-weight: 500;
      color: var(--color-text-primary);
      margin-bottom: 4px;
    }

    .history-details {
      display: flex;
      gap: 12px;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin-bottom: 4px;
      flex-wrap: wrap;
    }

    .history-notes {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      font-style: italic;
      background: var(--color-background-primary);
      padding: 8px;
      border-radius: 4px;
      margin-top: 4px;
    }

    .no-history {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: var(--color-text-secondary);
    }

    .no-history-icon {
      font-size: 2rem;
      margin-bottom: 12px;
    }

    .no-history p {
      margin: 0;
      font-size: 0.875rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .history-details {
        flex-direction: column;
        gap: 4px;
      }

      .history-item {
        flex-direction: column;
        gap: 8px;
      }

      .history-icon {
        align-self: flex-start;
      }
    }
  `]
})
export class WorkflowHistoryComponent {
  @Input() logs: WorkflowActionLog[] = [];

  trackByLogId(index: number, log: WorkflowActionLog): number {
    return log.id;
  }

  getActionIcon(actionType: string): string {
    switch (actionType) {
      case 'START': return '🚀';
      case 'APPROVE': return '✅';
      case 'REJECT': return '❌';
      case 'TRANSFER': return '🔄';
      case 'COMPLETE': return '🏁';
      case 'CANCEL': return '🚫';
      default: return '📝';
    }
  }

  getActionLabel(actionType: string): string {
    switch (actionType) {
      case 'START': return 'Bắt đầu quy trình';
      case 'APPROVE': return 'Phê duyệt';
      case 'REJECT': return 'Từ chối';
      case 'TRANSFER': return 'Chuyển tiếp';
      case 'COMPLETE': return 'Hoàn thành';
      case 'CANCEL': return 'Hủy bỏ';
      default: return actionType;
    }
  }
}
