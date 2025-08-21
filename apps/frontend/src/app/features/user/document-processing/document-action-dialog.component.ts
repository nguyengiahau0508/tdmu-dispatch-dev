import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentProcessingInfo } from './services/document-processing-apollo.service';
import { UsersService } from '../../../core/services/users.service';
import { IUser } from '../../../core/interfaces/user.interface';
import { Subject, takeUntil } from 'rxjs';

export interface DocumentActionData {
  documentId: number;
  actionType: string;
  notes?: string;
  transferToUserId?: number;
}

@Component({
  selector: 'app-document-action-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-overlay" (click)="close()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2 class="dialog-title">
            <span class="action-icon">{{ getActionIcon(actionType) }}</span>
            {{ getActionTitle(actionType) }}
          </h2>
          <button class="close-button" (click)="close()">
            <span class="close-icon">✕</span>
          </button>
        </div>

        <div class="dialog-content">
          <!-- Document Info -->
          <div class="document-info-section">
            <h3 class="section-title">Thông tin văn bản</h3>
            <div class="document-details">
              <div class="detail-row">
                <span class="label">Tiêu đề:</span>
                <span class="value">{{ document?.documentTitle }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Loại văn bản:</span>
                <span class="value">{{ document?.documentType }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Danh mục:</span>
                <span class="value">{{ document?.documentCategory }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Trạng thái:</span>
                <span class="value status-badge" [class]="'status-' + (document?.status || '').toLowerCase()">
                  {{ document?.status }}
                </span>
              </div>
                             <div class="detail-row" *ngIf="document && document.priority">
                 <span class="label">Độ ưu tiên:</span>
                 <span class="value priority-badge" [class]="'priority-' + document.priority.toLowerCase()">
                   {{ getPriorityLabel(document.priority) }}
                 </span>
               </div>
            </div>
          </div>

          <!-- Action Form -->
          <div class="action-form-section">
            <h3 class="section-title">Thông tin hành động</h3>
            
            <!-- Notes -->
            <div class="form-group">
              <label class="form-label" for="notes">
                <span class="label-icon">📝</span>
                Ghi chú (tùy chọn)
              </label>
              <textarea 
                id="notes"
                class="form-textarea" 
                [(ngModel)]="notes"
                placeholder="Nhập ghi chú cho hành động này..."
                rows="3">
              </textarea>
            </div>

            <!-- Transfer User (only for TRANSFER action) -->
            <div class="form-group" *ngIf="actionType === 'TRANSFER'">
              <label class="form-label" for="transferUser">
                <span class="label-icon">👤</span>
                Chuyển cho người dùng
              </label>
              <select 
                id="transferUser"
                class="form-select" 
                [(ngModel)]="selectedTransferUserId"
                [disabled]="isLoadingUsers">
                <option value="">-- Chọn người dùng --</option>
                <option *ngIf="isLoadingUsers" value="" disabled>Đang tải danh sách người dùng...</option>
                <option *ngFor="let user of availableUsers" [value]="user.id">
                  {{ user.fullName }} ({{ user.email }})
                </option>
              </select>
              <div *ngIf="isLoadingUsers" class="loading-indicator">
                <span class="loading-spinner">⏳</span> Đang tải danh sách người dùng...
              </div>
            </div>

            <!-- Confirmation Message -->
            <div class="confirmation-message" [class]="'confirmation-' + actionType.toLowerCase()">
              <div class="confirmation-icon">{{ getConfirmationIcon(actionType) }}</div>
              <div class="confirmation-text">
                <strong>{{ getConfirmationTitle(actionType) }}</strong>
                <p>{{ getConfirmationMessage(actionType) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button class="action-btn secondary" (click)="close()">
            <span class="action-icon">❌</span>
            Hủy bỏ
          </button>
          <button 
            class="action-btn primary" 
            [class]="'action-btn-' + actionType.toLowerCase()"
            (click)="confirmAction()"
            [disabled]="isProcessing">
            <span class="action-icon" *ngIf="!isProcessing">{{ getActionIcon(actionType) }}</span>
            <span class="loading-spinner" *ngIf="isProcessing">⏳</span>
            {{ isProcessing ? 'Đang xử lý...' : getActionButtonText(actionType) }}
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
      max-width: 600px;
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

    .action-icon {
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

    .section-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .document-info-section {
      margin-bottom: 32px;
    }

    .document-details {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 0.875rem;
    }

    .detail-row:last-child {
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

    .status-badge, .priority-badge {
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

    .action-form-section {
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: var(--color-text-primary);
      margin-bottom: 8px;
      font-size: 0.875rem;
    }

    .label-icon {
      font-size: 1rem;
    }

    .form-textarea, .form-select {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-size: 0.875rem;
      background: var(--color-background-primary);
      color: var(--color-text-primary);
      transition: border-color 0.2s ease;
    }

    .form-textarea:focus, .form-select:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .confirmation-message {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }

    .confirmation-approve {
      background: #dcfce7;
      border: 1px solid #bbf7d0;
    }

    .confirmation-reject {
      background: #fee2e2;
      border: 1px solid #fecaca;
    }

    .confirmation-transfer {
      background: #dbeafe;
      border: 1px solid #bfdbfe;
    }

    .confirmation-complete {
      background: #fef3c7;
      border: 1px solid #fed7aa;
    }

    .confirmation-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .confirmation-text {
      flex: 1;
    }

    .confirmation-text strong {
      display: block;
      margin-bottom: 4px;
      color: var(--color-text-primary);
    }

    .confirmation-text p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid var(--color-border);
      justify-content: flex-end;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .action-btn.secondary {
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .action-btn.secondary:hover:not(:disabled) {
      background: var(--color-border);
    }

    .action-btn.primary {
      background: var(--color-primary);
      color: white;
    }

    .action-btn.primary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
    }

    .action-btn-approve {
      background: #10b981;
      color: white;
    }

    .action-btn-approve:hover:not(:disabled) {
      background: #059669;
    }

    .action-btn-reject {
      background: #ef4444;
      color: white;
    }

    .action-btn-reject:hover:not(:disabled) {
      background: #dc2626;
    }

    .action-btn-transfer {
      background: #3b82f6;
      color: white;
    }

    .action-btn-transfer:hover:not(:disabled) {
      background: #2563eb;
    }

    .action-btn-complete {
      background: #f59e0b;
      color: white;
    }

    .action-btn-complete:hover:not(:disabled) {
      background: #d97706;
    }

    .loading-spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .loading-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
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

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class DocumentActionDialogComponent implements OnInit, OnDestroy {
  @Input() document: DocumentProcessingInfo | null = null;
  @Input() actionType: string = '';
  @Output() actionConfirmed = new EventEmitter<DocumentActionData>();
  @Output() dialogClosed = new EventEmitter<void>();

  notes: string = '';
  selectedTransferUserId: number | null = null;
  isProcessing = false;
  isLoadingUsers = false;

  // Users thực tế từ hệ thống
  availableUsers: IUser[] = [];
  private destroy$ = new Subject<void>();

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadAvailableUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAvailableUsers(): void {
    this.isLoadingUsers = true;
    this.usersService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          // Lọc chỉ những user active
          this.availableUsers = users.filter(user => user.isActive);
          this.isLoadingUsers = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoadingUsers = false;
        }
      });
  }

  getActionIcon(actionType: string): string {
    switch (actionType) {
      case 'APPROVE': return '✅';
      case 'REJECT': return '❌';
      case 'TRANSFER': return '🔄';
      case 'COMPLETE': return '🏁';
      default: return '📋';
    }
  }

  getActionTitle(actionType: string): string {
    switch (actionType) {
      case 'APPROVE': return 'Phê duyệt văn bản';
      case 'REJECT': return 'Từ chối văn bản';
      case 'TRANSFER': return 'Chuyển tiếp văn bản';
      case 'COMPLETE': return 'Hoàn thành văn bản';
      default: return 'Xử lý văn bản';
    }
  }

  getActionButtonText(actionType: string): string {
    switch (actionType) {
      case 'APPROVE': return 'Phê duyệt';
      case 'REJECT': return 'Từ chối';
      case 'TRANSFER': return 'Chuyển tiếp';
      case 'COMPLETE': return 'Hoàn thành';
      default: return 'Xác nhận';
    }
  }

  getConfirmationIcon(actionType: string): string {
    switch (actionType) {
      case 'APPROVE': return '✅';
      case 'REJECT': return '❌';
      case 'TRANSFER': return '🔄';
      case 'COMPLETE': return '🏁';
      default: return '📋';
    }
  }

  getConfirmationTitle(actionType: string): string {
    switch (actionType) {
      case 'APPROVE': return 'Xác nhận phê duyệt';
      case 'REJECT': return 'Xác nhận từ chối';
      case 'TRANSFER': return 'Xác nhận chuyển tiếp';
      case 'COMPLETE': return 'Xác nhận hoàn thành';
      default: return 'Xác nhận hành động';
    }
  }

  getConfirmationMessage(actionType: string): string {
    switch (actionType) {
      case 'APPROVE': return 'Văn bản sẽ được phê duyệt và chuyển sang bước tiếp theo trong quy trình.';
      case 'REJECT': return 'Văn bản sẽ bị từ chối và quy trình sẽ dừng lại.';
      case 'TRANSFER': return 'Văn bản sẽ được chuyển cho người dùng khác để xử lý.';
      case 'COMPLETE': return 'Văn bản sẽ được đánh dấu là hoàn thành và kết thúc quy trình.';
      default: return 'Hành động này sẽ được thực hiện trên văn bản.';
    }
  }

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'URGENT': return 'KHẨN CẤP';
      case 'HIGH': return 'CAO';
      case 'MEDIUM': return 'TRUNG BÌNH';
      case 'LOW': return 'THẤP';
      default: return priority;
    }
  }

  confirmAction(): void {
    if (!this.document) return;

    this.isProcessing = true;

    // Simulate API call delay
    setTimeout(() => {
      const actionData: DocumentActionData = {
        documentId: this.document!.documentId,
        actionType: this.actionType,
        notes: this.notes || undefined,
        transferToUserId: Number(this.selectedTransferUserId) || undefined
      };

      this.actionConfirmed.emit(actionData);
      this.isProcessing = false;
    }, 1000);
  }

  close(): void {
    this.dialogClosed.emit();
  }
}
