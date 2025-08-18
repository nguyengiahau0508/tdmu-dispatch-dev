import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WorkflowDetailService, IDocumentWorkflowInfo, IWorkflowStepInfo } from '../../../../core/services/workflow-detail.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-workflow-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="workflow-detail-container">
      <!-- Header -->
      <div class="workflow-header">
        <div class="header-content">
          <h1>Chi tiết quy trình xử lý</h1>
          <p>Xem thông tin chi tiết quy trình đang áp dụng cho tài liệu</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="goBack()">
            <img src="/icons/arrow_back.svg" alt="Back">
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Đang tải thông tin quy trình...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <img src="/icons/error.svg" alt="Error">
        <h3>Có lỗi xảy ra</h3>
        <p>{{ error }}</p>
        <button class="btn btn-primary" (click)="loadWorkflowDetail()">
          <img src="/icons/refresh.svg" alt="Retry">
          <span>Thử lại</span>
        </button>
      </div>

      <!-- Content -->
      <div class="workflow-content" *ngIf="workflowInfo && !isLoading">
        <!-- Document Info Card -->
        <div class="info-card document-info">
          <div class="card-header">
            <h3>
              <img src="/icons/description.svg" alt="Document">
              <span>Thông tin tài liệu</span>
            </h3>
          </div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-item">
                <label>Tiêu đề:</label>
                <span>{{ workflowInfo.documentTitle }}</span>
              </div>
              <div class="info-item">
                <label>Loại tài liệu:</label>
                <span>{{ workflowInfo.documentType }}</span>
              </div>
              <div class="info-item">
                <label>Trạng thái hiện tại:</label>
                <span class="status-badge" [style.background-color]="getStatusColor(workflowInfo.currentStatus)">
                  {{ workflowInfo.currentStatus }}
                </span>
              </div>
              <div class="info-item">
                <label>Ngày tạo:</label>
                <span>{{ formatDate(workflowInfo.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Workflow Template Info -->
        <div class="info-card workflow-template-info">
          <div class="card-header">
            <h3>
              <img src="/icons/conversion_path.svg" alt="Workflow">
              <span>Quy trình áp dụng</span>
            </h3>
          </div>
          <div class="card-content">
            <h4>{{ workflowInfo.workflowTemplateName }}</h4>
            <p>{{ workflowInfo.workflowTemplateDescription }}</p>
            
            <!-- Progress Bar -->
            <div class="progress-section">
              <div class="progress-info">
                <span>Tiến độ: {{ workflowInfo.completedSteps }}/{{ workflowInfo.totalSteps }} bước</span>
                <span>{{ calculateProgress() }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="calculateProgress()"></div>
              </div>
            </div>

            <!-- Estimated Completion -->
            <div class="estimated-completion" *ngIf="workflowInfo.estimatedCompletion">
              <img src="/icons/schedule.svg" alt="Schedule">
              <span>Dự kiến hoàn thành: {{ formatDate(workflowInfo.estimatedCompletion) }}</span>
            </div>
          </div>
        </div>

        <!-- Current Step Guide -->
        <div class="info-card current-step-guide" *ngIf="getCurrentStep()">
          <div class="card-header">
            <h3>
              <img src="/icons/play_circle.svg" alt="Current">
              <span>Bước hiện tại</span>
            </h3>
          </div>
          <div class="card-content">
            <div class="current-step-info">
              <h4>Bước {{ getCurrentStep()?.order }}: {{ getCurrentStep()?.name }}</h4>
              <p>{{ getCurrentStep()?.description }}</p>
              
              <!-- Required Actions -->
              <div class="required-actions" *ngIf="getCurrentStep()?.requiredActions?.length">
                <h5>Các hành động cần thực hiện:</h5>
                <ul>
                  <li *ngFor="let action of getCurrentStep()?.requiredActions">
                    {{ action }}
                  </li>
                </ul>
              </div>

              <!-- Step Details -->
              <div class="step-details">
                <div class="detail-item" *ngIf="getCurrentStep()?.assignedTo">
                  <label>Người phụ trách:</label>
                  <span>{{ getCurrentStep()?.assignedTo }}</span>
                </div>
                <div class="detail-item" *ngIf="getCurrentStep()?.startedAt">
                  <label>Bắt đầu:</label>
                  <span>{{ formatDate(getCurrentStep()?.startedAt) }}</span>
                </div>
                <div class="detail-item" *ngIf="getCurrentStep()?.notes">
                  <label>Ghi chú:</label>
                  <span>{{ getCurrentStep()?.notes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Workflow Steps Timeline -->
        <div class="info-card workflow-timeline">
          <div class="card-header">
            <h3>
              <img src="/icons/timeline.svg" alt="Timeline">
              <span>Timeline quy trình</span>
            </h3>
          </div>
          <div class="card-content">
            <div class="timeline">
              <div 
                class="timeline-item" 
                *ngFor="let step of workflowInfo.steps; let i = index"
                [class.active]="i === workflowInfo.currentStepIndex"
                [class.completed]="step.status === 'completed'"
                [class.skipped]="step.status === 'skipped'"
              >
                <div class="timeline-marker">
                  <img [src]="getStepStatusIcon(step.status)" [alt]="step.status">
                </div>
                <div class="timeline-content">
                  <div class="step-header">
                    <h4>Bước {{ step.order }}: {{ step.name }}</h4>
                    <span class="status-badge" [style.background-color]="getStepStatusColor(step.status)">
                      {{ getStepStatusText(step.status) }}
                    </span>
                  </div>
                  <p>{{ step.description }}</p>
                  
                  <!-- Step Details -->
                  <div class="step-details" *ngIf="step.assignedTo || step.startedAt || step.completedAt">
                    <div class="detail-item" *ngIf="step.assignedTo">
                      <small>Người phụ trách: {{ step.assignedTo }}</small>
                    </div>
                    <div class="detail-item" *ngIf="step.startedAt">
                      <small>Bắt đầu: {{ formatDate(step.startedAt) }}</small>
                    </div>
                    <div class="detail-item" *ngIf="step.completedAt">
                      <small>Hoàn thành: {{ formatDate(step.completedAt) }}</small>
                    </div>
                    <div class="detail-item" *ngIf="step.notes">
                      <small>Ghi chú: {{ step.notes }}</small>
                    </div>
                  </div>

                  <!-- Required Actions -->
                  <div class="required-actions" *ngIf="step.requiredActions?.length">
                    <small>Các hành động:</small>
                    <ul>
                      <li *ngFor="let action of step.requiredActions">
                        <small>{{ action }}</small>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Processing Guide -->
        <div class="info-card processing-guide" *ngIf="workflowInfo.processingGuide">
          <div class="card-header">
            <h3>
              <img src="/icons/help.svg" alt="Guide">
              <span>Hướng dẫn xử lý</span>
            </h3>
          </div>
          <div class="card-content">
            <div class="guide-content" [innerHTML]="formatProcessingGuide(workflowInfo.processingGuide)"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .workflow-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .workflow-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--color-border);
    }

    .header-content h1 {
      color: var(--color-text-primary);
      margin: 0 0 8px 0;
      font-size: 1.75rem;
      font-weight: 600;
    }

    .header-content p {
      color: var(--color-text-secondary);
      margin: 0;
      font-size: 1rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .info-card {
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
      margin-bottom: 24px;
      overflow: hidden;
    }

    .card-header {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
      padding: 20px 24px;
    }

    .card-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-header img {
      width: 20px;
      height: 20px;
      object-fit: contain;
      filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
    }

    .card-content {
      padding: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-weight: 500;
      color: var(--color-text-secondary);
      font-size: 14px;
    }

    .info-item span {
      color: var(--color-text-primary);
      font-size: 16px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      color: white;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .progress-section {
      margin: 20px 0;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--color-background-secondary);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--color-primary);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .estimated-completion {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-text-secondary);
      font-size: 14px;
    }

    .estimated-completion img {
      width: 16px;
      height: 16px;
      opacity: 0.6;
    }

    .current-step-info h4 {
      color: var(--color-text-primary);
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 600;
    }

    .current-step-info p {
      color: var(--color-text-secondary);
      margin: 0 0 20px 0;
      line-height: 1.6;
    }

    .required-actions {
      margin: 20px 0;
    }

    .required-actions h5 {
      color: var(--color-text-primary);
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .required-actions ul {
      margin: 0;
      padding-left: 20px;
    }

    .required-actions li {
      color: var(--color-text-secondary);
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .step-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--color-border);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-item label {
      font-weight: 500;
      color: var(--color-text-secondary);
      font-size: 12px;
      text-transform: uppercase;
    }

    .detail-item span {
      color: var(--color-text-primary);
      font-size: 14px;
    }

    .timeline {
      position: relative;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 20px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--color-border);
    }

    .timeline-item {
      position: relative;
      display: flex;
      gap: 20px;
      margin-bottom: 32px;
    }

    .timeline-item:last-child {
      margin-bottom: 0;
    }

    .timeline-marker {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-background-secondary);
      border: 2px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 1;
    }

    .timeline-marker img {
      width: 20px;
      height: 20px;
      object-fit: contain;
    }

    .timeline-item.completed .timeline-marker {
      background: #10b981;
      border-color: #10b981;
    }

    .timeline-item.active .timeline-marker {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    .timeline-item.skipped .timeline-marker {
      background: #6b7280;
      border-color: #6b7280;
    }

    .timeline-content {
      flex: 1;
      background: var(--color-background-secondary);
      border-radius: 8px;
      padding: 16px;
      border: 1px solid var(--color-border);
    }

    .timeline-item.active .timeline-content {
      border-color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 5%, var(--color-background-secondary));
    }

    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .step-header h4 {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 16px;
      font-weight: 600;
    }

    .guide-content {
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    .guide-content h2 {
      color: var(--color-text-primary);
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .guide-content h3 {
      color: var(--color-text-primary);
      margin: 20px 0 12px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .guide-content ul {
      margin: 12px 0;
      padding-left: 20px;
    }

    .guide-content li {
      margin-bottom: 8px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
    }

    .btn-primary:hover {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
      transform: translateY(-1px);
      box-shadow: var(--shadow-default);
    }

    .btn-secondary {
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      background: var(--color-background-primary);
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    .btn img {
      width: 16px;
      height: 16px;
      object-fit: contain;
      filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
    }

    .btn-secondary img {
      filter: brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
    }

    .btn-secondary:hover img {
      filter: brightness(0) saturate(100%) invert(27%) sepia(87%) saturate(5091%) hue-rotate(202deg) brightness(94%) contrast(101%);
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 48px 24px;
      background: var(--color-background-primary);
      border-radius: 12px;
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-default);
    }

    .spinner {
      border: 4px solid var(--color-background-secondary);
      border-top: 4px solid var(--color-primary);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    .error-state img {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      opacity: 0.6;
    }

    .error-state h3 {
      color: var(--color-text-primary);
      margin: 0 0 8px 0;
    }

    .error-state p {
      color: var(--color-text-secondary);
      margin: 0 0 16px 0;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .workflow-detail-container {
        padding: 16px;
      }

      .workflow-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .step-details {
        grid-template-columns: 1fr;
      }

      .timeline-item {
        flex-direction: column;
        gap: 12px;
      }

      .timeline::before {
        left: 20px;
      }

      .timeline-marker {
        align-self: flex-start;
      }
    }
  `]
})
export class WorkflowDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private workflowDetailService = inject(WorkflowDetailService);
  private notificationService = inject(NotificationService);

  workflowInfo: IDocumentWorkflowInfo | null = null;
  isLoading = false;
  error: string | null = null;

  ngOnInit() {
    this.loadWorkflowDetail();
  }

  loadWorkflowDetail() {
    const documentId = this.route.snapshot.params['documentId'];
    if (!documentId) {
      this.error = 'Không tìm thấy ID tài liệu';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.workflowDetailService.getDocumentWorkflow({ documentId: +documentId }).subscribe({
      next: (response: any) => {
        if (response.metadata.statusCode === 200) {
          this.workflowInfo = response.data || null;
        } else {
          this.error = response.metadata.message || 'Có lỗi xảy ra';
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'Không thể tải thông tin quy trình';
        this.isLoading = false;
        console.error('Error loading workflow detail:', error);
      }
    });
  }

  calculateProgress(): number {
    if (!this.workflowInfo) return 0;
    return Math.round((this.workflowInfo.completedSteps / this.workflowInfo.totalSteps) * 100);
  }

  getCurrentStep(): IWorkflowStepInfo | null {
    if (!this.workflowInfo) return null;
    return this.workflowInfo.steps[this.workflowInfo.currentStepIndex] || null;
  }

  getStepStatusDisplay(status: string) {
    switch (status.toLowerCase()) {
      case 'completed':
        return { text: 'Hoàn thành', color: '#10b981', icon: 'check_circle' };
      case 'in_progress':
        return { text: 'Đang xử lý', color: '#3b82f6', icon: 'pending' };
      case 'pending':
        return { text: 'Chờ xử lý', color: '#f59e0b', icon: 'schedule' };
      case 'skipped':
        return { text: 'Bỏ qua', color: '#6b7280', icon: 'skip_next' };
      default:
        return { text: 'Không xác định', color: '#6b7280', icon: 'help' };
    }
  }

  getStepStatusText(status: string): string {
    return this.getStepStatusDisplay(status).text;
  }

  getStepStatusColor(status: string): string {
    return this.getStepStatusDisplay(status).color;
  }

  getStepStatusIcon(status: string): string {
    return this.getStepStatusDisplay(status).icon;
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#10b981';
      case 'in_progress':
        return '#3b82f6';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatProcessingGuide(guide: string): string {
    // Convert markdown-like formatting to HTML
    return guide
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  goBack() {
    window.history.back();
  }
}
