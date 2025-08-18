import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentProcessingApolloService, DocumentProcessingHistoryItem } from '../services/document-processing-apollo.service';

@Component({
  selector: 'app-document-processing-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="document-history">
      <div class="history-header">
        <h4>Lịch sử xử lý tài liệu</h4>
        <div class="history-stats">
          <span class="stat-item">
            <span class="stat-label">Tổng số:</span>
            <span class="stat-value">{{ historyData?.totalCount || 0 }}</span>
          </span>
        </div>
      </div>

      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải lịch sử xử lý...</p>
        </div>
      } @else if (error) {
        <div class="error-state">
          <p>{{ error }}</p>
          <button class="btn btn-secondary" (click)="loadHistory()">Thử lại</button>
        </div>
      } @else if (historyItems && historyItems.length > 0) {
        <div class="timeline">
          @for (item of historyItems; track item.id) {
            <div class="timeline-item" [class]="getTimelineItemClass(item.actionType)">
              <div class="timeline-marker">
                <div class="marker-icon">{{ getActionIcon(item.actionType) }}</div>
              </div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <div class="action-info">
                    <span class="action-type">{{ getActionTypeLabel(item.actionType) }}</span>
                    <span class="step-name">{{ item.stepName }}</span>
                  </div>
                  <div class="action-meta">
                    <span class="action-date">{{ item.actionAt | date:'dd/MM/yyyy HH:mm' }}</span>
                    <span class="action-user">{{ item.actionByUser?.fullName || 'Không xác định' }}</span>
                  </div>
                </div>
                
                @if (item.note) {
                  <div class="action-note">
                    <p>{{ item.note }}</p>
                  </div>
                }
                
                @if (item.metadata) {
                  <div class="action-metadata">
                    <details>
                      <summary>Chi tiết bổ sung</summary>
                      <pre>{{ formatMetadata(item.metadata) }}</pre>
                    </details>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p>Chưa có lịch sử xử lý nào</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .document-history {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .history-header h4 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .history-stats {
      display: flex;
      gap: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.875rem;
    }

    .stat-label {
      color: #6b7280;
    }

    .stat-value {
      font-weight: 600;
      color: #1f2937;
    }

    .loading-state,
    .error-state,
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #6b7280;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #f3f4f6;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 12px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-state p {
      margin: 0 0 12px 0;
      color: #dc2626;
    }

    .empty-icon {
      font-size: 2rem;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .timeline {
      position: relative;
      padding-left: 20px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e5e7eb;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 24px;
      padding-left: 40px;
    }

    .timeline-marker {
      position: absolute;
      left: -20px;
      top: 0;
      width: 32px;
      height: 32px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .timeline-item.APPROVE .timeline-marker {
      border-color: #10b981;
      background: #d1fae5;
    }

    .timeline-item.REJECT .timeline-marker {
      border-color: #ef4444;
      background: #fee2e2;
    }

    .timeline-item.TRANSFER .timeline-marker {
      border-color: #3b82f6;
      background: #dbeafe;
    }

    .timeline-item.START .timeline-marker {
      border-color: #8b5cf6;
      background: #ede9fe;
    }

    .timeline-item.COMPLETE .timeline-marker {
      border-color: #059669;
      background: #d1fae5;
    }

    .marker-icon {
      font-size: 14px;
      font-weight: 600;
    }

    .timeline-content {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .action-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .action-type {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.875rem;
    }

    .step-name {
      color: #6b7280;
      font-size: 0.75rem;
      font-style: italic;
    }

    .action-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      text-align: right;
    }

    .action-date {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .action-user {
      font-size: 0.75rem;
      color: #3b82f6;
      font-weight: 500;
    }

    .action-note {
      margin-top: 12px;
      padding: 12px;
      background: white;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }

    .action-note p {
      margin: 0;
      font-size: 0.875rem;
      color: #374151;
      line-height: 1.5;
    }

    .action-metadata {
      margin-top: 12px;
    }

    .action-metadata details {
      font-size: 0.75rem;
    }

    .action-metadata summary {
      cursor: pointer;
      color: #6b7280;
      font-weight: 500;
    }

    .action-metadata pre {
      margin: 8px 0 0 0;
      padding: 8px;
      background: white;
      border-radius: 4px;
      font-size: 0.75rem;
      color: #374151;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    @media (max-width: 768px) {
      .timeline-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .action-meta {
        align-items: flex-start;
        text-align: left;
      }
    }
  `]
})
export class DocumentProcessingHistoryComponent implements OnInit {
  @Input() documentId!: number;
  
  historyData: any = null;
  historyItems: DocumentProcessingHistoryItem[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private documentProcessingService: DocumentProcessingApolloService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    if (!this.documentId) return;

    this.isLoading = true;
    this.error = null;

    this.documentProcessingService.getDocumentProcessingHistory(this.documentId).subscribe({
      next: (response) => {
        this.historyData = response;
        this.historyItems = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading document history:', error);
        this.error = 'Không thể tải lịch sử xử lý';
        this.isLoading = false;
      }
    });
  }

  getActionTypeLabel(actionType: string): string {
    const labels: Record<string, string> = {
      'APPROVE': 'Phê duyệt',
      'REJECT': 'Từ chối',
      'TRANSFER': 'Chuyển tiếp',
      'START': 'Tạo mới/Bắt đầu',
      'COMPLETE': 'Hoàn thành',
      'CANCEL': 'Hủy bỏ'
    };
    return labels[actionType] || actionType;
  }

  getActionIcon(actionType: string): string {
    const icons: Record<string, string> = {
      'APPROVE': '✓',
      'REJECT': '✗',
      'TRANSFER': '→',
      'START': '▶',
      'COMPLETE': '✓',
      'CANCEL': '✗'
    };
    return icons[actionType] || '•';
  }

  getTimelineItemClass(actionType: string): string {
    return actionType;
  }

  formatMetadata(metadata: string): string {
    try {
      const parsed = JSON.parse(metadata);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return metadata;
    }
  }
}
