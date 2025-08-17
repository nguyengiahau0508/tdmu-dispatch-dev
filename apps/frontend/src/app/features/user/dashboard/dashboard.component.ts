import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskRequestService } from '../../../core/services/dispatch/task-request.service';
import { WorkflowApolloService } from '../workflow/services/workflow-apollo.service';
import { DocumentProcessingApolloService } from '../document-processing/services/document-processing-apollo.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- <div class="dashboard-header">
        <h1>Bảng điều khiển</h1>
        <p class="dashboard-subtitle">Quản lý công văn và quy trình xử lý</p>
      </div> -->

      <div class="quick-actions">
        <!-- <h2>Thao tác nhanh</h2> -->
        <div class="action-grid">
          <div class="action-card primary" (click)="navigateToTaskManagement()">
            <div class="action-icon">
              <img src="/icons/assignment.svg" alt="Giao việc">
            </div>
            <div class="action-content">
              <h3>Giao việc</h3>
              <p>Tạo yêu cầu giao việc mới</p>
              @if (pendingTaskCount > 0) {
                <div class="badge">{{ pendingTaskCount }} chờ xử lý</div>
              }
            </div>
          </div>

          <div class="action-card success" (click)="navigateToWorkflow()">
            <div class="action-icon">
              <img src="/icons/conversion_path.svg" alt="Quy trình">
            </div>
            <div class="action-content">
              <h3>Quy trình xử lý</h3>
              <p>Xem và xử lý quy trình</p>
              @if (pendingWorkflowCount > 0) {
                <div class="badge">{{ pendingWorkflowCount }} chờ xử lý</div>
              }
            </div>
          </div>

          <div class="action-card info" (click)="navigateToDocumentProcessing()">
            <div class="action-icon">
              <img src="/icons/grading.svg" alt="Văn bản">
            </div>
            <div class="action-content">
              <h3>Xử lý văn bản</h3>
              <p>Xử lý văn bản chờ duyệt</p>
              @if (pendingDocumentCount > 0) {
                <div class="badge">{{ pendingDocumentCount }} chờ xử lý</div>
              }
            </div>
          </div>

          <div class="action-card warning" (click)="navigateToAllDocuments()">
            <div class="action-icon">
              <img src="/icons/attach_email.svg" alt="Tất cả văn bản">
            </div>
            <div class="action-content">
              <h3>Tất cả công văn</h3>
              <p>Xem danh sách tất cả văn bản</p>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-overview">
        <h2>Tổng quan</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon pending">
              <img src="/icons/assignment.svg" alt="Task">
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ pendingTaskCount }}</div>
              <div class="stat-label">Việc chờ xử lý</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon workflow">
              <img src="/icons/conversion_path.svg" alt="Workflow">
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ pendingWorkflowCount }}</div>
              <div class="stat-label">Quy trình chờ xử lý</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon document">
              <img src="/icons/grading.svg" alt="Document">
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ pendingDocumentCount }}</div>
              <div class="stat-label">Văn bản chờ duyệt</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon approved">
              <img src="/icons/check_circle.svg" alt="Approved">
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ approvedTaskCount }}</div>
              <div class="stat-label">Việc đã phê duyệt</div>
            </div>
          </div>
        </div>
      </div>

      @if (hasApprovedTasks) {
        <div class="quick-create-section">
          <div class="section-header">
            <h2>🚀 Tạo văn bản nhanh</h2>
            <p>Bạn có <strong>{{ approvedTaskCount }} công việc</strong> đã được phê duyệt và sẵn sàng tạo văn bản</p>
          </div>
          <div class="quick-create-actions">
            <button class="btn btn-success btn-large" (click)="navigateToTaskManagement()">
              <img src="/icons/document.svg" alt="Tạo văn bản" style="width: 20px; height: 20px; margin-right: 12px;">
              Tạo văn bản từ công việc đã phê duyệt
            </button>
            <button class="btn btn-outline" (click)="navigateToTaskManagement()">
              <img src="/icons/assignment.svg" alt="Xem chi tiết" style="width: 16px; height: 16px; margin-right: 8px;">
              Xem chi tiết công việc
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;

      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .dashboard-header h1 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .dashboard-subtitle {
      margin: 0;
      font-size: 1.125rem;
      color: var(--color-text-secondary);
    }

    .quick-actions {
      margin-bottom: 40px;
    }

    .quick-actions h2 {
      margin: 0 0 24px 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .action-card {
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-default);
    }

    .action-card.primary {
      border-left: 4px solid var(--color-primary);
    }

    .action-card.success {
      border-left: 4px solid #10b981;
    }

    .action-card.info {
      border-left: 4px solid #3b82f6;
    }

    .action-card.warning {
      border-left: 4px solid #f59e0b;
    }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .action-card.primary .action-icon {
      background: color-mix(in srgb, var(--color-primary) 15%, transparent);
    }

    .action-card.success .action-icon {
      background: color-mix(in srgb, #10b981 15%, transparent);
    }

    .action-card.info .action-icon {
      background: color-mix(in srgb, #3b82f6 15%, transparent);
    }

    .action-card.warning .action-icon {
      background: color-mix(in srgb, #f59e0b 15%, transparent);
    }

    .action-icon img {
      width: 24px;
      height: 24px;
      filter: brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
    }

    .action-content h3 {
      margin: 0 0 4px 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .action-content p {
      margin: 0 0 8px 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .badge {
      display: inline-block;
      background: #ef4444;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .stats-overview {
      margin-bottom: 40px;
    }

    .stats-overview h2 {
      margin: 0 0 24px 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon.pending {
      background: color-mix(in srgb, #f59e0b 15%, transparent);
    }

    .stat-icon.workflow {
      background: color-mix(in srgb, var(--color-primary) 15%, transparent);
    }

    .stat-icon.document {
      background: color-mix(in srgb, #3b82f6 15%, transparent);
    }

    .stat-icon.approved {
      background: color-mix(in srgb, #10b981 15%, transparent);
    }

    .stat-icon img {
      width: 24px;
      height: 24px;
      filter: brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
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

    .quick-create-section {
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }

    .section-header h2 {
      margin: 0 0 8px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .section-header p {
      margin: 0 0 20px 0;
      color: var(--color-text-secondary);
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: all 0.2s ease;
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover {
      background: #059669;
    }

    .btn-large {
      padding: 16px 32px;
      font-size: 16px;
    }

    .quick-create-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-outline {
      background: transparent;
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .btn-outline:hover {
      background: var(--color-background-secondary);
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .action-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .action-card {
        padding: 16px;
      }

      .stat-card {
        padding: 16px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private taskRequestService = inject(TaskRequestService);
  private workflowApolloService = inject(WorkflowApolloService);
  private documentProcessingApolloService = inject(DocumentProcessingApolloService);

  pendingTaskCount = 0;
  pendingWorkflowCount = 0;
  pendingDocumentCount = 0;
  approvedTaskCount = 0;

  get hasApprovedTasks(): boolean {
    return this.approvedTaskCount > 0;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load task request statistics
    this.taskRequestService.getMyTaskRequests().subscribe({
      next: (tasks) => {
        this.pendingTaskCount = tasks.filter(task => task.status === 'PENDING').length;
        this.approvedTaskCount = tasks.filter(task => task.status === 'APPROVED').length;
      },
      error: (error) => {
        console.error('Error loading task requests:', error);
      }
    });

    // Load workflow statistics
    this.workflowApolloService.getMyPendingWorkflows().subscribe({
      next: (workflows) => {
        this.pendingWorkflowCount = workflows.length;
      },
      error: (error) => {
        console.error('Error loading workflows:', error);
      }
    });

    // Load document statistics
    this.documentProcessingApolloService.getPendingDocumentCount().subscribe({
      next: (count) => {
        this.pendingDocumentCount = count;
      },
      error: (error) => {
        console.error('Error loading document count:', error);
      }
    });
  }

  navigateToTaskManagement(): void {
    this.router.navigate(['/task-management']);
  }

  navigateToWorkflow(): void {
    this.router.navigate(['/workflow']);
  }

  navigateToDocumentProcessing(): void {
    this.router.navigate(['/document-processing']);
  }

  navigateToAllDocuments(): void {
    this.router.navigate(['/all-documents']);
  }
}
