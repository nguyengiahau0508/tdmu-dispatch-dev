import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TaskAssignmentService, TaskAssignment, TaskStatistics } from '../../../core/services/dispatch/task-assignment.service';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./task-management.component.css'],
  template: `
    <div class="task-management-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Quản lý công việc</h1>
          <p>Theo dõi và quản lý các công việc được giao</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-success" (click)="openNewTaskAssignment()">
            <img src="/icons/assignment.svg" alt="Giao việc" class="btn-icon">
            Giao việc mới
          </button>
          <button class="btn btn-secondary" (click)="refreshData()">
            <i class="fas fa-sync-alt"></i>
            Làm mới
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="statistics-section" *ngIf="statistics">
        <h3 class="section-title">Thống kê tổng quan</h3>
        <div class="statistics-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.total }}</div>
              <div class="stat-label">Tổng cộng</div>
            </div>
          </div>
          <div class="stat-card pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.pending }}</div>
              <div class="stat-label">Chờ xử lý</div>
            </div>
          </div>
          <div class="stat-card in-progress">
            <div class="stat-icon">🔄</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.inProgress }}</div>
              <div class="stat-label">Đang thực hiện</div>
            </div>
          </div>
          <div class="stat-card completed">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.completed }}</div>
              <div class="stat-label">Đã hoàn thành</div>
            </div>
          </div>
          <div class="stat-card cancelled">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.cancelled }}</div>
              <div class="stat-label">Đã hủy</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-section">
        <div class="tabs">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'assigned-to-me'"
            (click)="setActiveTab('assigned-to-me')">
            <i class="fas fa-inbox"></i>
            Công việc được giao
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'assigned-by-me'"
            (click)="setActiveTab('assigned-by-me')">
            <i class="fas fa-paper-plane"></i>
            Công việc tôi giao
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="filters">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Tìm kiếm công việc..." 
              [(ngModel)]="searchTerm"
              (input)="onSearchChange()"
              class="search-input">
          </div>
          <div class="status-filter">
            <select [(ngModel)]="statusFilter" (change)="onStatusFilterChange()" class="status-select">
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="IN_PROGRESS">Đang thực hiện</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Task List -->
      <div class="task-list" *ngIf="!isLoading">
        <div class="task-item" *ngFor="let task of filteredTasks" [class.overdue]="taskAssignmentService.isOverdue(task)">
          <div class="task-header">
            <div class="task-title">
              <h4>{{ task.document.title }}</h4>
              <span class="task-id">#{{ task.id }}</span>
            </div>
            <div class="task-status">
              <span class="status-badge" [class]="taskAssignmentService.getStatusClass(task.status)">
                {{ taskAssignmentService.getStatusLabel(task.status) }}
              </span>
            </div>
          </div>

          <div class="task-content">
            <div class="task-description" *ngIf="task.taskDescription">
              <strong>Mô tả:</strong> {{ task.taskDescription }}
            </div>
            
            <div class="task-details">
              <div class="detail-item">
                <strong>Giao bởi:</strong> 
                {{ task.assignedByUser.firstName }} {{ task.assignedByUser.lastName }}
              </div>
              <div class="detail-item" *ngIf="activeTab === 'assigned-to-me'">
                <strong>Giao cho:</strong> 
                {{ task.assignedToUser.firstName }} {{ task.assignedToUser.lastName }}
              </div>
              <div class="detail-item">
                <strong>Ngày giao:</strong> 
                {{ task.assignedAt | date:'dd/MM/yyyy HH:mm' }}
              </div>
              <div class="detail-item" *ngIf="task.deadline">
                <strong>Hạn hoàn thành:</strong> 
                <span [class.overdue]="taskAssignmentService.isOverdue(task)">
                  {{ task.deadline | date:'dd/MM/yyyy HH:mm' }}
                </span>
              </div>
            </div>

            <div class="task-instructions" *ngIf="task.instructions">
              <strong>Hướng dẫn:</strong> {{ task.instructions }}
            </div>

            <div class="task-notes" *ngIf="task.notes">
              <strong>Ghi chú:</strong> {{ task.notes }}
            </div>
          </div>

          <div class="task-actions">
            <button 
              class="btn btn-sm btn-outline-primary" 
              (click)="viewTaskDetails(task)"
              *ngIf="activeTab === 'assigned-to-me'">
              Xem chi tiết
            </button>
            
            <div class="status-actions" *ngIf="activeTab === 'assigned-to-me' && task.status === 'PENDING'">
              <button 
                class="btn btn-sm btn-info" 
                (click)="updateTaskStatus(task.id, 'IN_PROGRESS')">
                Bắt đầu
              </button>
            </div>

            <div class="status-actions" *ngIf="activeTab === 'assigned-to-me' && task.status === 'IN_PROGRESS'">
              <button 
                class="btn btn-sm btn-success" 
                (click)="updateTaskStatus(task.id, 'COMPLETED')">
                Hoàn thành
              </button>
            </div>

            <button 
              class="btn btn-sm btn-danger" 
              (click)="cancelTask(task.id)"
              *ngIf="activeTab === 'assigned-by-me' && task.status !== 'COMPLETED'">
              Hủy
            </button>
          </div>
        </div>

        <div class="no-tasks" *ngIf="filteredTasks.length === 0">
          <p>Không có công việc nào.</p>
        </div>
      </div>

      <div class="loading" *ngIf="isLoading">
        <p>Đang tải...</p>
      </div>
    </div>
  `,
  styles: [`
    .task-management-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header h2 {
      margin: 0;
      color: #333;
    }

    .statistics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #007bff;
    }

    .stat-label {
      color: #666;
      margin-top: 5px;
    }

    .stat-card.pending .stat-number { color: #ffc107; }
    .stat-card.in-progress .stat-number { color: #17a2b8; }
    .stat-card.completed .stat-number { color: #28a745; }
    .stat-card.cancelled .stat-number { color: #dc3545; }

    .tabs {
      display: flex;
      border-bottom: 2px solid #eee;
      margin-bottom: 20px;
    }

    .tab-btn {
      padding: 12px 24px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 16px;
      color: #666;
      border-bottom: 2px solid transparent;
    }

    .tab-btn.active {
      color: #007bff;
      border-bottom-color: #007bff;
    }

    .filters {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .search-input, .status-select {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .search-input {
      flex: 1;
      min-width: 300px;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .task-item {
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }

    .task-item.overdue {
      border-left: 4px solid #dc3545;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }

    .task-title h4 {
      margin: 0 0 5px 0;
      color: #333;
    }

    .task-id {
      color: #666;
      font-size: 12px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-pending { background: #fff3cd; color: #856404; }
    .status-in_progress { background: #d1ecf1; color: #0c5460; }
    .status-completed { background: #d4edda; color: #155724; }
    .status-cancelled { background: #f8d7da; color: #721c24; }

    .task-content {
      margin-bottom: 15px;
    }

    .task-description, .task-instructions, .task-notes {
      margin-bottom: 10px;
      line-height: 1.5;
    }

    .task-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 15px;
    }

    .detail-item {
      font-size: 14px;
    }

    .overdue {
      color: #dc3545;
      font-weight: bold;
    }

    .task-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }

    .btn-primary { background: #007bff; color: white; }
    .btn-info { background: #17a2b8; color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-outline-primary { background: white; color: #007bff; border: 1px solid #007bff; }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .no-tasks, .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }

      .filters {
        flex-direction: column;
      }

      .search-input {
        min-width: auto;
      }

      .task-header {
        flex-direction: column;
        gap: 10px;
      }

      .task-actions {
        flex-direction: column;
      }
    }
  `]
})
export class TaskManagementComponent implements OnInit {
  activeTab = 'assigned-to-me';
  tasks: TaskAssignment[] = [];
  filteredTasks: TaskAssignment[] = [];
  statistics: TaskStatistics | null = null;
  isLoading = false;
  searchTerm = '';
  statusFilter = '';

