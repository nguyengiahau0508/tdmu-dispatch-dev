import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkflowInstancesService } from '../../services/workflow-instances.service';
import { WorkflowNavigationService } from '../../services/workflow-navigation.service';
import { WorkflowInstance } from '../../models/workflow-instance.model';

@Component({
  selector: 'app-workflow-dashboard',
  standalone: true,
  imports: [CommonModule],
  providers: [WorkflowInstancesService],
  template: `
    <div class="workflow-dashboard">
      <div class="dashboard-header">
        <h2>Bảng điều khiển Quy trình</h2>
        <p>Quản lý các quy trình văn bản cần xử lý</p>
      </div>

      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-number">{{ pendingCount }}</div>
          <div class="stat-label">Chờ xử lý</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ myWorkflowsCount }}</div>
          <div class="stat-label">Quy trình của tôi</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ completedCount }}</div>
          <div class="stat-label">Đã hoàn thành</div>
        </div>
      </div>

      <div class="workflow-sections">
        <!-- Workflows cần xử lý -->
        <div class="workflow-section">
          <h3>Quy trình cần xử lý</h3>
          @if (pendingWorkflows.length > 0) {
            <div class="workflow-list">
              @for (workflow of pendingWorkflows; track workflow.id) {
                <div class="workflow-card pending" (click)="viewWorkflow(workflow.id)">
                  <div class="workflow-header">
                    <h4>{{ workflow.template.name }}</h4>
                    <span class="status-badge pending">Chờ xử lý</span>
                  </div>
                  <div class="workflow-info">
                    <p><strong>Bước hiện tại:</strong> {{ workflow.currentStep?.name }}</p>
                    <p><strong>Người tạo:</strong> {{ workflow.createdByUser.fullName }}</p>
                    <p><strong>Ngày tạo:</strong> {{ workflow.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                  <div class="workflow-actions">
                    <button class="btn btn-primary" (click)="viewWorkflow(workflow.id); $event.stopPropagation()">
                      Xử lý
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <p>Không có quy trình nào cần xử lý</p>
            </div>
          }
        </div>

        <!-- Workflows của tôi -->
        <div class="workflow-section">
          <h3>Quy trình của tôi</h3>
          @if (myWorkflows.length > 0) {
            <div class="workflow-list">
              @for (workflow of myWorkflows; track workflow.id) {
                <div class="workflow-card" [class]="getStatusClass(workflow.status)" (click)="viewWorkflow(workflow.id)">
                  <div class="workflow-header">
                    <h4>{{ workflow.template.name }}</h4>
                    <span class="status-badge" [class]="getStatusClass(workflow.status)">
                      {{ getStatusLabel(workflow.status) }}
                    </span>
                  </div>
                  <div class="workflow-info">
                    <p><strong>Bước hiện tại:</strong> {{ workflow.currentStep?.name || 'Đã hoàn thành' }}</p>
                    <p><strong>Ngày tạo:</strong> {{ workflow.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                  <div class="workflow-actions">
                    <button class="btn btn-secondary" (click)="viewWorkflow(workflow.id); $event.stopPropagation()">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <p>Bạn chưa tạo quy trình nào</p>
              <button class="btn btn-primary" (click)="createNewWorkflow()">
                Tạo quy trình mới
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .workflow-dashboard {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .dashboard-header h2 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 600;
      color: #1f2937;
    }

    .dashboard-header p {
      margin: 0;
      color: #6b7280;
      font-size: 1.1rem;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #3b82f6;
      margin-bottom: 8px;
    }

    .stat-label {
      color: #6b7280;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .workflow-sections {
      display: grid;
      gap: 32px;
    }

    .workflow-section h3 {
      margin: 0 0 20px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .workflow-list {
      display: grid;
      gap: 16px;
    }

    .workflow-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .workflow-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .workflow-card.pending {
      border-left: 4px solid #f59e0b;
    }

    .workflow-card.completed {
      border-left: 4px solid #10b981;
    }

    .workflow-card.rejected {
      border-left: 4px solid #ef4444;
    }

    .workflow-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .workflow-header h4 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.completed {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    .workflow-info {
      margin-bottom: 16px;
    }

    .workflow-info p {
      margin: 0 0 4px 0;
      font-size: 0.9rem;
      color: #6b7280;
    }

    .workflow-info strong {
      color: #374151;
    }

    .workflow-actions {
      display: flex;
      gap: 8px;
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

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      background: #f9fafb;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
    }

    .empty-state p {
      margin: 0 0 16px 0;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .workflow-dashboard {
        padding: 16px;
      }

      .dashboard-stats {
        grid-template-columns: 1fr;
      }

      .workflow-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class WorkflowDashboardComponent implements OnInit {
  pendingWorkflows: WorkflowInstance[] = [];
  myWorkflows: WorkflowInstance[] = [];
  pendingCount = 0;
  myWorkflowsCount = 0;
  completedCount = 0;

  constructor(
    private workflowInstancesService: WorkflowInstancesService,
    private router: Router,
    private navigationService: WorkflowNavigationService
  ) {}

  ngOnInit(): void {
    this.loadWorkflows();
  }

  async loadWorkflows(): Promise<void> {
    try {
      // Load pending workflows
      this.workflowInstancesService.getMyPendingWorkflows().subscribe({
        next: (response: any) => {
          this.pendingWorkflows = response.data?.myPendingWorkflows || [];
          this.pendingCount = this.pendingWorkflows.length;
        },
        error: (error) => console.error('Error loading pending workflows:', error)
      });

      // Load my workflows
      this.workflowInstancesService.getMyWorkflowInstances().subscribe({
        next: (response: any) => {
          this.myWorkflows = response.data?.myWorkflowInstances || [];
          this.myWorkflowsCount = this.myWorkflows.length;
          this.completedCount = this.myWorkflows.filter(w => w.status === 'COMPLETED').length;
        },
        error: (error) => console.error('Error loading my workflows:', error)
      });
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  }

  viewWorkflow(workflowId: number): void {
    this.navigationService.navigateToWorkflow(workflowId);
  }

  createNewWorkflow(): void {
    this.navigationService.navigateToCreateWorkflow();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'IN_PROGRESS':
        return 'pending';
      case 'COMPLETED':
        return 'completed';
      case 'REJECTED':
      case 'CANCELLED':
        return 'rejected';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'IN_PROGRESS':
        return 'Đang xử lý';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'REJECTED':
        return 'Từ chối';
      case 'CANCELLED':
        return 'Hủy bỏ';
      default:
        return status;
    }
  }
}
