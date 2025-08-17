import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskRequestService, TaskRequest } from '../../../core/services/dispatch/task-request.service';
import { TaskRequestCreateComponent } from './task-request-create.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-task-request-list',
  standalone: true,
  imports: [CommonModule, TaskRequestCreateComponent],
  template: `
    <div class="task-request-container">
      <div class="header">
        <div class="header-left">
          <h2>Quản lý giao việc</h2>
          <p class="header-subtitle">Giao việc và theo dõi tiến độ công việc</p>
        </div>
        <div class="header-actions">
          @if (hasApprovedTasks) {
            <button class="btn btn-success" (click)="createDocumentFromFirstApprovedTask()">
              <img src="/icons/document.svg" alt="Tạo văn bản" style="width: 16px; height: 16px; margin-right: 8px;">
              Tạo văn bản nhanh
            </button>
          }
          <button class="btn btn-primary" (click)="showCreateModal = true">
            <img src="/icons/add.svg" alt="Thêm" style="width: 16px; height: 16px; margin-right: 8px;">
            Giao việc mới
          </button>
        </div>
      </div>

      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-number">{{ statistics.total }}</div>
          <div class="stat-label">Tổng cộng</div>
        </div>
        <div class="stat-card pending">
          <div class="stat-number">{{ statistics.pending }}</div>
          <div class="stat-label">Chờ xử lý</div>
        </div>
        <div class="stat-card approved">
          <div class="stat-number">{{ statistics.approved }}</div>
          <div class="stat-label">Đã phê duyệt</div>
        </div>
        <div class="stat-card rejected">
          <div class="stat-number">{{ statistics.rejected }}</div>
          <div class="stat-label">Đã từ chối</div>
        </div>
        <div class="stat-card cancelled">
          <div class="stat-number">{{ statistics.cancelled }}</div>
          <div class="stat-label">Đã hủy</div>
        </div>
      </div>

      @if (hasApprovedTasks && activeTab === 'assigned') {
        <div class="notification-banner">
          <div class="banner-content">
            <img src="/icons/check_circle.svg" alt="Thông báo" style="width: 20px; height: 20px;">
            <span>Bạn có {{ approvedTasksCount }} công việc đã được phê duyệt và sẵn sàng tạo văn bản</span>
          </div>
          <button class="btn btn-success btn-sm" (click)="createDocumentFromFirstApprovedTask()">
            <img src="/icons/document.svg" alt="Tạo văn bản" style="width: 16px; height: 16px; margin-right: 8px;">
            Tạo văn bản ngay
          </button>
        </div>
      }

      <div class="tabs">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'assigned'"
          (click)="activeTab = 'assigned'"
        >
          Việc được giao cho tôi
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'created'"
          (click)="activeTab = 'created'"
        >
          Việc tôi đã giao
        </button>
      </div>

      <div class="task-list">
        @if (isLoading) {
          <div class="loading">Đang tải...</div>
        } @else if (currentTasks.length === 0) {
          <div class="empty-state">
            <img src="/icons/assignment.svg" alt="Không có việc" style="width: 64px; height: 64px; opacity: 0.5;">
            <p>Không có yêu cầu giao việc nào</p>
          </div>
        } @else {
          @for (task of currentTasks; track task.id) {
            <div class="task-card" [class]="'status-' + task.status.toLowerCase()">
              <div class="task-header">
                <h3 class="task-title">{{ task.title }}</h3>
                <div class="task-status" [class]="'status-' + task.status.toLowerCase()">
                  {{ getStatusText(task.status) }}
                </div>
              </div>
              
              <div class="task-info">
                <div class="info-row">
                  <span class="label">Người giao:</span>
                  <span class="value">{{ task.requestedByUser.fullName }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Người nhận:</span>
                  <span class="value">{{ task.assignedToUser.fullName }}</span>
                </div>
                @if (task.description) {
                  <div class="info-row">
                    <span class="label">Mô tả:</span>
                    <span class="value">{{ task.description }}</span>
                  </div>
                }
                @if (task.priority) {
                  <div class="info-row">
                    <span class="label">Ưu tiên:</span>
                    <span class="value priority-{{ task.priority.toLowerCase() }}">
                      {{ getPriorityText(task.priority) }}
                    </span>
                  </div>
                }
                @if (task.deadline) {
                  <div class="info-row">
                    <span class="label">Deadline:</span>
                    <span class="value">{{ formatDate(task.deadline) }}</span>
                  </div>
                }
                <div class="info-row">
                  <span class="label">Ngày tạo:</span>
                  <span class="value">{{ formatDate(task.createdAt) }}</span>
                </div>
              </div>

              @if (task.status === 'PENDING' && activeTab === 'assigned') {
                <div class="task-actions">
                  <button class="btn btn-success" (click)="approveTask(task)">
                    <img src="/icons/check.svg" alt="Phê duyệt" style="width: 16px; height: 16px; margin-right: 8px;">
                    Phê duyệt
                  </button>
                  <button class="btn btn-danger" (click)="rejectTask(task)">
                    <img src="/icons/close.svg" alt="Từ chối" style="width: 16px; height: 16px; margin-right: 8px;">
                    Từ chối
                  </button>
                </div>
              }

              @if (task.status === 'APPROVED' && activeTab === 'assigned') {
                <div class="task-actions">
                  <button class="btn btn-success" (click)="createDocumentFromTask(task)">
                    <img src="/icons/document.svg" alt="Tạo văn bản" style="width: 16px; height: 16px; margin-right: 8px;">
                    Tạo văn bản
                  </button>
                </div>
              }

              @if (task.status === 'PENDING' && activeTab === 'created') {
                <div class="task-actions">
                  <button class="btn btn-secondary" (click)="cancelTask(task)">
                    <img src="/icons/cancel.svg" alt="Hủy" style="width: 16px; height: 16px; margin-right: 8px;">
                    Hủy
                  </button>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>

    @if (showCreateModal) {
      <app-task-request-create
        (closeModal)="showCreateModal = false"
        (createdSuccessfully)="onTaskRequestCreated()"
      ></app-task-request-create>
    }
  `,
  styles: [`
    .task-request-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .header-left h2 {
      margin: 0 0 4px 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .header-subtitle {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .notification-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #d1fae5;
      color: #065f46;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid #a7f3d0;
      justify-content: space-between;
    }

    .notification-banner .banner-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .notification-banner img {
      filter: brightness(0) saturate(100%) invert(27%) sepia(87%) saturate(5091%) hue-rotate(202deg) brightness(94%) contrast(101%);
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .stat-card.pending .stat-number {
      color: #f59e0b;
    }

    .stat-card.approved .stat-number {
      color: #10b981;
    }

    .stat-card.rejected .stat-number {
      color: #ef4444;
    }

    .stat-card.cancelled .stat-number {
      color: #6b7280;
    }

    .tabs {
      display: flex;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 24px;
    }

    .tab-btn {
      background: none;
      border: none;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-secondary);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
    }

    .tab-btn.active {
      color: var(--color-primary);
      border-bottom-color: var(--color-primary);
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .task-card {
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 20px;
      transition: all 0.2s ease;
    }

    .task-card:hover {
      box-shadow: var(--shadow-default);
    }

    .task-card.status-pending {
      border-left: 4px solid #f59e0b;
    }

    .task-card.status-approved {
      border-left: 4px solid #10b981;
    }

    .task-card.status-rejected {
      border-left: 4px solid #ef4444;
    }

    .task-card.status-cancelled {
      border-left: 4px solid #6b7280;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .task-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
      flex: 1;
    }

    .task-status {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .task-status.status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .task-status.status-approved {
      background: #d1fae5;
      color: #065f46;
    }

    .task-status.status-rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    .task-status.status-cancelled {
      background: #f3f4f6;
      color: #374151;
    }

    .task-info {
      margin-bottom: 16px;
    }

    .info-row {
      display: flex;
      margin-bottom: 8px;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .label {
      font-weight: 500;
      color: var(--color-text-secondary);
      min-width: 100px;
      margin-right: 12px;
    }

    .value {
      color: var(--color-text-primary);
      flex: 1;
    }

    .priority-low {
      color: #10b981;
    }

    .priority-medium {
      color: #f59e0b;
    }

    .priority-high {
      color: #ef4444;
    }

    .priority-urgent {
      color: #dc2626;
      font-weight: 600;
    }

    .task-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-secondary {
      background: var(--color-background-secondary);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: var(--color-text-secondary);
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--color-text-secondary);
    }

    .empty-state p {
      margin-top: 16px;
      font-size: 1.125rem;
    }

    @media (max-width: 768px) {
      .task-request-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .stats-container {
        grid-template-columns: repeat(2, 1fr);
      }

      .task-header {
        flex-direction: column;
        gap: 12px;
      }

      .task-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class TaskRequestListComponent implements OnInit {
  private taskRequestService = inject(TaskRequestService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  activeTab: 'assigned' | 'created' = 'assigned';
  showCreateModal = false;
  isLoading = false;
  
  assignedTasks: TaskRequest[] = [];
  createdTasks: TaskRequest[] = [];
  statistics = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  };

  get hasApprovedTasks(): boolean {
    return this.assignedTasks.some(task => task.status === 'APPROVED');
  }

  get approvedTasksCount(): number {
    return this.assignedTasks.filter(task => task.status === 'APPROVED').length;
  }

  get currentTasks(): TaskRequest[] {
    return this.activeTab === 'assigned' ? this.assignedTasks : this.createdTasks;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    // Load assigned tasks
    this.taskRequestService.getMyTaskRequests().subscribe({
      next: (tasks) => {
        this.assignedTasks = tasks;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading assigned tasks:', error);
        this.isLoading = false;
      }
    });

    // Load created tasks
    this.taskRequestService.getMyCreatedTaskRequests().subscribe({
      next: (tasks) => {
        this.createdTasks = tasks;
      },
      error: (error) => {
        console.error('Error loading created tasks:', error);
      }
    });

    // Load statistics
    this.taskRequestService.getTaskRequestStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  onTaskRequestCreated(): void {
    this.showCreateModal = false;
    this.loadData();
  }

  approveTask(task: TaskRequest): void {
    if (confirm('Bạn có chắc chắn muốn phê duyệt yêu cầu giao việc này?')) {
      this.taskRequestService.approveTaskRequest({
        taskRequestId: task.id,
        notes: 'Đã phê duyệt'
      }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Thành công', 'Đã phê duyệt yêu cầu giao việc');
          this.loadData();
        },
        error: (error) => {
          console.error('Error approving task:', error);
          this.notificationService.showError('Lỗi', 'Có lỗi xảy ra khi phê duyệt. Vui lòng thử lại.');
        }
      });
    }
  }

  rejectTask(task: TaskRequest): void {
    const reason = prompt('Lý do từ chối:');
    if (reason) {
      this.taskRequestService.rejectTaskRequest({
        taskRequestId: task.id,
        rejectionReason: reason
      }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Thành công', 'Đã từ chối yêu cầu giao việc');
          this.loadData();
        },
        error: (error) => {
          console.error('Error rejecting task:', error);
          this.notificationService.showError('Lỗi', 'Có lỗi xảy ra khi từ chối. Vui lòng thử lại.');
        }
      });
    }
  }

  cancelTask(task: TaskRequest): void {
    if (confirm('Bạn có chắc chắn muốn hủy yêu cầu giao việc này?')) {
      this.taskRequestService.cancelTaskRequest(task.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Thành công', 'Đã hủy yêu cầu giao việc');
          this.loadData();
        },
        error: (error) => {
          console.error('Error cancelling task:', error);
          this.notificationService.showError('Lỗi', 'Có lỗi xảy ra khi hủy. Vui lòng thử lại.');
        }
      });
    }
  }

  createDocumentFromTask(task: TaskRequest): void {
    this.router.navigate(['/document-creation', task.id]);
  }

  createDocumentFromFirstApprovedTask(): void {
    const firstApprovedTask = this.assignedTasks.find(task => task.status === 'APPROVED');
    if (firstApprovedTask) {
      this.createDocumentFromTask(firstApprovedTask);
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Chờ xử lý',
      'APPROVED': 'Đã phê duyệt',
      'REJECTED': 'Đã từ chối',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'LOW': 'Thấp',
      'MEDIUM': 'Trung bình',
      'HIGH': 'Cao',
      'URGENT': 'Khẩn cấp'
    };
    return priorityMap[priority] || priority;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
