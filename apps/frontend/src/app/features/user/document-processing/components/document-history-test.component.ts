import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentProcessingApolloService } from '../services/document-processing-apollo.service';

@Component({
  selector: 'app-document-history-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="test-container">
      <h2>Test Lịch sử xử lý tài liệu</h2>
      
      <div class="test-controls">
        <label for="documentId">Document ID:</label>
        <input 
          type="number" 
          id="documentId" 
          [(ngModel)]="documentId" 
          placeholder="Nhập Document ID"
          class="form-control"
        />
        <button 
          (click)="loadHistory()" 
          [disabled]="!documentId || isLoading"
          class="btn btn-primary"
        >
          {{ isLoading ? 'Đang tải...' : 'Tải lịch sử' }}
        </button>
      </div>

      @if (error) {
        <div class="error-message">
          <p>{{ error }}</p>
        </div>
      }

      @if (historyData) {
        <div class="history-results">
          <h3>Kết quả ({{ historyData.totalCount }} items)</h3>
          
          @if (historyData.data && historyData.data.length > 0) {
            <div class="history-list">
              @for (item of historyData.data; track item.id) {
                <div class="history-item">
                  <div class="item-header">
                    <span class="action-type">{{ item.actionType }}</span>
                    <span class="action-date">{{ item.actionAt | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <div class="item-details">
                    <p><strong>Người thực hiện:</strong> {{ item.actionByUser?.fullName || 'Không xác định' }}</p>
                    <p><strong>Bước:</strong> {{ item.stepName }} ({{ item.stepType }})</p>
                    @if (item.note) {
                      <p><strong>Ghi chú:</strong> {{ item.note }}</p>
                    }
                    @if (item.metadata) {
                      <p><strong>Metadata:</strong> {{ item.metadata }}</p>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <p>Không có lịch sử xử lý nào</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .test-controls {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 20px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .form-control {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
    }

    .btn {
      padding: 8px 16px;
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

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .error-message {
      padding: 12px;
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      color: #dc2626;
      margin-bottom: 16px;
    }

    .history-results {
      margin-top: 20px;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .history-item {
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f3f4f6;
    }

    .action-type {
      font-weight: 600;
      color: #1f2937;
    }

    .action-date {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .item-details p {
      margin: 4px 0;
      font-size: 0.875rem;
    }

    .item-details strong {
      color: #374151;
    }
  `]
})
export class DocumentHistoryTestComponent implements OnInit {
  documentId: number = 1;
  historyData: any = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private documentProcessingService: DocumentProcessingApolloService
  ) {}

  ngOnInit(): void {
    // Auto-load history for document ID 1
    this.loadHistory();
    
    // Test với các document IDs khác nhau
    setTimeout(() => {
      console.log('Testing with different document IDs...');
      this.testMultipleDocuments();
    }, 2000);
  }

  testMultipleDocuments(): void {
    const testIds = [1, 2, 3];
    testIds.forEach(id => {
      setTimeout(() => {
        this.documentId = id;
        this.loadHistory();
      }, id * 1000);
    });
  }

  loadHistory(): void {
    if (!this.documentId) return;

    this.isLoading = true;
    this.error = null;

    this.documentProcessingService.getDocumentProcessingHistory(this.documentId).subscribe({
      next: (response) => {
        this.historyData = response;
        this.isLoading = false;
        console.log('History loaded:', response);
      },
      error: (error) => {
        console.error('Error loading history:', error);
        this.error = 'Không thể tải lịch sử: ' + (error.message || 'Lỗi không xác định');
        this.isLoading = false;
      }
    });
  }
}
