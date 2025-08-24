import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentProcessingInfo } from './services/document-processing-apollo.service';
import { DocumentProcessingHistoryComponent } from './components/document-processing-history.component';
import { WorkflowHistoryComponent } from './components/workflow-history.component';
import { WorkflowProgressComponent, WorkflowStepProgress } from './components/workflow-progress.component';
import { WorkflowProgressModalComponent } from './components/workflow-progress-modal.component';
import { DocumentDetailsService, DocumentDetails, WorkflowInstanceDetails } from './services/document-details.service';
import { DigitalSignatureService, DigitalSignature } from '../../digital-signature/services/digital-signature.service';
import { SignatureModalComponent } from '../../digital-signature/components/signature-modal.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-document-details',
  standalone: true,
  imports: [CommonModule, DocumentProcessingHistoryComponent, WorkflowHistoryComponent, WorkflowProgressComponent, WorkflowProgressModalComponent, SignatureModalComponent],
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

        <div class="dialog-content" *ngIf="documentDetails || document">
          <!-- Loading State -->
          <div class="loading-section" *ngIf="isLoading">
            <div class="loading-spinner"></div>
            <p>Đang tải thông tin chi tiết...</p>
          </div>

          <!-- Document Details -->
          <div class="document-details" *ngIf="!isLoading && (documentDetails || document)">
            <!-- Document Header -->
            <div class="document-header-section">
              <div class="document-title">{{ getDocumentTitle() }}</div>
              <div class="document-meta">
                <span class="meta-item">
                  <span class="meta-icon">📋</span>
                  {{ getDocumentType() }}
                </span>
                <span class="meta-item">
                  <span class="meta-icon">📁</span>
                  {{ getDocumentCategory() }}
                </span>
                <span class="meta-item">
                  <span class="meta-icon">📅</span>
                  {{ getCreatedAt() | date:'dd/MM/yyyy HH:mm' }}
                </span>
                <span class="meta-item" *ngIf="getDocumentNumber()">
                  <span class="meta-icon">🔢</span>
                  {{ getDocumentNumber() }}
                </span>
              </div>
            </div>

            <!-- Status and Priority -->
            <div class="status-section">
              <div class="status-row">
                <span class="label">Trạng thái:</span>
                <span class="status-badge" [class]="'status-' + getDocumentStatus().toLowerCase()">
                  {{ getDocumentStatus() }}
                </span>
              </div>
              <div class="status-row" *ngIf="getPriority()">
                <span class="label">Độ ưu tiên:</span>
                <span class="priority-badge" [class]="'priority-' + getPriority().toLowerCase()">
                  {{ getPriorityLabel(getPriority()) }}
                </span>
              </div>
              <div class="status-row" *ngIf="getWorkflowStatus()">
                <span class="label">Trạng thái quy trình:</span>
                <span class="workflow-status-badge" [class]="'workflow-status-' + getWorkflowStatus()!.toLowerCase()">
                  {{ getWorkflowStatusLabel(getWorkflowStatus()!) }}
                </span>
              </div>
            </div>

            <!-- Document Content -->
            <div class="content-section" *ngIf="getDocumentContent()">
              <h3 class="section-title">
                <span class="section-icon">📝</span>
                Nội dung văn bản
              </h3>
              <div class="content-box">
                <p class="content-text">{{ getDocumentContent() }}</p>
              </div>
            </div>

            <!-- File Attachment -->
            <div class="file-section" *ngIf="getFileInfo()">
              <h3 class="section-title">
                <span class="section-icon">📎</span>
                File đính kèm
              </h3>
              <div class="file-info">
                <div class="file-item">
                  <span class="file-icon">📄</span>
                  <div class="file-details">
                    <span class="file-name">{{ getFileInfo()?.originalName }}</span>
                    <span class="file-type">{{ getFileInfo()?.mimeType }}</span>
                  </div>
                  <a 
                    [href]="getFileDownloadUrl()" 
                    target="_blank" 
                    class="download-btn"
                    *ngIf="getFileDownloadUrl()">
                    <span class="download-icon">⬇️</span>
                    Tải xuống
                  </a>
                </div>
              </div>
            </div>

            <!-- User Information -->
            <div class="user-section">
              <h3 class="section-title">
                <span class="section-icon">👥</span>
                Thông tin người dùng
              </h3>
              <div class="user-info">
                <div class="user-row">
                  <span class="label">Người tạo:</span>
                  <div class="user-details">
                    <span class="user-name">{{ getCreatedByName() }}</span>
                    <span class="user-email">{{ getCreatedByEmail() }}</span>
                  </div>
                </div>
                <div class="user-row" *ngIf="getAssignedToName()">
                  <span class="label">Người được giao:</span>
                  <div class="user-details">
                    <span class="user-name">{{ getAssignedToName() }}</span>
                    <span class="user-email">{{ getAssignedToEmail() }}</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- Workflow Progress -->
            <div class="workflow-progress-section" *ngIf="getWorkflowProgressSteps()?.length">
              <div class="progress-header">
                <h3 class="section-title">
                  <span class="section-icon">📊</span>
                  Tiến độ quy trình
                </h3>
                <button class="view-progress-btn" (click)="openWorkflowProgressModal()">
                  <span class="btn-icon">🔍</span>
                  Xem chi tiết
                </button>
              </div>
              <app-workflow-progress [steps]="getWorkflowProgressSteps() || []"></app-workflow-progress>
            </div>

            <!-- Workflow Information -->
            <div class="workflow-section" *ngIf="getWorkflowInstanceId()">
              <h3 class="section-title">
                <span class="section-icon">🔄</span>
                Thông tin quy trình
              </h3>
              <div class="workflow-info">
                <div class="info-row">
                  <span class="label">ID Quy trình:</span>
                  <span class="value">{{ getWorkflowInstanceId() }}</span>
                </div>
                <div class="info-row" *ngIf="getWorkflowTemplateName()">
                  <span class="label">Mẫu quy trình:</span>
                  <span class="value">{{ getWorkflowTemplateName() }}</span>
                </div>
                <div class="info-row" *ngIf="getCurrentStepName()">
                  <span class="label">Bước hiện tại:</span>
                  <span class="value">{{ getCurrentStepName() }}</span>
                </div>
                <div class="info-row" *ngIf="getCurrentStepType()">
                  <span class="label">Loại bước:</span>
                  <span class="value">{{ getCurrentStepType() }}</span>
                </div>
                <div class="info-row" *ngIf="getCurrentAssigneeName()">
                  <span class="label">Người đang xử lý:</span>
                  <div class="user-details">
                    <span class="user-name">{{ getCurrentAssigneeName() }}</span>
                    <span class="user-email">{{ getCurrentAssigneeEmail() }}</span>
                  </div>
                </div>
                <div class="info-row" *ngIf="getWorkflowNotes()">
                  <span class="label">Ghi chú:</span>
                  <span class="value">{{ getWorkflowNotes() }}</span>
                </div>
              </div>
            </div>

            <!-- Deadline Information -->
            <div class="deadline-section" *ngIf="getDeadline()">
              <h3 class="section-title">
                <span class="section-icon">⏰</span>
                Thông tin deadline
              </h3>
              <div class="deadline-info">
                <div class="deadline-row">
                  <span class="label">Deadline:</span>
                  <span class="value" [class.overdue]="isOverdue(getDeadline())">
                    {{ getFormattedDeadline(getDeadline()) }}
                  </span>
                </div>
                <div class="deadline-row" *ngIf="getDeadline()">
                  <span class="label">Thời gian còn lại:</span>
                  <span class="value" [class.urgent]="isUrgent(getDeadline())">
                    {{ getTimeRemaining(getDeadline()) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Document Actions -->
            <div class="actions-section" *ngIf="getRequiresAction()">
              <h3 class="section-title">
                <span class="section-icon">⚡</span>
                Hành động cần thực hiện
              </h3>
              <div class="actions-info">
                <div class="action-notice">
                  <span class="notice-icon">⚠️</span>
                  <span class="notice-text">Văn bản này cần được xử lý ngay!</span>
                </div>
                <div class="available-actions" *ngIf="getActionType()">
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

            <!-- Workflow History -->
            <div class="workflow-history-section" *ngIf="getWorkflowLogs()?.length">
              <h3 class="section-title">
                <span class="section-icon">📚</span>
                Lịch sử quy trình
              </h3>
              <app-workflow-history [logs]="getWorkflowLogs() || []"></app-workflow-history>
            </div>

            <!-- Digital Signatures -->
            <div class="digital-signature-section" *ngIf="getDocumentId()">
              <h3 class="section-title">
                <span class="section-icon">✍️</span>
                Chữ ký số
              </h3>
              <div class="signature-info">
                <!-- Signature Status -->
                <div class="signature-status">
                  <div class="status-indicator" [class]="getSignatureStatusClass()">
                    <span class="status-icon">{{ getSignatureStatusIcon() }}</span>
                    <span class="status-text">{{ getSignatureStatusText() }}</span>
                  </div>
                </div>

                <!-- Existing Signatures -->
                <div class="existing-signatures" *ngIf="getDocumentSignatures()?.length">
                  <h4 class="subsection-title">Chữ ký đã có:</h4>
                  <div class="signature-list">
                    <div class="signature-item" *ngFor="let signature of getDocumentSignatures()">
                      <div class="signature-header">
                        <span class="signature-icon">✍️</span>
                        <div class="signature-details">
                          <span class="signer-name">{{ signature.signedByUser?.fullName || 'Unknown' }}</span>
                          <span class="signature-time">{{ signature.signatureTimestamp | date:'dd/MM/yyyy HH:mm' }}</span>
                        </div>
                        <span class="signature-validity" [class]="signature.isValid ? 'valid' : 'invalid'">
                          {{ signature.isValid ? '✅ Hợp lệ' : '❌ Không hợp lệ' }}
                        </span>
                      </div>
                      <div class="certificate-info" *ngIf="signature.certificate">
                        <span class="certificate-serial">Số seri: {{ signature.certificate.serialNumber }}</span>
                        <span class="certificate-issuer">Tổ chức: {{ signature.certificate.issuer }}</span>
                      </div>
                      <div class="signature-actions">
                        <button class="verify-btn" (click)="verifySignature(signature.id)">
                          <span class="btn-icon">🔍</span>
                          Xác thực
                        </button>
                        <button class="revoke-btn" (click)="revokeSignature(signature.id)" *ngIf="canRevokeSignature(signature)">
                          <span class="btn-icon">🚫</span>
                          Thu hồi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No Signatures -->
                <div class="no-signatures" *ngIf="!getDocumentSignatures()?.length">
                  <div class="no-signature-message">
                    <span class="message-icon">📝</span>
                    <span class="message-text">Chưa có chữ ký số cho văn bản này</span>
                  </div>
                </div>

                <!-- Signature Actions -->
                <div class="signature-actions-section" *ngIf="canSignDocument()">
                  <h4 class="subsection-title">Thực hiện chữ ký:</h4>
                  <div class="signature-action-buttons">
                    <button class="sign-btn primary" (click)="openSignatureModal()">
                      <span class="btn-icon">✍️</span>
                      Ký số văn bản
                    </button>
                    <button class="sign-btn secondary" (click)="openCertificateManager()">
                      <span class="btn-icon">🔐</span>
                      Quản lý chứng thư
                    </button>
                  </div>
                </div>

                <!-- Signature Requirements -->
                <div class="signature-requirements" *ngIf="getSignatureRequirements()">
                  <h4 class="subsection-title">Yêu cầu chữ ký:</h4>
                  <div class="requirements-list">
                    <div class="requirement-item" *ngFor="let requirement of getSignatureRequirements()">
                      <span class="requirement-icon">{{ requirement.icon }}</span>
                      <span class="requirement-text">{{ requirement.text }}</span>
                      <span class="requirement-status" [class]="requirement.met ? 'met' : 'pending'">
                        {{ requirement.met ? '✅' : '⏳' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Document History -->
            <div class="history-section">
              <h3 class="section-title">
                <span class="section-icon">📚</span>
                Lịch sử xử lý
              </h3>
              <app-document-processing-history 
                [documentId]="getDocumentId()">
              </app-document-processing-history>
            </div>
          </div>
        </div>

        <!-- Workflow Progress Modal -->
        <app-workflow-progress-modal
          *ngIf="showWorkflowProgressModal"
          [steps]="getWorkflowProgressSteps() || []"
          [workflowInfo]="getWorkflowInfo()"
          (modalClosed)="closeWorkflowProgressModal()"
          (exportRequested)="exportWorkflowProgress()">
        </app-workflow-progress-modal>

        <!-- Signature Modal -->
        <app-signature-modal
          *ngIf="showSignatureModal"
          [documentId]="getDocumentId()"
          [documentTitle]="getDocumentTitle()"
          [documentNumber]="getDocumentNumber() || ''"
          [documentCreatedAt]="getCreatedAt()"
          (modalClosed)="closeSignatureModal()"
          (signatureCompleted)="onSignatureCompleted($event)">
        </app-signature-modal>

        <div class="dialog-actions">
          <button class="action-btn secondary" (click)="close()">
            <span class="action-icon">❌</span>
            Đóng
          </button>
          <button 
            class="action-btn primary" 
            (click)="performAction('APPROVE')"
            *ngIf="getRequiresAction()">
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
      max-width: 900px;
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

    /* Loading Section */
    .loading-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--color-border);
      border-top: 4px solid var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Loading Section */
    .loading-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--color-border);
      border-top: 4px solid var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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

    /* Content Section */
    .content-section {
      margin-bottom: 24px;
    }

    .content-box {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
    }

    .content-text {
      margin: 0;
      line-height: 1.6;
      color: var(--color-text-primary);
      white-space: pre-wrap;
    }

    /* File Section */
    .file-section {
      margin-bottom: 24px;
    }

    .file-info {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .file-icon {
      font-size: 1.5rem;
    }

    .file-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .file-name {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .file-type {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .download-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--color-primary);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .download-btn:hover {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
      transform: translateY(-1px);
    }

    /* User Section */
    .user-section {
      margin-bottom: 24px;
    }

    .user-info {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
    }

    .user-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      font-size: 0.875rem;
    }

    .user-row:last-child {
      margin-bottom: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .user-name {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .user-email {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    /* Workflow History */
    .workflow-history-section {
      margin-bottom: 24px;
    }

    .workflow-history {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
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

    /* Content Section */
    .content-section {
      margin-bottom: 24px;
    }

    .content-box {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
    }

    .content-text {
      margin: 0;
      line-height: 1.6;
      color: var(--color-text-primary);
      white-space: pre-wrap;
    }

    /* File Section */
    .file-section {
      margin-bottom: 24px;
    }

    .file-info {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .file-icon {
      font-size: 1.5rem;
    }

    .file-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .file-name {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .file-type {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .download-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--color-primary);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .download-btn:hover {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
      transform: translateY(-1px);
    }

    /* User Section */
    .user-section {
      margin-bottom: 24px;
    }

    .user-info {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
    }

    .user-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      font-size: 0.875rem;
    }

    .user-row:last-child {
      margin-bottom: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .user-name {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .user-email {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
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

    /* Workflow Progress */
    .workflow-progress-section {
      margin-bottom: 24px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .view-progress-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .view-progress-btn:hover {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
      transform: translateY(-1px);
    }

    .btn-icon {
      font-size: 1rem;
    }

    /* Workflow History */
    .workflow-history-section {
      margin-bottom: 24px;
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

    /* Digital Signature Section */
    .digital-signature-section {
      margin-bottom: 24px;
    }

    .signature-info {
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
    }

    .signature-status {
      margin-bottom: 16px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 6px;
      font-weight: 500;
    }

    .status-indicator.signed {
      background: #dcfce7;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }

    .status-indicator.pending {
      background: #fef3c7;
      color: #d97706;
      border: 1px solid #fde68a;
    }

    .status-indicator.required {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .status-icon {
      font-size: 1.25rem;
    }

    .subsection-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 16px 0 12px 0;
    }

    .existing-signatures {
      margin-bottom: 16px;
    }

    .signature-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .signature-item {
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 12px;
    }

    .signature-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .signature-icon {
      font-size: 1.25rem;
    }

    .signature-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .signer-name {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .signature-time {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .signature-validity {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .signature-validity.valid {
      background: #dcfce7;
      color: #16a34a;
    }

    .signature-validity.invalid {
      background: #fee2e2;
      color: #dc2626;
    }

    .certificate-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 8px;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .signature-actions {
      display: flex;
      gap: 8px;
    }

    .verify-btn, .revoke-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .verify-btn {
      background: #3b82f6;
      color: white;
    }

    .verify-btn:hover {
      background: #2563eb;
    }

    .revoke-btn {
      background: #ef4444;
      color: white;
    }

    .revoke-btn:hover {
      background: #dc2626;
    }

    .no-signatures {
      margin-bottom: 16px;
    }

    .no-signature-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: var(--color-background-primary);
      border: 1px dashed var(--color-border);
      border-radius: 6px;
      color: var(--color-text-secondary);
    }

    .message-icon {
      font-size: 1.25rem;
    }

    .signature-actions-section {
      margin-bottom: 16px;
    }

    .signature-action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .sign-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .sign-btn.primary {
      background: #10b981;
      color: white;
    }

    .sign-btn.primary:hover {
      background: #059669;
      transform: translateY(-1px);
    }

    .sign-btn.secondary {
      background: var(--color-background-primary);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .sign-btn.secondary:hover {
      background: var(--color-border);
    }

    .signature-requirements {
      margin-top: 16px;
    }

    .requirements-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .requirement-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--color-background-primary);
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .requirement-icon {
      font-size: 1rem;
    }

    .requirement-text {
      flex: 1;
      color: var(--color-text-primary);
    }

    .requirement-status {
      font-size: 1rem;
    }

    .requirement-status.met {
      color: #16a34a;
    }

    .requirement-status.pending {
      color: #f59e0b;
    }

    /* History Section */
    .history-section {
      margin-bottom: 24px;
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

      .status-row, .info-row, .deadline-row, .user-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .progress-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .view-progress-btn {
        justify-content: center;
      }

      .user-details {
        align-items: flex-start;
      }

      /* Digital Signature Responsive */
      .signature-action-buttons {
        flex-direction: column;
      }

      .signature-actions {
        flex-direction: column;
        gap: 6px;
      }

      .signature-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .certificate-info {
        margin-top: 8px;
      }

      .requirements-list {
        gap: 6px;
      }

      .requirement-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }
    }
  `]
})
export class DocumentDetailsComponent implements OnInit, OnDestroy {
  @Input() document: DocumentProcessingInfo | null = null;
  @Output() actionRequested = new EventEmitter<{document: DocumentProcessingInfo, action: string}>();
  @Output() dialogClosed = new EventEmitter<void>();

  documentDetails: DocumentDetails | null = null;
  workflowInstanceDetails: WorkflowInstanceDetails | null = null;
  workflowProgressSteps: WorkflowStepProgress[] = [];
  showWorkflowProgressModal = false;
  showSignatureModal = false;
  isLoading = false;
  documentSignatures: DigitalSignature[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private documentDetailsService: DocumentDetailsService,
    private digitalSignatureService: DigitalSignatureService
  ) {}

  ngOnInit(): void {
    if (this.document?.documentId) {
      this.loadDocumentDetails();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDocumentDetails(): void {
    if (!this.document?.documentId) return;

    console.log('Loading document details for ID:', this.document.documentId);
    this.isLoading = true;
    
    // Load document details
    this.documentDetailsService.getDocumentDetails(this.document.documentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details) => {
          console.log('Document details loaded:', details);
          console.log('Workflow instance:', details.workflowInstance);
          console.log('Workflow instance ID:', details.workflowInstanceId);
          
          this.documentDetails = details;
          // Tạo workflow progress data nếu có workflow instance
          if (details.workflowInstance) {
            console.log('Creating workflow progress data...');
            this.workflowProgressSteps = this.documentDetailsService.createWorkflowProgressData(details.workflowInstance);
            console.log('Workflow progress steps:', this.workflowProgressSteps);
          } else {
            console.log('No workflow instance found for this document');
          }
          
          // Load digital signatures
          this.loadDocumentSignatures();
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading document details:', error);
          this.isLoading = false;
        }
      });
  }

  private loadDocumentSignatures(): void {
    if (!this.document?.documentId) return;

    console.log('Loading digital signatures for document ID:', this.document.documentId);
    this.digitalSignatureService.getDocumentSignatures(this.document.documentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (signatures) => {
          console.log('Digital signatures loaded:', signatures);
          this.documentSignatures = signatures;
        },
        error: (error) => {
          console.error('Error loading digital signatures:', error);
          this.documentSignatures = [];
        }
      });
  }

  // Helper methods for getting data
  getDocumentId(): number {
    return this.documentDetails?.id || this.document?.documentId || 0;
  }

  getDocumentTitle(): string {
    return this.documentDetails?.title || this.document?.documentTitle || 'Unknown Document';
  }

  getDocumentType(): string {
    return this.documentDetails?.documentType || this.document?.documentType || 'Unknown';
  }

  getDocumentCategory(): string {
    return this.documentDetails?.documentCategory?.name || this.document?.documentCategory || 'Unknown';
  }

  getDocumentStatus(): string {
    return this.documentDetails?.status || this.document?.status || 'Unknown';
  }

  getDocumentContent(): string | undefined {
    return this.documentDetails?.content;
  }

  getDocumentNumber(): string | undefined {
    return this.documentDetails?.documentNumber;
  }

  getCreatedAt(): Date {
    return this.documentDetails?.createdAt || this.document?.createdAt || new Date();
  }

  getPriority(): string {
    return this.documentDetails?.priority || this.document?.priority || 'MEDIUM';
  }

  getDeadline(): Date | undefined {
    return this.documentDetails?.deadline || this.document?.deadline;
  }

  getFileInfo() {
    return this.documentDetails?.file;
  }

  getFileDownloadUrl(): string | undefined {
    const file = this.getFileInfo();
    if (!file) return undefined;
    return `https://drive.google.com/uc?export=download&id=${file.driveFileId}`;
  }

  getCreatedByName(): string {
    return this.documentDetails?.createdByUser?.fullName || this.document?.createdByName || 'Unknown';
  }

  getCreatedByEmail(): string {
    return this.documentDetails?.createdByUser?.email || this.document?.createdByEmail || '';
  }

  getAssignedToName(): string | undefined {
    return this.documentDetails?.assignedToUser?.fullName;
  }

  getAssignedToEmail(): string | undefined {
    return this.documentDetails?.assignedToUser?.email;
  }

  getWorkflowInstanceId(): number | undefined {
    const workflowInstanceId = this.documentDetails?.workflowInstanceId || this.document?.workflowInstanceId;
    console.log('getWorkflowInstanceId():', workflowInstanceId);
    console.log('documentDetails?.workflowInstance:', this.documentDetails?.workflowInstance);
    return workflowInstanceId;
  }

  getWorkflowStatus(): string | undefined {
    return this.documentDetails?.workflowInstance?.status || this.document?.workflowStatus;
  }

  getWorkflowTemplateName(): string | undefined {
    return this.documentDetails?.workflowInstance?.template?.name;
  }

  getCurrentStepName(): string | undefined {
    return this.documentDetails?.workflowInstance?.currentStep?.name || this.document?.currentStepName;
  }

  getCurrentStepType(): string | undefined {
    return this.documentDetails?.workflowInstance?.currentStep?.type;
  }

  getCurrentAssigneeName(): string | undefined {
    return this.documentDetails?.workflowInstance?.currentAssigneeUser?.fullName || this.document?.currentAssigneeName;
  }

  getCurrentAssigneeEmail(): string | undefined {
    return this.documentDetails?.workflowInstance?.currentAssigneeUser?.email || this.document?.currentAssigneeEmail;
  }

  getWorkflowNotes(): string | undefined {
    return this.documentDetails?.workflowInstance?.notes;
  }

  getWorkflowLogs() {
    return this.documentDetails?.workflowInstance?.logs;
  }

  getWorkflowProgressSteps(): WorkflowStepProgress[] {
    console.log('getWorkflowProgressSteps():', this.workflowProgressSteps);
    console.log('getWorkflowProgressSteps()?.length:', this.workflowProgressSteps?.length);
    return this.workflowProgressSteps;
  }

  getWorkflowInfo() {
    if (!this.documentDetails?.workflowInstance) return null;
    
    return {
      templateName: this.documentDetails.workflowInstance.template?.name,
      documentTitle: this.getDocumentTitle(),
      status: this.documentDetails.workflowInstance.status
    };
  }

  openWorkflowProgressModal(): void {
    this.showWorkflowProgressModal = true;
  }

  closeWorkflowProgressModal(): void {
    this.showWorkflowProgressModal = false;
  }

  exportWorkflowProgress(): void {
    // TODO: Implement export functionality
    console.log('Export workflow progress');
    alert('Tính năng xuất báo cáo sẽ được phát triển trong phiên bản tiếp theo!');
  }

  getRequiresAction(): boolean {
    return this.document?.requiresAction || false;
  }

  getActionType(): string | undefined {
    return this.document?.actionType;
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

  getWorkflowStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'HOÀN THÀNH';
      case 'IN_PROGRESS': return 'ĐANG XỬ LÝ';
      case 'CANCELLED': return 'ĐÃ HỦY';
      case 'REJECTED': return 'ĐÃ TỪ CHỐI';
      default: return status;
    }
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

  isOverdue(deadline: Date | undefined): boolean {
    if (!deadline) return false;
    
    const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return false;
    
    return new Date() > deadlineDate;
  }

  isUrgent(deadline: Date | undefined): boolean {
    if (!deadline) return false;
    
    const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return false;
    
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    return hours <= 24 && hours > 0;
  }

  getTimeRemaining(deadline: Date | undefined): string {
    if (!deadline) return 'Không có deadline';
    
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

  performAction(action: string): void {
    if (this.document) {
      this.actionRequested.emit({ document: this.document, action });
    }
  }

  close(): void {
    this.dialogClosed.emit();
  }

  // Digital Signature Methods
  getDocumentSignatures(): DigitalSignature[] {
    return this.documentSignatures;
  }

  getSignatureStatusClass(): string {
    const signatures = this.getDocumentSignatures();
    if (signatures.length === 0) {
      return 'pending';
    }
    
    const validSignatures = signatures.filter(s => s.isValid);
    if (validSignatures.length === signatures.length) {
      return 'signed';
    }
    
    return 'required';
  }

  getSignatureStatusIcon(): string {
    const statusClass = this.getSignatureStatusClass();
    switch (statusClass) {
      case 'signed': return '✅';
      case 'pending': return '⏳';
      case 'required': return '⚠️';
      default: return '📝';
    }
  }

  getSignatureStatusText(): string {
    const statusClass = this.getSignatureStatusClass();
    switch (statusClass) {
      case 'signed': return 'Đã ký số hoàn chỉnh';
      case 'pending': return 'Chưa có chữ ký số';
      case 'required': return 'Cần ký số bổ sung';
      default: return 'Trạng thái không xác định';
    }
  }

  canSignDocument(): boolean {
    // TODO: Implement permission check
    // Check if current user can sign this document
    return true;
  }

  canRevokeSignature(signature: any): boolean {
    // TODO: Implement permission check
    // Check if current user can revoke this signature
    return true;
  }

  getSignatureRequirements(): any[] {
    // TODO: Implement actual requirements check
    // This should check workflow step requirements
    return [
      {
        icon: '🔐',
        text: 'Chứng thư số hợp lệ',
        met: true
      },
      {
        icon: '📋',
        text: 'Quyền ký số',
        met: true
      },
      {
        icon: '⏰',
        text: 'Trong thời hạn ký',
        met: true
      }
    ];
  }

  verifySignature(signatureId: number): void {
    console.log('Verifying signature:', signatureId);
    this.digitalSignatureService.verifyDigitalSignature({ signatureId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isValid) => {
          if (isValid) {
            alert('✅ Chữ ký số hợp lệ!');
          } else {
            alert('❌ Chữ ký số không hợp lệ!');
          }
          // Reload signatures to update status
          this.loadDocumentSignatures();
        },
        error: (error) => {
          console.error('Error verifying signature:', error);
          alert('❌ Lỗi khi xác thực chữ ký số: ' + error.message);
        }
      });
  }

  revokeSignature(signatureId: number): void {
    console.log('Revoking signature:', signatureId);
    if (confirm('Bạn có chắc chắn muốn thu hồi chữ ký số này?')) {
      this.digitalSignatureService.revokeDigitalSignature(signatureId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              alert('✅ Đã thu hồi chữ ký số thành công!');
              // Reload signatures
              this.loadDocumentSignatures();
            } else {
              alert('❌ Không thể thu hồi chữ ký số!');
            }
          },
          error: (error) => {
            console.error('Error revoking signature:', error);
            alert('❌ Lỗi khi thu hồi chữ ký số: ' + error.message);
          }
        });
    }
  }

  openSignatureModal(): void {
    console.log('Opening signature modal for document:', this.getDocumentId());
    this.showSignatureModal = true;
  }

  closeSignatureModal(): void {
    this.showSignatureModal = false;
  }

  onSignatureCompleted(signature: any): void {
    console.log('Signature completed:', signature);
    // Reload signatures after successful signing
    this.loadDocumentSignatures();
    alert('✅ Ký số văn bản thành công!');
  }

  openCertificateManager(): void {
    // TODO: Implement certificate manager
    console.log('Opening certificate manager');
    alert('Tính năng quản lý chứng thư số sẽ được phát triển!');
  }
}
