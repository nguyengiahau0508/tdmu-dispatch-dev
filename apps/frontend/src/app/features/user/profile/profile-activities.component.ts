import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, IUserActivity, IGetUserActivitiesInput } from '../../../core/services/profile.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-profile-activities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="activities-container">
      <div class="activities-header">
        <h2>Lịch sử hoạt động</h2>
        <p>Theo dõi các hoạt động của bạn trong hệ thống</p>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-row">
          <div class="filter-group">
            <label for="activityType">Loại hoạt động:</label>
            <select 
              id="activityType" 
              [(ngModel)]="filters.activityType" 
              (change)="loadActivities()"
              class="form-control"
            >
              <option value="">Tất cả</option>
              <option value="LOGIN">Đăng nhập</option>
              <option value="LOGOUT">Đăng xuất</option>
              <option value="PROFILE_UPDATE">Cập nhật profile</option>
              <option value="PASSWORD_CHANGE">Đổi mật khẩu</option>
              <option value="AVATAR_UPDATE">Cập nhật avatar</option>
              <option value="DOCUMENT_VIEW">Xem tài liệu</option>
              <option value="DOCUMENT_CREATE">Tạo tài liệu</option>
              <option value="DOCUMENT_UPDATE">Cập nhật tài liệu</option>
              <option value="DOCUMENT_DELETE">Xóa tài liệu</option>
              <option value="TASK_ASSIGNED">Được giao nhiệm vụ</option>
              <option value="TASK_COMPLETED">Hoàn thành nhiệm vụ</option>
              <option value="APPROVAL_REQUESTED">Yêu cầu phê duyệt</option>
              <option value="APPROVAL_APPROVED">Phê duyệt</option>
              <option value="APPROVAL_REJECTED">Từ chối phê duyệt</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="startDate">Từ ngày:</label>
            <input 
              type="date" 
              id="startDate" 
              [(ngModel)]="filters.startDate" 
              (change)="loadActivities()"
              class="form-control"
            />
          </div>

          <div class="filter-group">
            <label for="endDate">Đến ngày:</label>
            <input 
              type="date" 
              id="endDate" 
              [(ngModel)]="filters.endDate" 
              (change)="loadActivities()"
              class="form-control"
            />
          </div>
        </div>
      </div>

      <!-- Activities List -->
      <div class="activities-list" *ngIf="!isLoading && activities.length > 0">
        <div class="activity-item" *ngFor="let activity of activities">
          <div class="activity-icon">
            <i [class]="getActivityIcon(activity.activityType)"></i>
          </div>
          <div class="activity-content">
            <div class="activity-header">
              <h4>{{ getActivityTitle(activity.activityType) }}</h4>
              <span class="activity-time">{{ formatDate(activity.createdAt) }}</span>
            </div>
            <p class="activity-description" *ngIf="activity.description">
              {{ activity.description }}
            </p>
            <div class="activity-meta" *ngIf="activity.ipAddress || activity.userAgent">
              <small *ngIf="activity.ipAddress">
                <i class="fas fa-globe"></i> {{ activity.ipAddress }}
              </small>
              <small *ngIf="activity.userAgent">
                <i class="fas fa-desktop"></i> {{ getBrowserInfo(activity.userAgent) }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && activities.length === 0">
        <i class="fas fa-history"></i>
        <h3>Chưa có hoạt động nào</h3>
        <p>Hoạt động của bạn sẽ xuất hiện ở đây</p>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Đang tải lịch sử hoạt động...</p>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="meta && meta.pageCount > 1">
        <button 
          class="btn btn-secondary" 
          [disabled]="meta.page <= 1"
          (click)="changePage(meta.page - 1)"
        >
          <i class="fas fa-chevron-left"></i> Trước
        </button>
        
        <span class="page-info">
          Trang {{ meta.page }} / {{ meta.pageCount }}
        </span>
        
        <button 
          class="btn btn-secondary" 
          [disabled]="meta.page >= meta.pageCount"
          (click)="changePage(meta.page + 1)"
        >
          Sau <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .activities-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }

    .activities-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .activities-header h2 {
      color: #333;
      margin-bottom: 10px;
    }

    .activities-header p {
      color: #666;
      font-size: 16px;
    }

    .filters-section {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .filter-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
    }

    .filter-group label {
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
    }

    .form-control {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .activities-list {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .activity-item {
      display: flex;
      padding: 20px;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.3s;
    }

    .activity-item:hover {
      background-color: #f8f9fa;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #007bff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      flex-shrink: 0;
    }

    .activity-icon i {
      font-size: 18px;
    }

    .activity-content {
      flex: 1;
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .activity-header h4 {
      margin: 0;
      color: #333;
      font-size: 16px;
    }

    .activity-time {
      color: #666;
      font-size: 12px;
    }

    .activity-description {
      color: #555;
      margin: 0 0 8px 0;
      font-size: 14px;
    }

    .activity-meta {
      display: flex;
      gap: 15px;
      font-size: 12px;
      color: #888;
    }

    .activity-meta small {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .empty-state i {
      font-size: 48px;
      color: #ccc;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      color: #666;
      margin-bottom: 10px;
    }

    .empty-state p {
      color: #999;
    }

    .loading-state {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      margin-top: 20px;
      padding: 20px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #545b62;
    }

    .btn-secondary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .page-info {
      color: #666;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .filter-row {
        grid-template-columns: 1fr;
      }
      
      .activity-item {
        flex-direction: column;
        text-align: center;
      }
      
      .activity-icon {
        margin: 0 auto 15px;
      }
      
      .activity-header {
        flex-direction: column;
        gap: 5px;
      }
      
      .pagination {
        flex-direction: column;
        gap: 10px;
      }
    }
  `]
})
export class ProfileActivitiesComponent implements OnInit {
  private profileService = inject(ProfileService);
  private notificationService = inject(NotificationService);

  activities: IUserActivity[] = [];
  meta: any = null;
  isLoading = false;
  filters: IGetUserActivitiesInput = {
    page: 1,
    limit: 10
  };

  ngOnInit() {
    this.loadActivities();
  }

  loadActivities() {
    this.isLoading = true;

    this.profileService.getUserActivities(this.filters).subscribe({
      next: (response) => {
        this.activities = response.data || [];
        this.meta = response.meta || null;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.showError('Lỗi', 'Không thể tải lịch sử hoạt động');
        this.isLoading = false;
        console.error('Error loading activities:', error);
      }
    });
  }

  changePage(page: number) {
    this.filters.page = page;
    this.loadActivities();
  }

  getActivityIcon(activityType: string): string {
    const icons: { [key: string]: string } = {
      'LOGIN': 'fas fa-sign-in-alt',
      'LOGOUT': 'fas fa-sign-out-alt',
      'PROFILE_UPDATE': 'fas fa-user-edit',
      'PASSWORD_CHANGE': 'fas fa-key',
      'AVATAR_UPDATE': 'fas fa-image',
      'DOCUMENT_VIEW': 'fas fa-eye',
      'DOCUMENT_CREATE': 'fas fa-plus',
      'DOCUMENT_UPDATE': 'fas fa-edit',
      'DOCUMENT_DELETE': 'fas fa-trash',
      'TASK_ASSIGNED': 'fas fa-tasks',
      'TASK_COMPLETED': 'fas fa-check-circle',
      'APPROVAL_REQUESTED': 'fas fa-clock',
      'APPROVAL_APPROVED': 'fas fa-thumbs-up',
      'APPROVAL_REJECTED': 'fas fa-thumbs-down'
    };
    return icons[activityType] || 'fas fa-info-circle';
  }

  getActivityTitle(activityType: string): string {
    const titles: { [key: string]: string } = {
      'LOGIN': 'Đăng nhập',
      'LOGOUT': 'Đăng xuất',
      'PROFILE_UPDATE': 'Cập nhật profile',
      'PASSWORD_CHANGE': 'Đổi mật khẩu',
      'AVATAR_UPDATE': 'Cập nhật avatar',
      'DOCUMENT_VIEW': 'Xem tài liệu',
      'DOCUMENT_CREATE': 'Tạo tài liệu',
      'DOCUMENT_UPDATE': 'Cập nhật tài liệu',
      'DOCUMENT_DELETE': 'Xóa tài liệu',
      'TASK_ASSIGNED': 'Được giao nhiệm vụ',
      'TASK_COMPLETED': 'Hoàn thành nhiệm vụ',
      'APPROVAL_REQUESTED': 'Yêu cầu phê duyệt',
      'APPROVAL_APPROVED': 'Phê duyệt',
      'APPROVAL_REJECTED': 'Từ chối phê duyệt'
    };
    return titles[activityType] || 'Hoạt động khác';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getBrowserInfo(userAgent: string): string {
    // Simple browser detection
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Browser';
  }
}
