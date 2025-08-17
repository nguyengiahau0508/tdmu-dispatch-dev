import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentProcessingInfo } from './services/document-processing-apollo.service';

@Component({
  selector: 'app-document-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" (click)="close()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2 class="dialog-title">
            <span class="document-icon">📄</span>
            Chi tiết văn bản
          </h2>
          <button class="close-button" (click)="close()">
            <span class="close-icon">✕</span>
          </button>
        </div>

        <div class="dialog-content" *ngIf="document">
          <!-- Document Header -->
          <div class="document-header-section">
            <div class="document-title">{{ document.documentTitle }}</div>
            <div class="document-meta">
              <span class="meta-item">
                <span class="meta-icon">📋</span>
                {{ document.documentType }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">📁</span>
                {{ document.documentCategory }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">📅</span>
                {{ document.createdAt | date:'dd/MM/yyyy HH:mm' }}
              </span>
            </div>
          </div>

          <!-- Status and Priority -->
          <div class="status-section">
            <div class="status-row">
              <span class="label">Trạng thái:</span>
              <span class="status-badge" [class]="'status-' + document.status.toLowerCase()">
                {{ document.status }}
              </span>
            </div>
            <div class="status-row" *ngIf="document.priority">
              <span class="label">Độ ưu tiên:</span>
              <span class="priority-badge" [class]="'priority-' + document.priority.toLowerCase()">
                {{ getPriorityLabel(document.priority) }}
              </span>
            </div>
            <div class="status-row" *ngIf="document.workflowStatus">
              <span class="label">Trạng thái quy trình:</span>
              <span class="workflow-status-badge" [class]="'workflow-status-' + document.workflowStatus.toLowerCase()">
                {{ getWorkflowStatusLabel(document.workflowStatus) }}
              </span>
            </div>
          </div>

          <!-- Workflow Information -->
          <div class="workflow-section" *ngIf="document.workflowInstanceId">
            <h3 class="section-title">
              <span class="section-icon">🔄</span>
              Thông tin quy trình
            </h3>
            <div class="workflow-info">
              <div class="info-row">
                <span class="label">ID Quy trình:</span>
                <span class="value">{{ document.workflowInstanceId }}</span>
              </div>
              <div class="info-row" *ngIf="document.currentStepId">
                <span class="label">Bước hiện tại:</span>
                <span class="value">{{ document.currentStepId }}</span>
              </div>
              <div class="info-row" *ngIf="document.currentStepName">
                <span class="label">Tên bước:</span>
                <span class="value">{{ document.currentStepName }}</span>
              </div>
              <div class="info-row" *ngIf="document.actionType">
                <span class="label">Hành động có sẵn:</span>
                <span class="value">{{ document.actionType }}</span>
              </div>
            </div>
          </div>

          <!-- Deadline Information -->
          <div class="deadline-section" *ngIf="document.deadline">
            <h3 class="section-title">
              <span class="section-icon">⏰</span>
              Thông tin deadline
            </h3>
            <div class="deadline-info">
              <div class="deadline-row">
                <span class="label">Deadline:</span>
                <span class="value" [class.overdue]="isOverdue(document.deadline)">
                  {{ getFormattedDeadline(document.deadline) }}
                </span>
              </div>
              <div class="deadline-row" *ngIf="document.deadline">
                <span class="label">Thời gian còn lại:</span>
                <span class="value" [class.urgent]="isUrgent(document.deadline)">
                  {{ getTimeRemaining(document.deadline) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Document Actions -->
          <div class="actions-section" *ngIf="document.requiresAction">
            <h3 class="section-title">
              <span class="section-icon">⚡</span>
              Hành động cần thực hiện
            </h3>
            <div class="actions-info">
              <div class="action-notice">
                <span class="notice-icon">⚠️</span>
                <span class="notice-text">Văn bản này cần được xử lý ngay!</span>
              </div>
              <div class="available-actions" *ngIf="document.actionType">
                <span class="label">Các hành động có thể thực hiện:</span>
                <div class="action-buttons">
                  <button class="action-btn approve" (click)="performAction('APPROVE')">
                    <span class="action-icon">✅</span>
                    Phê duyệt
                  </button>
                  <button class="action-btn reject" (click)="performAction('REJECT')">
                    <span class="action-icon">❌</span>
                    Từ chối
                  </button>
                  <button class="action-btn transfer" (click)="performAction('TRANSFER')">
                    <span class="action-icon">🔄</span>
                    Chuyển tiếp
                  </button>
                  <button class="action-btn complete" (click)="performAction('COMPLETE')">
                    <span class="action-icon">🏁</span>
                    Hoàn thành
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Document History (Mock) -->
          <div class="history-section">
            <h3 class="section-title">
              <span class="section-icon">📚</span>
              Lịch sử xử lý
            </h3>
            <div class="history-list">
              <div class="history-item" *ngFor="let item of getMockHistory()">
                <div class="history-icon">{{ item.icon }}</div>
                <div class="history-content">
                  <div class="history-action">{{ item.action }}</div>
                  <div class="history-details">
                    <span class="history-user">{{ item.user }}</span>
                    <span class="history-time">{{ item.time }}</span>
                  </div>
                  <div class="history-notes" *ngIf="item.notes">
                    {{ item.notes }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button class="action-btn secondary" (click)="close()">
            <span class="action-icon">❌</span>
            Đóng
          </button>
          <button 
            class="action-btn primary" 
            (click)="performAction('APPROVE')"
            *ngIf="document?.requiresAction">
            <span class="action-icon">✅</span>
            Xử lý ngay
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
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

    .dialog-container {
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { 
        opacity: 0; 
        transform: translateY(-20px) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 0 24px;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 24px;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .document-icon {
      font-size: 1.5rem;
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      color: var(--color-text-secondary);
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
    }

    .close-icon {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .dialog-content {
      padding: 0 24px;
    }

    /* Document Header */
    .document-header-section {
      margin-bottom: 24px;
    }

    .document-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .document-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .meta-icon {
      font-size: 1rem;
    }

    /* Status Section */
    .status-section {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 0.875rem;
    }

    .status-row:last-child {
      margin-bottom: 0;
    }

    .label {
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .status-badge, .priority-badge, .workflow-status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-pending {
      background: #fef3c7;
      color: #d97706;
    }

    .status-in_progress {
      background: #dbeafe;
      color: #2563eb;
    }

    .status-completed {
      background: #dcfce7;
      color: #16a34a;
    }

    .priority-urgent {
      background: #fee2e2;
      color: #dc2626;
    }

    .priority-high {
      background: #fef3c7;
      color: #d97706;
    }

    .priority-medium {
      background: #dbeafe;
      color: #2563eb;
    }

    .priority-low {
      background: #dcfce7;
      color: #16a34a;
    }

    .workflow-status-completed {
      background: #dcfce7;
      color: #16a34a;
    }

    .workflow-status-in_progress {
      background: #dbeafe;
      color: #2563eb;
    }

    .workflow-status-cancelled {
      background: #fee2e2;
      color: #dc2626;
    }

    /* Section Styles */
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 16px 0;
    }

    .section-icon {
      font-size: 1.25rem;
    }

    /* Workflow Section */
    .workflow-section {
      margin-bottom: 24px;
    }

    .workflow-info {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 0.875rem;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .value {
      color: var(--color-text-primary);
      font-weight: 500;
    }

    /* Deadline Section */
    .deadline-section {
      margin-bottom: 24px;
    }

    .deadline-info {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
    }

    .deadline-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 0.875rem;
    }

    .deadline-row:last-child {
      margin-bottom: 0;
    }

    .value.overdue {
      color: #ef4444;
      font-weight: 600;
    }

    .value.urgent {
      color: #f59e0b;
      font-weight: 600;
    }

    /* Actions Section */
    .actions-section {
      margin-bottom: 24px;
    }

    .actions-info {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
    }

    .action-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding: 12px;
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 6px;
    }

    .notice-icon {
      font-size: 1.25rem;
    }

    .notice-text {
      font-weight: 500;
      color: #d97706;
    }

    .available-actions {
      margin-top: 16px;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn.approve {
      background: #10b981;
      color: white;
    }

    .action-btn.approve:hover {
      background: #059669;
    }

    .action-btn.reject {
      background: #ef4444;
      color: white;
    }

    .action-btn.reject:hover {
      background: #dc2626;
    }

    .action-btn.transfer {
      background: #3b82f6;
      color: white;
    }

    .action-btn.transfer:hover {
      background: #2563eb;
    }

    .action-btn.complete {
      background: #f59e0b;
      color: white;
    }

    .action-btn.complete:hover {
      background: #d97706;
    }

    .action-btn.secondary {
      background: var(--color-background-secondary);
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
    }

    .action-icon {
      font-size: 1rem;
    }

    /* History Section */
    .history-section {
      margin-bottom: 24px;
    }

    .history-list {
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
    }

    .history-notes {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      font-style: italic;
    }

    /* Dialog Actions */
    .dialog-actions {
      display: flex;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid var(--color-border);
      justify-content: flex-end;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .dialog-container {
        width: 95%;
        margin: 20px;
      }

      .dialog-header {
        padding: 20px 20px 0 20px;
      }

      .dialog-content {
        padding: 0 20px;
      }

      .dialog-actions {
        padding: 20px;
        flex-direction: column;
      }

      .action-btn {
        justify-content: center;
      }

      .document-meta {
        flex-direction: column;
        gap: 8px;
      }

      .status-row, .info-row, .deadline-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class DocumentDetailsComponent {
  @Input() document: DocumentProcessingInfo | null = null;
  @Output() actionRequested = new EventEmitter<{document: DocumentProcessingInfo, action: string}>();
  @Output() dialogClosed = new EventEmitter<void>();

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'URGENT': return 'KHẨN CẤP';
      case 'HIGH': return 'CAO';
      case 'MEDIUM': return 'TRUNG BÌNH';
      case 'LOW': return 'THẤP';
      default: return priority;
    }
  }

  getWorkflowStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'HOÀN THÀNH';
      case 'IN_PROGRESS': return 'ĐANG XỬ LÝ';
      case 'CANCELLED': return 'ĐÃ HỦY';
      default: return status;
    }
  }

  isOverdue(deadline: Date | undefined): boolean {
    if (!deadline) return false;
    
    // Đảm bảo deadline là Date object
    const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return false;
    
    return new Date() > deadlineDate;
  }

  isUrgent(deadline: Date | undefined): boolean {
    if (!deadline) return false;
    
    // Đảm bảo deadline là Date object
    const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return false;
    
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    return hours <= 24 && hours > 0;
  }

  getTimeRemaining(deadline: Date | undefined): string {
    if (!deadline) return 'Không có deadline';
    
    // Đảm bảo deadline là Date object
    const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return 'Deadline không hợp lệ';
    
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Đã quá hạn';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} ngày ${hours} giờ`;
    } else if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    } else {
      return `${minutes} phút`;
    }
  }

  getFormattedDeadline(deadline: Date | undefined): string {
    if (!deadline) return 'Không có deadline';
    
    // Đảm bảo deadline là Date object
    const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return 'Deadline không hợp lệ';
    
    return deadlineDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMockHistory() {
    return [
      {
        icon: '📝',
        action: 'Tạo văn bản',
        user: 'Nguyễn Văn A',
        time: '2024-01-15 09:30',
        notes: 'Văn bản được tạo mới'
      },
      {
        icon: '📤',
        action: 'Gửi phê duyệt',
        user: 'Nguyễn Văn A',
        time: '2024-01-15 10:15',
        notes: 'Gửi cho trưởng phòng phê duyệt'
      },
      {
        icon: '👀',
        action: 'Xem xét',
        user: 'Trần Thị B',
        time: '2024-01-15 14:20',
        notes: 'Đang xem xét nội dung văn bản'
      },
      {
        icon: '✅',
        action: 'Phê duyệt bước 1',
        user: 'Trần Thị B',
        time: '2024-01-16 08:45',
        notes: 'Phê duyệt và chuyển sang bước tiếp theo'
      }
    ];
  }

  performAction(action: string): void {
    if (this.document) {
      this.actionRequested.emit({ document: this.document, action });
    }
  }

  close(): void {
    this.dialogClosed.emit();
  }
}
