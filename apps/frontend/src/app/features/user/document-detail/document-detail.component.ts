import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Document } from '../../../core/services/dispatch/documents.service';
import { FileService } from '../../../core/services/file.service';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="document-detail-overlay" (click)="close()">
      <div class="document-detail-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Chi tiết văn bản</h3>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>

        @if (document) {
          <div class="document-content">
            <div class="document-info">
              <div class="info-row">
                <label>Tiêu đề:</label>
                <span>{{ document.title }}</span>
              </div>
              
              <div class="info-row">
                <label>Loại văn bản:</label>
                <span>{{ getDocumentTypeLabel(document.documentType) }}</span>
              </div>
              
              <div class="info-row">
                <label>Nhóm văn bản:</label>
                <span>{{ document.documentCategory?.name || 'Chưa phân loại' }}</span>
              </div>
              
              <div class="info-row">
                <label>Trạng thái:</label>
                <span class="status-badge" [class]="getStatusClass(document.status || 'draft')">
                  {{ getStatusLabel(document.status || 'draft') }}
                </span>
              </div>
              
              <div class="info-row">
                <label>Ngày tạo:</label>
                <span>{{ document.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              
              <div class="info-row">
                <label>Cập nhật lần cuối:</label>
                <span>{{ document.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              
              @if (document.content) {
                <div class="info-row content-row">
                  <label>Nội dung:</label>
                  <div class="content-text">{{ document.content }}</div>
                </div>
              }
              
              @if (document.file) {
                <div class="info-row">
                  <label>File đính kèm:</label>
                  <div class="file-info">
                    <span class="file-name">{{ document.file.driveFileId }}</span>
                    <button class="btn btn-primary btn-sm" (click)="downloadFile(document.file)">
                      Tải xuống
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="close()">Đóng</button>
          <button class="btn btn-primary" (click)="edit()">Chỉnh sửa</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .document-detail-overlay {
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

    .document-detail-modal {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
    }

    .close-btn:hover {
      color: #374151;
    }

    .document-content {
      padding: 20px;
    }

    .document-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .info-row label {
      min-width: 120px;
      font-weight: 600;
      color: #374151;
    }

    .info-row span {
      flex: 1;
      color: #6b7280;
    }

    .content-row {
      align-items: flex-start;
    }

    .content-text {
      flex: 1;
      white-space: pre-wrap;
      line-height: 1.6;
      color: #374151;
      background: #f9fafb;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-draft { background: #f3f4f6; color: #374151; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-processing { background: #dbeafe; color: #1e40af; }
    .status-completed { background: #d1fae5; color: #065f46; }

    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .file-name {
      font-family: monospace;
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }
  `]
})
export class DocumentDetailComponent {
  @Input() document?: Document;
  @Output() closed = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<Document>();

  constructor(private fileService: FileService) {}

  getDocumentTypeLabel(type: string): string {
    const typeLabels: Record<string, string> = {
      'INCOMING': 'Công văn đến',
      'OUTGOING': 'Công văn đi',
      'INTERNAL': 'Nội bộ'
    };
    return typeLabels[type] || type;
  }

  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'draft': 'Bản nháp',
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'completed': 'Đã hoàn thành'
    };
    return statusLabels[status] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'draft': 'status-draft',
      'pending': 'status-pending',
      'processing': 'status-processing',
      'completed': 'status-completed'
    };
    return statusClasses[status] || 'status-default';
  }

  async downloadFile(file: any): Promise<void> {
    try {
      await this.fileService.downloadFile(file.driveFileId, file.driveFileId);
    } catch (error) {
      console.error('Error downloading file:', error);
      // TODO: Show error notification
    }
  }

  edit(): void {
    if (this.document) {
      this.editRequested.emit(this.document);
    }
  }

  close(): void {
    this.closed.emit();
  }
}
