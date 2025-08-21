import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentActionDialogComponent, DocumentActionData } from './document-action-dialog.component';
import { DocumentDetailsComponent } from './document-details.component';
import { ToastNotificationService } from './toast-notification.service';
import { DocumentProcessingApolloService, DocumentProcessingInfo, ProcessingStatistics, DocumentActionInput } from './services/document-processing-apollo.service';
import { UsersService } from '../../../core/services/users.service';
import { UserState } from '../../../core/state/user.state';

@Component({
  selector: 'app-document-processing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DocumentActionDialogComponent,
    DocumentDetailsComponent,
  ],
  template: `
    <div class="document-processing-container">
      <!-- Header -->
      <div class="header-card">
        <div class="header-content">
          <div class="header-icon">📋</div>
          <div class="header-text">
            <h1 class="header-title">Xử lý Văn bản</h1>
            <p class="header-subtitle">Quản lý và xử lý các văn bản cần phê duyệt</p>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="statistics-grid" *ngIf="statistics">
        <div class="stat-card pending">
          <div class="stat-icon">⏰</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.pendingCount }}</div>
            <div class="stat-label">Chờ xử lý</div>
          </div>
        </div>

        <div class="stat-card in-progress">
          <div class="stat-icon">🔄</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.inProgressCount }}</div>
            <div class="stat-label">Đang xử lý</div>
          </div>
        </div>

        <div class="stat-card completed">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.completedCount }}</div>
            <div class="stat-label">Đã hoàn thành</div>
          </div>
        </div>

        <div class="stat-card rate">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <div class="stat-number">{{ statistics.completionRate | number:'1.0-0' }}%</div>
            <div class="stat-label">Tỷ lệ hoàn thành</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="content-card">
        <div class="tabs-container">
          <div class="tabs-header">
            <button 
              class="tab-button" 
              [class.active]="activeTab === 'pending'"
              (click)="setActiveTab('pending')">
              Cần xử lý ({{ pendingDocuments.length }})
            </button>
            <button 
              class="tab-button" 
              [class.active]="activeTab === 'in-progress'"
              (click)="setActiveTab('in-progress')">
              Đang xử lý ({{ inProgressDocuments.length }})
            </button>
            <button 
              class="tab-button" 
              [class.active]="activeTab === 'processed'"
              (click)="setActiveTab('processed')">
              Đã xử lý ({{ processedDocuments.length }})
            </button>
            <button 
              class="tab-button" 
              [class.active]="activeTab === 'urgent'"
              (click)="setActiveTab('urgent')">
              Khẩn cấp ({{ urgentDocuments.length }})
            </button>
          </div>

          <div class="tab-content">
            <!-- Tab: Documents cần xử lý -->
            <div class="tab-panel" *ngIf="activeTab === 'pending'">
              <div class="tab-header">
                <h3>Văn bản cần xử lý ({{ pendingDocuments.length }})</h3>
                <div class="tab-actions">
                  <button class="action-button" (click)="refreshPendingDocuments()">
                    <span class="action-icon">🔄</span>
                    Làm mới
                  </button>
                  <button class="action-button debug" (click)="debugCurrentClassification()">
                    <span class="action-icon">🐛</span>
                    Debug
                  </button>
                </div>
              </div>

              <div class="documents-grid" *ngIf="pendingDocuments.length > 0; else noPendingDocuments">
                <div class="document-card" 
                     *ngFor="let doc of pendingDocuments" 
                     [class.urgent]="doc.priority === 'URGENT'"
                     [class.high]="doc.priority === 'HIGH'">
                  <div class="document-header">
                    <div class="document-title">{{ doc.documentTitle }}</div>
                    <div class="document-subtitle">
                      {{ doc.documentType }} • {{ doc.documentCategory }}
                    </div>
                    <div class="priority-badge" [class]="'priority-' + doc.priority.toLowerCase()">
                      {{ getPriorityLabel(doc.priority) }}
                    </div>
                  </div>

                  <div class="document-content">
                    <div class="document-info">
                      <div class="info-row">
                        <span class="label">Trạng thái:</span>
                        <span class="value">{{ doc.status }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Bước hiện tại:</span>
                        <span class="value">{{ doc.currentStepName || 'N/A' }}</span>
                      </div>
                      <div class="info-row" *ngIf="doc.createdByName">
                        <span class="label">Người tạo:</span>
                        <span class="value creator-info">
                          <span class="creator-name">{{ doc.createdByName }}</span>
                          <span class="creator-email">({{ doc.createdByEmail }})</span>
                        </span>
                      </div>
                      <div class="info-row">
                        <span class="label">Ngày tạo:</span>
                        <span class="value">{{ doc.createdAt | date:'dd/MM/yyyy' }}</span>
                      </div>
                      <div class="info-row" *ngIf="doc.deadline">
                        <span class="label">Deadline:</span>
                        <span class="value" [class.overdue]="isOverdue(doc.deadline)">
                          {{ doc.deadline | date:'dd/MM/yyyy' }}
                        </span>
                      </div>
                    </div>

                    <div class="available-actions" *ngIf="doc.actionType">
                      <span class="label">Actions có sẵn:</span>
                      <div class="action-buttons">
                        <button class="action-btn primary" 
                                *ngFor="let action of getAvailableActions(doc.actionType)"
                                (click)="processDocument(doc, action)">
                          {{ getActionLabel(action) }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="document-actions">
                    <button class="action-btn secondary" (click)="viewDocumentDetails(doc)">
                      <span class="action-icon">👁️</span>
                      Xem chi tiết
                    </button>
                    <button class="action-btn success" (click)="processDocument(doc, 'APPROVE')">
                      <span class="action-icon">✅</span>
                      Phê duyệt
                    </button>
                    <button class="action-btn danger" (click)="processDocument(doc, 'REJECT')">
                      <span class="action-icon">❌</span>
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>

              <ng-template #noPendingDocuments>
                <div class="empty-state">
                  <div class="empty-icon">📋</div>
                  <h3>Không có văn bản nào cần xử lý</h3>
                  <p>Tất cả văn bản đã được xử lý hoặc chưa được phân công.</p>
                </div>
              </ng-template>
            </div>

            <!-- Tab: Documents đang xử lý -->
            <div class="tab-panel" *ngIf="activeTab === 'in-progress'">
              <div class="tab-header">
                <h3>Văn bản đang xử lý ({{ inProgressDocuments.length }})</h3>
                <div class="tab-actions">
                  <button class="action-button" (click)="refreshInProgressDocuments()">
                    <span class="action-icon">🔄</span>
                    Làm mới
                  </button>
                </div>
              </div>

              <div class="documents-grid" *ngIf="inProgressDocuments.length > 0; else noInProgressDocuments">
                <div class="document-card in-progress" 
                     *ngFor="let doc of inProgressDocuments" 
                     [class.urgent]="doc.priority === 'URGENT'"
                     [class.high]="doc.priority === 'HIGH'">
                  <div class="document-header">
                    <div class="document-title">{{ doc.documentTitle }}</div>
                    <div class="document-subtitle">
                      {{ doc.documentType }} • {{ doc.documentCategory }}
                    </div>
                    <div class="priority-badge" [class]="'priority-' + doc.priority.toLowerCase()">
                      {{ getPriorityLabel(doc.priority) }}
                    </div>
                  </div>

                  <div class="document-content">
                    <div class="document-info">
                      <div class="info-row">
                        <span class="label">Trạng thái:</span>
                        <span class="value in-progress-status">{{ doc.status }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Bước hiện tại:</span>
                        <span class="value">{{ doc.currentStepName || 'N/A' }}</span>
                      </div>
                      <div class="info-row" *ngIf="doc.currentAssigneeName">
                        <span class="label">Đang xử lý bởi:</span>
                        <span class="value assignee-info">
                          <span class="assignee-name">{{ doc.currentAssigneeName }}</span>
                          <span class="assignee-email">({{ doc.currentAssigneeEmail }})</span>
                        </span>
                      </div>
                      <div class="info-row">
                        <span class="label">Ngày tạo:</span>
                        <span class="value">{{ doc.createdAt | date:'dd/MM/yyyy' }}</span>
                      </div>
                      <div class="info-row" *ngIf="doc.deadline">
                        <span class="label">Deadline:</span>
                        <span class="value" [class.overdue]="isOverdue(doc.deadline)">
                          {{ doc.deadline | date:'dd/MM/yyyy' }}
                        </span>
                      </div>
                    </div>

                    <div class="available-actions" *ngIf="doc.actionType">
                      <span class="label">Actions có sẵn:</span>
                      <div class="action-buttons">
                        <button class="action-btn primary" 
                                *ngFor="let action of getAvailableActions(doc.actionType)"
                                (click)="processDocument(doc, action)">
                          {{ getActionLabel(action) }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="document-actions">
                    <button class="action-btn secondary" (click)="viewDocumentDetails(doc)">
                      <span class="action-icon">👁️</span>
                      Xem chi tiết
                    </button>
                    <button class="action-btn success" (click)="processDocument(doc, 'APPROVE')">
                      <span class="action-icon">✅</span>
                      Phê duyệt
                    </button>
                    <button class="action-btn danger" (click)="processDocument(doc, 'REJECT')">
                      <span class="action-icon">❌</span>
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>

              <ng-template #noInProgressDocuments>
                <div class="empty-state">
                  <div class="empty-icon">🔄</div>
                  <h3>Không có văn bản nào đang xử lý</h3>
                  <p>Tất cả văn bản đã hoàn thành hoặc chưa được bắt đầu xử lý.</p>
                </div>
              </ng-template>
            </div>

            <!-- Tab: Documents đã xử lý -->
            <div class="tab-panel" *ngIf="activeTab === 'processed'">
              <div class="tab-header">
                <h3>Văn bản đã xử lý ({{ processedDocuments.length }})</h3>
                <div class="tab-actions">
                  <button class="action-button" (click)="refreshProcessedDocuments()">
                    <span class="action-icon">🔄</span>
                    Làm mới
                  </button>
                </div>
              </div>

              <div class="documents-grid" *ngIf="processedDocuments.length > 0; else noProcessedDocuments">
                <div class="document-card processed" *ngFor="let doc of processedDocuments">
                  <div class="document-header">
                    <div class="document-title">{{ doc.documentTitle }}</div>
                    <div class="document-subtitle">
                      {{ doc.documentType }} • {{ doc.documentCategory }}
                    </div>
                    <div class="status-badge" [class]="'status-' + (doc.workflowStatus || 'unknown').toLowerCase()">
                      {{ getStatusLabel(doc.workflowStatus) }}
                    </div>
                  </div>

                  <div class="document-content">
                    <div class="document-info">
                      <div class="info-row">
                        <span class="label">Trạng thái:</span>
                        <span class="value">{{ doc.status }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Action cuối:</span>
                        <span class="value">{{ doc.actionType || 'N/A' }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Ngày xử lý:</span>
                        <span class="value">{{ doc.createdAt | date:'dd/MM/yyyy' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="document-actions">
                    <button class="action-btn secondary" (click)="viewDocumentDetails(doc)">
                      <span class="action-icon">👁️</span>
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>

              <ng-template #noProcessedDocuments>
                <div class="empty-state">
                  <div class="empty-icon">📚</div>
                  <h3>Chưa có văn bản nào được xử lý</h3>
                  <p>Bạn chưa xử lý văn bản nào trong hệ thống.</p>
                </div>
              </ng-template>
            </div>

            <!-- Tab: Documents khẩn cấp -->
            <div class="tab-panel" *ngIf="activeTab === 'urgent'">
              <div class="tab-header">
                <h3>Văn bản khẩn cấp ({{ urgentDocuments.length }})</h3>
                <div class="tab-actions">
                  <button class="action-button" (click)="refreshUrgentDocuments()">
                    <span class="action-icon">🔄</span>
                    Làm mới
                  </button>
                </div>
              </div>

              <div class="documents-grid" *ngIf="urgentDocuments.length > 0; else noUrgentDocuments">
                <div class="document-card urgent" *ngFor="let doc of urgentDocuments">
                  <div class="document-header">
                    <div class="document-title">{{ doc.documentTitle }}</div>
                    <div class="document-subtitle">
                      {{ doc.documentType }} • {{ doc.documentCategory }}
                    </div>
                    <div class="urgent-badge">
                      <span class="urgent-icon">🚨</span>
                      KHẨN CẤP
                    </div>
                  </div>

                  <div class="document-content">
                    <div class="document-info">
                      <div class="info-row">
                        <span class="label">Deadline:</span>
                        <span class="value overdue">{{ doc.deadline | date:'dd/MM/yyyy HH:mm' }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Trạng thái:</span>
                        <span class="value">{{ doc.status }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Bước hiện tại:</span>
                        <span class="value">{{ doc.currentStepName || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="document-actions">
                    <button class="action-btn secondary" (click)="viewDocumentDetails(doc)">
                      <span class="action-icon">👁️</span>
                      Xem chi tiết
                    </button>
                    <button class="action-btn success urgent" (click)="processDocument(doc, 'APPROVE')">
                      <span class="action-icon">✅</span>
                      Phê duyệt ngay
                    </button>
                  </div>
                </div>
              </div>

              <ng-template #noUrgentDocuments>
                <div class="empty-state">
                  <div class="empty-icon">✅</div>
                  <h3>Không có văn bản khẩn cấp</h3>
                  <p>Tất cả văn bản đều trong thời hạn xử lý.</p>
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Action Dialog -->
    <app-document-action-dialog
      *ngIf="showActionDialog && selectedDocument"
      [document]="selectedDocument"
      [actionType]="selectedAction"
      (actionConfirmed)="onActionConfirmed($event)"
      (dialogClosed)="closeActionDialog()">
    </app-document-action-dialog>

    <!-- Document Details Dialog -->
    <app-document-details
      *ngIf="showDetailsDialog && selectedDocument"
      [document]="selectedDocument"
      (actionRequested)="onDetailsActionRequested($event)"
      (dialogClosed)="closeDetailsDialog()">
    </app-document-details>
  `,
  styles: [`
    .document-processing-container {
      padding: 20px;
      /* max-width: 1200px; */
      margin: 0 auto;
      background-color: var(--color-background-layout);
      min-height: 100vh;
    }

    /* Header Card */
    .header-card {
      background-color: var(--color-background-primary);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      font-size: 2.5rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      border-radius: 12px;
      color: white;
    }

    .header-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 4px 0;
    }

    .header-subtitle {
      font-size: 1rem;
      color: var(--color-text-secondary);
      margin: 0;
    }

    /* Statistics Grid */
    .statistics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: var(--color-background-primary);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .stat-card.pending {
      border-left: 4px solid #f59e0b;
    }

    .stat-card.in-progress {
      border-left: 4px solid #3b82f6;
    }

    .stat-card.completed {
      border-left: 4px solid #10b981;
    }

    .stat-card.rate {
      border-left: 4px solid #8b5cf6;
    }

    .stat-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: var(--color-background-secondary);
    }

    .stat-info {
      flex: 1;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-text-primary);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-top: 4px;
    }

    /* Content Card */
    .content-card {
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }

    /* Tabs */
    .tabs-container {
      width: 100%;
    }

    .tabs-header {
      display: flex;
      background: var(--color-background-secondary);
      border-bottom: 1px solid var(--color-border);
    }

    .tab-button {
      flex: 1;
      padding: 16px 24px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      transition: all 0.2s ease;
      border-bottom: 3px solid transparent;
    }

    .tab-button:hover {
      background: var(--color-background-primary);
      color: var(--color-primary);
    }

    .tab-button.active {
      background: var(--color-background-primary);
      color: var(--color-primary);
      border-bottom-color: var(--color-primary);
    }

    .tab-content {
      padding: 24px;
    }

    .tab-panel {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Tab Header */
    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .tab-header h3 {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 1.25rem;
      font-weight: 600;
    }

    .tab-actions {
      display: flex;
      gap: 12px;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--color-background-secondary);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      color: var(--color-text-primary);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-button:hover {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .action-button.debug {
      background: #f59e0b;
      color: white;
      border-color: #f59e0b;
    }

    .action-button.debug:hover {
      background: #d97706;
      border-color: #d97706;
    }

    .action-icon {
      font-size: 1rem;
    }

    /* Documents Grid */
    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
    }

    .document-card {
      background: var(--color-background-primary);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .document-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .document-card.urgent {
      border-left: 4px solid #ef4444;
    }

    .document-card.high {
      border-left: 4px solid #f59e0b;
    }

    .document-card.processed {
      border-left: 4px solid #10b981;
    }

    .document-card.in-progress {
      border-left: 4px solid #3b82f6;
    }

    .document-header {
      padding: 20px 20px 0 20px;
      position: relative;
    }

    .document-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 4px;
      line-height: 1.4;
    }

    .document-subtitle {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-bottom: 12px;
    }

    .priority-badge, .status-badge, .urgent-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
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

    .urgent-badge {
      background: #fee2e2;
      color: #dc2626;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .urgent-icon {
      font-size: 0.875rem;
    }

    .document-content {
      padding: 0 20px 20px 20px;
    }

    .document-info {
      margin-bottom: 16px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.875rem;
    }

    .label {
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .value {
      color: var(--color-text-primary);
      font-weight: 500;
    }

    .value.overdue {
      color: #ef4444;
      font-weight: 600;
    }

    .value.in-progress-status {
      color: #3b82f6;
      font-weight: 600;
    }

    .assignee-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .assignee-name {
      font-weight: 600;
      color: var(--color-primary);
    }

    .assignee-email {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      font-weight: 400;
    }

    .creator-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .creator-name {
      font-weight: 600;
      color: var(--color-accent);
    }

    .creator-email {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      font-weight: 400;
    }

    .available-actions {
      margin: 16px 0;
      padding: 12px;
      background: var(--color-background-secondary);
      border-radius: 8px;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .document-actions {
      display: flex;
      gap: 8px;
      padding: 16px 20px;
      background: var(--color-background-secondary);
      border-top: 1px solid var(--color-border);
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
      text-decoration: none;
    }

    .action-btn.primary {
      background: var(--color-primary);
      color: white;
    }

    .action-btn.primary:hover {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
    }

    .action-btn.secondary {
      background: var(--color-background-primary);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .action-btn.secondary:hover {
      background: var(--color-background-secondary);
    }

    .action-btn.success {
      background: #10b981;
      color: white;
    }

    .action-btn.success:hover {
      background: #059669;
    }

    .action-btn.success.urgent {
      background: #ef4444;
      color: white;
    }

    .action-btn.success.urgent:hover {
      background: #dc2626;
    }

    .action-btn.danger {
      background: #ef4444;
      color: white;
    }

    .action-btn.danger:hover {
      background: #dc2626;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--color-text-secondary);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 12px 0;
      color: var(--color-text-primary);
      font-size: 1.25rem;
      font-weight: 600;
    }

    .empty-state p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 1rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .document-processing-container {
        padding: 16px;
      }

      .statistics-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .documents-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .tabs-header {
        flex-direction: column;
      }

      .tab-button {
        border-bottom: none;
        border-right: 3px solid transparent;
      }

      .tab-button.active {
        border-bottom: none;
        border-right-color: var(--color-primary);
      }

      .document-actions {
        flex-direction: column;
      }

      .action-btn {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .header-icon {
        width: 50px;
        height: 50px;
        font-size: 2rem;
      }

      .header-title {
        font-size: 1.5rem;
      }

      .stat-card {
        padding: 16px;
      }

      .stat-icon {
        width: 50px;
        height: 50px;
        font-size: 1.5rem;
      }

      .stat-number {
        font-size: 1.5rem;
      }
    }
  `]
})
export class DocumentProcessingComponent implements OnInit {
  pendingDocuments: DocumentProcessingInfo[] = [];
  inProgressDocuments: DocumentProcessingInfo[] = [];
  processedDocuments: DocumentProcessingInfo[] = [];
  urgentDocuments: DocumentProcessingInfo[] = [];
  statistics: ProcessingStatistics | null = null;
  loading = false;
  activeTab = 'pending';
  
