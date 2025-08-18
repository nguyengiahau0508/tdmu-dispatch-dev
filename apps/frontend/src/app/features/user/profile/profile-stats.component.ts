import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService, IProfileStats } from '../../../core/services/profile.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-container">

      <div class="stats-content" *ngIf="stats">
        <!-- User Info Card -->
        <div class="stats-card user-info-card">
          <div class="card-header">
            <h3>
              <img src="/icons/account_circle.svg" alt="User">
              <span>Thông tin cơ bản</span>
            </h3>
          </div>
          <div class="card-content">
            <div class="user-avatar">
              <img 
                [src]="stats.user.avatar || '/assets/images/default-avatar.png'" 
                alt="Avatar" 
                class="avatar-image"
              />
            </div>
            <div class="user-details">
              <h4>{{ stats.user.fullName }}</h4>
              <p>
                <img src="/icons/email.svg" alt="Email">
                <span>{{ stats.user.email }}</span>
              </p>
              <p>
                <img src="/icons/calendar.svg" alt="Calendar">
                <span>Tham gia: {{ formatDate(stats.user.createdAt) }}</span>
              </p>
              <p>
                <img src="/icons/login.svg" alt="Login">
                <span>Đăng nhập cuối: {{ formatDate(stats.user.lastLoginAt || null) }}</span>
              </p>
              <p>
                <img src="/icons/analytics.svg" alt="Analytics">
                <span>Số lần đăng nhập: {{ stats.user.loginCount }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Activity Stats -->
        <div class="stats-card">
          <div class="card-header">
            <h3><i class="fas fa-chart-bar"></i> Thống kê hoạt động</h3>
          </div>
          <div class="card-content">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ stats.totalActivities }}</div>
                <div class="stat-label">Tổng hoạt động</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ getActivityCount('LOGIN') }}</div>
                <div class="stat-label">Lần đăng nhập</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ getActivityCount('DOCUMENT_VIEW') }}</div>
                <div class="stat-label">Lần xem tài liệu</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ getActivityCount('DOCUMENT_CREATE') }}</div>
                <div class="stat-label">Tài liệu đã tạo</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="stats-card">
          <div class="card-header">
            <h3><i class="fas fa-history"></i> Hoạt động gần đây</h3>
          </div>
          <div class="card-content">
            <div class="recent-activities" *ngIf="stats.recentActivities.length > 0">
              <div class="activity-item" *ngFor="let activity of stats.recentActivities">
                <div class="activity-icon">
                  <i [class]="getActivityIcon(activity.activityType)"></i>
                </div>
                <div class="activity-info">
                  <div class="activity-title">{{ getActivityTitle(activity.activityType) }}</div>
                  <div class="activity-time">{{ formatDate(activity.createdAt) }}</div>
                </div>
              </div>
            </div>
            <div class="empty-activities" *ngIf="stats.recentActivities.length === 0">
              <i class="fas fa-info-circle"></i>
              <p>Chưa có hoạt động nào</p>
            </div>
          </div>
        </div>

        <!-- Activity Breakdown -->
        <div class="stats-card">
          <div class="card-header">
            <h3><i class="fas fa-pie-chart"></i> Phân loại hoạt động</h3>
          </div>
          <div class="card-content">
            <div class="activity-breakdown">
              <div class="breakdown-item" *ngFor="let stat of stats.activityStats">
                <div class="breakdown-label">{{ getActivityTitle(stat.type) }}</div>
                <div class="breakdown-bar">
                  <div 
                    class="breakdown-fill" 
                    [style.width.%]="getPercentage(stat.count)"
                  ></div>
                </div>
                <div class="breakdown-count">{{ stat.count }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Đang tải thống kê...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <p>{{ error }}</p>
        <button class="btn btn-primary" (click)="loadStats()">Thử lại</button>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
      margin: 0 auto;
    }

    .stats-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .stats-card {
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }

    .user-info-card {
      grid-column: 1 / -1;
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
      padding: 20px;
    }

    .user-info-card .card-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .user-avatar {
      flex-shrink: 0;
    }

    .avatar-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .user-details h4 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 20px;
    }

    .user-details p {
      margin: 5px 0;
      color: #666;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-details i {
      width: 16px;
      color: #007bff;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .stat-item {
      text-align: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #007bff;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #666;
      font-size: 14px;
    }

    .recent-activities {
      max-height: 300px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
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
      font-size: 14px;
    }

    .activity-info {
      flex: 1;
    }

    .activity-title {
      font-weight: 500;
      color: #333;
      margin-bottom: 2px;
    }

    .activity-time {
      font-size: 12px;
      color: #666;
    }

    .empty-activities {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .empty-activities i {
      font-size: 32px;
      margin-bottom: 10px;
      color: #ccc;
    }

    .activity-breakdown {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .breakdown-item {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .breakdown-label {
      flex: 1;
      font-size: 14px;
      color: #333;
    }

    .breakdown-bar {
      flex: 2;
      height: 8px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .breakdown-fill {
      height: 100%;
      background: #007bff;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .breakdown-count {
      width: 40px;
      text-align: right;
      font-weight: bold;
      color: #007bff;
      font-size: 14px;
    }

    .loading-state, .error-state {
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

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    @media (max-width: 768px) {
      .stats-content {
        grid-template-columns: 1fr;
      }
      
      .user-info-card .card-content {
        flex-direction: column;
        text-align: center;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .breakdown-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .breakdown-bar {
        width: 100%;
      }
      
      .breakdown-count {
        text-align: left;
      }
    }
  `]
})
export class ProfileStatsComponent implements OnInit {
  private profileService = inject(ProfileService);
  private notificationService = inject(NotificationService);

  stats: IProfileStats | null = null;
  isLoading = false;
  error: string | null = null;

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    this.error = null;

    this.profileService.getProfileStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải thống kê profile';
        this.isLoading = false;
        console.error('Error loading stats:', error);
      }
    });
  }

  getActivityCount(activityType: string): number {
    if (!this.stats?.activityStats) return 0;
    const stat = this.stats.activityStats.find(s => s.type === activityType);
    return stat ? stat.count : 0;
  }

  getPercentage(count: number): number {
    if (!this.stats?.totalActivities || this.stats.totalActivities === 0) return 0;
    return (count / this.stats.totalActivities) * 100;
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

  formatDate(date: Date | null | undefined): string {
    if (!date) return 'Chưa có';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
