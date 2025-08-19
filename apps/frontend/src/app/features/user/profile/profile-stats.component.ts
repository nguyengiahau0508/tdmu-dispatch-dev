import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService, IProfileStats } from '../../../core/services/profile.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-stats">
      <div class="profile-stats__content" *ngIf="stats">
        <!-- User Info Card -->
        <div class="stats-card stats-card--user-info">
          <div class="stats-card__header">
            <h3 class="stats-card__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Thông tin cơ bản
            </h3>
          </div>
          <div class="stats-card__content">
            <div class="user-info">
              <div class="user-info__avatar">
                <img 
                  [src]="stats.user.avatar || '/assets/images/default-avatar.png'" 
                  alt="Avatar" 
                  class="user-info__image"
                />
              </div>
              <div class="user-info__details">
                <h4 class="user-info__name">{{ stats.user.fullName }}</h4>
                <div class="user-info__items">
                  <div class="user-info__item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>{{ stats.user.email }}</span>
                  </div>
                  <div class="user-info__item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>Tham gia: {{ formatDate(stats.user.createdAt) }}</span>
                  </div>
                  <div class="user-info__item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10,17 15,12 10,7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    <span>Đăng nhập cuối: {{ formatDate(stats.user.lastLoginAt || null) }}</span>
                  </div>
                  <div class="user-info__item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"></path>
                    </svg>
                    <span>Số lần đăng nhập: {{ stats.user.loginCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Stats -->
        <div class="stats-card">
          <div class="stats-card__header">
            <h3 class="stats-card__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"></path>
              </svg>
              Thống kê hoạt động
            </h3>
          </div>
          <div class="stats-card__content">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-item__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 11H1l8-8 8 8h-8v8z"></path>
                  </svg>
                </div>
                <div class="stat-item__content">
                  <div class="stat-item__number">{{ stats.totalActivities }}</div>
                  <div class="stat-item__label">Tổng hoạt động</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-item__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10,17 15,12 10,7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                </div>
                <div class="stat-item__content">
                  <div class="stat-item__number">{{ getActivityCount('LOGIN') }}</div>
                  <div class="stat-item__label">Lần đăng nhập</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-item__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <div class="stat-item__content">
                  <div class="stat-item__number">{{ getActivityCount('DOCUMENT_VIEW') }}</div>
                  <div class="stat-item__label">Lần xem tài liệu</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-item__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                  </svg>
                </div>
                <div class="stat-item__content">
                  <div class="stat-item__number">{{ getActivityCount('DOCUMENT_CREATE') }}</div>
                  <div class="stat-item__label">Tài liệu đã tạo</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="stats-card">
          <div class="stats-card__header">
            <h3 class="stats-card__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
              </svg>
              Hoạt động gần đây
            </h3>
          </div>
          <div class="stats-card__content">
            <div class="recent-activities" *ngIf="stats.recentActivities.length > 0">
              <div class="activity-item" *ngFor="let activity of stats.recentActivities">
                <div class="activity-item__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                </div>
                <div class="activity-item__content">
                  <div class="activity-item__title">{{ getActivityTitle(activity.activityType) }}</div>
                  <div class="activity-item__time">{{ formatDate(activity.createdAt) }}</div>
                </div>
              </div>
            </div>
            <div class="empty-activities" *ngIf="stats.recentActivities.length === 0">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c-1.5 0-2.5-1-2.5-2.5S19.5 7 21 7s2.5 1 2.5 2.5S22.5 12 21 12z"></path>
              </svg>
              <h4>Chưa có hoạt động nào</h4>
              <p>Hoạt động của bạn sẽ xuất hiện ở đây khi bạn sử dụng hệ thống</p>
            </div>
          </div>
        </div>

        <!-- Activity Breakdown -->
        <div class="stats-card">
          <div class="stats-card__header">
            <h3 class="stats-card__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
              Phân loại hoạt động
            </h3>
          </div>
          <div class="stats-card__content">
            <div class="activity-breakdown">
              <div class="breakdown-item" *ngFor="let stat of stats.activityStats">
                <div class="breakdown-item__label">{{ getActivityTitle(stat.type) }}</div>
                <div class="breakdown-item__bar">
                  <div 
                    class="breakdown-item__fill" 
                    [style.width.%]="getPercentage(stat.count)"
                  ></div>
                </div>
                <div class="breakdown-item__count">{{ stat.count }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="loading__spinner"></div>
        <p>Đang tải thống kê...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <p>{{ error }}</p>
        <button class="btn btn-primary" (click)="loadStats()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1,4 1,10 7,10"></polyline>
            <polyline points="23,20 23,14 17,14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
          Thử lại
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Container ===== */
    .profile-stats {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* ===== Content ===== */
    .profile-stats__content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    /* ===== Stats Cards ===== */
    .stats-card {
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .stats-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .stats-card--user-info {
      grid-column: 1 / -1;
    }

    .stats-card__header {
      background: linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 80%, black) 100%);
      color: var(--color-text-on-primary);
      padding: 1.5rem;
    }

    .stats-card__title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .stats-card__content {
      padding: 1.5rem;
    }

    /* ===== User Info ===== */
    .user-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-info__avatar {
      flex-shrink: 0;
    }

    .user-info__image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--color-background-primary);
      box-shadow: var(--shadow-default);
    }

    .user-info__details {
      flex: 1;
    }

    .user-info__name {
      margin: 0 0 1rem 0;
      color: var(--color-text-primary);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .user-info__items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .user-info__item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--color-text-secondary);
      font-size: 0.9rem;
    }

    .user-info__item svg {
      color: var(--color-primary);
      flex-shrink: 0;
    }

    /* ===== Stats Grid ===== */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: color-mix(in srgb, var(--color-background-secondary) 50%, var(--color-background-primary));
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .stat-item:hover {
      background: var(--color-background-secondary);
      transform: translateY(-1px);
    }

    .stat-item__icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--color-primary) 10%, var(--color-background-secondary));
      color: var(--color-primary);
      flex-shrink: 0;
    }

    .stat-item__content {
      flex: 1;
    }

    .stat-item__number {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text-primary);
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .stat-item__label {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    /* ===== Recent Activities ===== */
    .recent-activities {
      max-height: 300px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid var(--color-border);
      transition: background-color 0.2s ease;
    }

    .activity-item:hover {
      background-color: var(--color-background-secondary);
      margin: 0 -1.5rem;
      padding: 1rem 1.5rem;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-item__icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--color-primary) 15%, var(--color-background-secondary));
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      flex-shrink: 0;
    }

    .activity-item__content {
      flex: 1;
    }

    .activity-item__title {
      font-weight: 500;
      color: var(--color-text-primary);
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
    }

    .activity-item__time {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }

    /* ===== Empty Activities ===== */
    .empty-activities {
      text-align: center;
      padding: 3rem 1.5rem;
      color: var(--color-text-secondary);
    }

    .empty-activities svg {
      opacity: 0.3;
      margin-bottom: 1rem;
    }

    .empty-activities h4 {
      margin: 0 0 0.5rem 0;
      color: var(--color-text-primary);
      font-size: 1.1rem;
      font-weight: 600;
    }

    .empty-activities p {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    /* ===== Activity Breakdown ===== */
    .activity-breakdown {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .breakdown-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .breakdown-item__label {
      flex: 1;
      font-size: 0.9rem;
      color: var(--color-text-primary);
      font-weight: 500;
    }

    .breakdown-item__bar {
      flex: 2;
      height: 8px;
      background: var(--color-background-secondary);
      border-radius: 4px;
      overflow: hidden;
    }

    .breakdown-item__fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 80%, white) 100%);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .breakdown-item__count {
      width: 40px;
      text-align: right;
      font-weight: 600;
      color: var(--color-primary);
      font-size: 0.9rem;
    }

    /* ===== Loading State ===== */
    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    .loading__spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--color-background-secondary);
      border-top: 4px solid var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-state p {
      color: var(--color-text-secondary);
      font-size: 1rem;
      margin: 0;
    }

    /* ===== Error State ===== */
    .error-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    .error-state svg {
      color: #dc2626;
      opacity: 0.6;
      margin-bottom: 1rem;
    }

    .error-state p {
      color: var(--color-text-secondary);
      margin: 0 0 1.5rem 0;
      font-size: 1rem;
    }

    /* ===== Buttons ===== */
    .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
      box-shadow: 0 2px 4px color-mix(in srgb, var(--color-primary) 30%, transparent);
    }

    .btn-primary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-primary) 90%, black);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px color-mix(in srgb, var(--color-primary) 40%, transparent);
    }

    /* ===== Responsive Design ===== */
    @media (max-width: 768px) {
      .profile-stats__content {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .user-info {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .breakdown-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      
      .breakdown-item__bar {
        width: 100%;
      }
      
      .breakdown-item__count {
        text-align: left;
      }
    }

    @media (max-width: 480px) {
      .stats-card__content {
        padding: 1rem;
      }

      .user-info__image {
        width: 60px;
        height: 60px;
      }

      .user-info__name {
        font-size: 1.25rem;
      }

      .stat-item {
        padding: 0.75rem;
      }

      .stat-item__icon {
        width: 40px;
        height: 40px;
      }

      .stat-item__number {
        font-size: 1.5rem;
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