  // Dialog states
  showActionDialog = false;
  showDetailsDialog = false;
  selectedDocument: DocumentProcessingInfo | null = null;
  selectedAction = '';

  constructor(
    private documentProcessingService: DocumentProcessingApolloService,
    private toastService: ToastNotificationService,
    private usersService: UsersService,
    private userState: UserState
  ) {}

  ngOnInit(): void {
    // Đảm bảo current user được load
    this.loadCurrentUser();
  }

  async loadCurrentUser(): Promise<void> {
    try {
      await this.usersService.getCurrentUserData().toPromise();
      // Sau khi load user, load data
      this.loadData();
    } catch (error) {
      console.error('Error loading current user:', error);
      this.showError('Lỗi khi tải thông tin người dùng');
    }
  }

  async loadData(): Promise<void> {
    this.loading = true;
    try {
      // Load statistics
      await this.loadStatistics();
      
      // Load documents
      await this.loadPendingDocuments();
      await this.loadInProgressDocuments();
      await this.loadProcessedDocuments();
      await this.loadUrgentDocuments();
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Lỗi khi tải dữ liệu');
    } finally {
      this.loading = false;
    }
  }

  async loadStatistics(): Promise<void> {
    this.documentProcessingService.getProcessingStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.showError('Lỗi khi tải thống kê');
      }
    });
  }

  async loadPendingDocuments(): Promise<void> {
    this.documentProcessingService.getDocumentsForProcessingByAssignee().subscribe({
      next: (documents) => {
        // Lấy current user
        const currentUser = this.userState.getUser();
        if (!currentUser) {
          console.error('Current user not found');
          return;
        }

        console.log('Current user ID:', currentUser.id);
        console.log('Total documents received:', documents.length);

        // Debug document classification
        this.debugDocumentClassification(documents);

        // Phân loại documents theo logic:
        // - Tab "Cần xử lý": Documents mà người dùng hiện tại được phân công xử lý
        //   (currentAssigneeUserId === currentUser.id) và cần action
        this.pendingDocuments = documents.filter(doc => {
          const isAssignedToCurrentUser = this.isAssignedToCurrentUser(doc);
          const requiresAction = doc.requiresAction;
          
          console.log(`Document ${doc.documentTitle}:`, {
            currentAssigneeUserId: doc.currentAssigneeUserId,
            currentUserID: currentUser.id,
            isAssignedToCurrentUser,
            requiresAction,
            shouldShowInPending: isAssignedToCurrentUser && requiresAction
          });
          
          return isAssignedToCurrentUser && requiresAction;
        });
        
        // Tab "Đang xử lý": Documents mà người dùng hiện tại đã tạo
        // (createdByUserId === currentUser.id) và đang trong quá trình xử lý
        this.inProgressDocuments = documents.filter(doc => {
          const isCreatedByCurrentUser = this.isCreatedByCurrentUser(doc);
          const isInProgress = doc.workflowStatus === 'IN_PROGRESS';
          
          return isCreatedByCurrentUser && isInProgress;
        });

        console.log('Pending documents count:', this.pendingDocuments.length);
        console.log('In-progress documents count:', this.inProgressDocuments.length);
      },
      error: (error) => {
        console.error('Error loading pending documents:', error);
        this.showError('Lỗi khi tải văn bản cần xử lý');
      }
    });
  }

  async loadInProgressDocuments(): Promise<void> {
    // Documents đang xử lý đã được load trong loadPendingDocuments
    // Method này chỉ để refresh
  }

  async loadProcessedDocuments(): Promise<void> {
    this.documentProcessingService.getProcessedDocuments().subscribe({
      next: (documents) => {
        this.processedDocuments = documents;
      },
      error: (error) => {
        console.error('Error loading processed documents:', error);
        this.showError('Lỗi khi tải văn bản đã xử lý');
      }
    });
  }

  async loadUrgentDocuments(): Promise<void> {
    this.documentProcessingService.getUrgentDocuments().subscribe({
      next: (documents) => {
        this.urgentDocuments = documents;
      },
      error: (error) => {
        console.error('Error loading urgent documents:', error);
        this.showError('Lỗi khi tải văn bản khẩn cấp');
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  refreshPendingDocuments(): void {
    this.loadPendingDocuments();
  }

  debugCurrentClassification(): void {
    const currentUser = this.userState.getUser();
    if (!currentUser) {
      this.showError('Không tìm thấy thông tin người dùng hiện tại');
      return;
    }

    console.log('=== Current Classification Debug ===');
    console.log('Current User:', currentUser);
    console.log('Pending Documents:', this.pendingDocuments);
    console.log('In-Progress Documents:', this.inProgressDocuments);
    
    this.showInfo(`Debug: ${this.pendingDocuments.length} pending, ${this.inProgressDocuments.length} in-progress documents`);
  }

  refreshProcessedDocuments(): void {
    this.loadProcessedDocuments();
  }

  refreshInProgressDocuments(): void {
    this.loadInProgressDocuments();
  }

  refreshUrgentDocuments(): void {
    this.loadUrgentDocuments();
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT': return 'warn';
      case 'HIGH': return 'accent';
      case 'MEDIUM': return 'primary';
      case 'LOW': return '';
      default: return '';
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

  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'COMPLETED': return 'primary';
      case 'IN_PROGRESS': return 'accent';
      case 'CANCELLED': return 'warn';
      default: return '';
    }
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'COMPLETED': return 'HOÀN THÀNH';
      case 'IN_PROGRESS': return 'ĐANG XỬ LÝ';
      case 'CANCELLED': return 'ĐÃ HỦY';
      default: return status || 'N/A';
    }
  }

  getAvailableActions(actionType: string | undefined): string[] {
    if (!actionType) return [];
    return actionType.split(',');
  }

  getActionLabel(action: string): string {
    switch (action) {
      case 'APPROVE': return 'Phê duyệt';
      case 'REJECT': return 'Từ chối';
      case 'TRANSFER': return 'Chuyển tiếp';
      case 'COMPLETE': return 'Hoàn thành';
      default: return action;
    }
  }

  isOverdue(deadline: Date | undefined): boolean {
    if (!deadline) return false;
    return new Date() > deadline;
  }

  /**
   * Kiểm tra xem document có được phân công cho người dùng hiện tại hay không
   */
  isAssignedToCurrentUser(document: DocumentProcessingInfo): boolean {
    const currentUser = this.userState.getUser();
    if (!currentUser || !document.currentAssigneeUserId) {
      return false;
    }
    return document.currentAssigneeUserId === currentUser.id;
  }

  /**
   * Kiểm tra xem document có được tạo bởi người dùng hiện tại hay không
   */
  isCreatedByCurrentUser(document: DocumentProcessingInfo): boolean {
    const currentUser = this.userState.getUser();
    if (!currentUser || !document.createdByUserId) {
      return false;
    }
    return document.createdByUserId === currentUser.id;
  }

  /**
   * Debug method để hiển thị thông tin phân loại documents
   */
  debugDocumentClassification(documents: DocumentProcessingInfo[]): void {
    const currentUser = this.userState.getUser();
    if (!currentUser) {
      console.log('No current user found for debugging');
      return;
    }

    console.log('=== Document Classification Debug ===');
    console.log('Current User ID:', currentUser.id);
    console.log('Total Documents:', documents.length);

    documents.forEach((doc, index) => {
      const isAssigned = this.isAssignedToCurrentUser(doc);
      const isCreated = this.isCreatedByCurrentUser(doc);
      
      console.log(`Document ${index + 1}: ${doc.documentTitle}`, {
        documentId: doc.documentId,
        currentAssigneeUserId: doc.currentAssigneeUserId,
        createdByUserId: doc.createdByUserId,
        workflowStatus: doc.workflowStatus,
        requiresAction: doc.requiresAction,
        isAssignedToCurrentUser: isAssigned,
        isCreatedByCurrentUser: isCreated,
        shouldBeInPending: isAssigned && doc.requiresAction,
        shouldBeInInProgress: isCreated && doc.workflowStatus === 'IN_PROGRESS'
      });
    });
  }

  async processDocument(document: DocumentProcessingInfo, action: string): Promise<void> {
    try {
      this.selectedDocument = document;
      this.selectedAction = action;
      this.showActionDialog = true;
    } catch (error) {
      console.error('Error opening action dialog:', error);
      this.showError('Lỗi khi mở dialog xử lý văn bản');
    }
  }

  viewDocumentDetails(document: DocumentProcessingInfo): void {
    this.selectedDocument = document;
    this.showDetailsDialog = true;
  }

  onActionConfirmed(actionData: DocumentActionData): void {
    console.log('Action confirmed:', actionData);
    
    // Call the actual API
    const input: DocumentActionInput = {
      documentId: actionData.documentId,
      actionType: actionData.actionType as any,
      notes: actionData.notes,
      transferToUserId: actionData.transferToUserId
    };

    this.documentProcessingService.processDocumentAction(input).subscribe({
      next: (response) => {
        this.showSuccess(`Đã ${this.getActionLabel(actionData.actionType).toLowerCase()} văn bản thành công`);
        this.closeActionDialog();
        // Refresh data
        this.loadData();
      },
      error: (error) => {
        console.error('Error processing document action:', error);
        this.showError('Lỗi khi xử lý văn bản');
      }
    });
  }

  onDetailsActionRequested(event: {document: DocumentProcessingInfo, action: string}): void {
    this.closeDetailsDialog();
    this.processDocument(event.document, event.action);
  }

  closeActionDialog(): void {
    this.showActionDialog = false;
    this.selectedDocument = null;
    this.selectedAction = '';
  }

  closeDetailsDialog(): void {
    this.showDetailsDialog = false;
    this.selectedDocument = null;
  }

  showSuccess(message: string): void {
    this.toastService.success(message);
  }

  showError(message: string): void {
    this.toastService.error(message);
  }

  showInfo(message: string): void {
    this.toastService.info(message);
  }
}