  taskAssignmentService = inject(TaskAssignmentService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // Check for documentId parameter
    this.route.queryParams.subscribe(params => {
      const documentId = params['documentId'];
      if (documentId) {
        console.log('Document ID from URL:', documentId);
        // You can use this documentId to pre-filter tasks or show specific document tasks
        this.loadData();
      } else {
        this.loadData();
      }
    });
  }

  async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      await Promise.all([
        this.loadTasks(),
        this.loadStatistics()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadTasks(): Promise<void> {
    try {
      if (this.activeTab === 'assigned-to-me') {
        const result = await this.taskAssignmentService.getMyAssignedTasks().toPromise();
        this.tasks = result || [];
      } else {
        const result = await this.taskAssignmentService.getTasksAssignedByMe().toPromise();
        this.tasks = result || [];
      }
      this.applyFilters();
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.tasks = [];
    }
  }

  async loadStatistics(): Promise<void> {
    try {
      const result = await this.taskAssignmentService.getTaskStatistics().toPromise();
      this.statistics = result || null;
    } catch (error) {
      console.error('Error loading statistics:', error);
      this.statistics = null;
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.loadTasks();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch = !this.searchTerm || 
        task.document.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (task.taskDescription && task.taskDescription.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesStatus = !this.statusFilter || task.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  async updateTaskStatus(taskId: number, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): Promise<void> {
    try {
      await this.taskAssignmentService.updateTaskStatus(taskId, status).toPromise();
      this.loadData(); // Reload data
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái công việc');
    }
  }

  async cancelTask(taskId: number): Promise<void> {
    if (!confirm('Bạn có chắc chắn muốn hủy công việc này?')) {
      return;
    }

    try {
      await this.taskAssignmentService.cancelTask(taskId).toPromise();
      this.loadData(); // Reload data
    } catch (error) {
      console.error('Error cancelling task:', error);
      alert('Có lỗi xảy ra khi hủy công việc');
    }
  }

  viewTaskDetails(task: TaskAssignment): void {
    // Implement task details view
    console.log('View task details:', task);
    // You can implement a modal or navigate to a details page
  }

  refreshData(): void {
    this.loadData();
  }

  openNewTaskAssignment(): void {
    // Open task assignment modal or navigate to assignment page
    // For now, we'll show a simple alert with instructions
    alert('Chức năng giao việc mới sẽ được mở trong modal. Vui lòng sử dụng button "Giao việc" từ trang document để giao việc cho document cụ thể.');
  }
}
