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
    <div class="profile-activities">
      <!-- Filters -->
      <div class="profile-activities__filters">
        <h3 class="filters__title">Bộ lọc hoạt động</h3>
        <div class="filters__content">
          <div class="filter-group">
            <label for="activityType" class="filter-group__label">Loại hoạt động</label>
            <select 
              id="activityType" 
              [(ngModel)]="filters.activityType" 
              (change)="loadActivities()"
              class="filter-group__select"
            >
              <option value="">Tất cả hoạt động</option>
              <option value="LOGIN">🔐 Đăng nhập</option>
              <option value="LOGOUT">🚪 Đăng xuất</option>
              <option value="PROFILE_UPDATE">👤 Cập nhật profile</option>
              <option value="PASSWORD_CHANGE">🔑 Đổi mật khẩu</option>
              <option value="AVATAR_UPDATE">🖼️ Cập nhật avatar</option>
              <option value="DOCUMENT_VIEW">👁️ Xem tài liệu</option>
              <option value="DOCUMENT_CREATE">📄 Tạo tài liệu</option>
              <option value="DOCUMENT_UPDATE">✏️ Cập nhật tài liệu</option>
              <option value="DOCUMENT_DELETE">🗑️ Xóa tài liệu</option>
              <option value="TASK_ASSIGNED">📋 Được giao nhiệm vụ</option>
              <option value="TASK_COMPLETED">✅ Hoàn thành nhiệm vụ</option>
              <option value="APPROVAL_REQUESTED">⏳ Yêu cầu phê duyệt</option>
              <option value="APPROVAL_APPROVED">👍 Phê duyệt</option>
              <option value="APPROVAL_REJECTED">👎 Từ chối phê duyệt</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="startDate" class="filter-group__label">Từ ngày</label>
            <input 
              type="date" 
              id="startDate" 
              [(ngModel)]="filters.startDate" 
              (change)="loadActivities()"
              class="filter-group__input"
            />
          </div>

          <div class="filter-group">
            <label for="endDate" class="filter-group__label">Đến ngày</label>
            <input 
              type="date" 
              id="endDate" 
              [(ngModel)]="filters.endDate" 
              (change)="loadActivities()"
              class="filter-group__input"
            />
          </div>
        </div>
      </div>

      <!-- Activities List -->
      <div class="profile-activities__content" *ngIf="!isLoading && activities.length > 0">
        <div class="activities-list">
          <div class="activity-item" *ngFor="let activity of activities">
            <div class="activity-item__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </div>
            <div class="activity-item__content">
              <div class="activity-item__header">
                <h4 class="activity-item__title">{{ getActivityTitle(activity.activityType) }}</h4>
                <span class="activity-item__time">{{ formatDate(activity.createdAt) }}</span>
              </div>
              <p class="activity-item__description" *ngIf="activity.description">
                {{ activity.description }}
              </p>
              <div class="activity-item__meta" *ngIf="activity.ipAddress || activity.userAgent">
                <div class="meta-item" *ngIf="activity.ipAddress">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M2 12h20"></path>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  <span>{{ activity.ipAddress }}</span>
                </div>
                <div class="meta-item" *ngIf="activity.userAgent">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  <span>{{ getBrowserInfo(activity.userAgent) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && activities.length === 0">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
        </svg>
        <h3>Chưa có hoạt động nào</h3>
        <p>Hoạt động của bạn sẽ xuất hiện ở đây khi bạn sử dụng hệ thống</p>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="loading__spinner"></div>
        <p>Đang tải lịch sử hoạt động...</p>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="meta && meta.pageCount > 1">
        <button 
          class="btn btn-secondary" 
          [disabled]="meta.page <= 1"
          (click)="changePage(meta.page - 1)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
          Trước
        </button>
        
        <span class="pagination__info">
          Trang {{ meta.page }} / {{ meta.pageCount }}
        </span>
        
        <button 
          class="btn btn-secondary" 
          [disabled]="meta.page >= meta.pageCount"
          (click)="changePage(meta.page + 1)"
        >
          Sau
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Container ===== */
    .profile-activities {
      max-width: 1000px;
      margin: 0 auto;
    }

    /* ===== Filters ===== */
    .profile-activities__filters {
      background: var(--color-background-primary);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
      margin-bottom: 2rem;
    }

    .filters__title {
      color: var(--color-text-primary);
      margin: 0 0 1.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .filters__title::before {
      content: '';
      width: 4px;
      height: 1.25rem;
      background: var(--color-primary);
      border-radius: 2px;
    }

    .filters__content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
    }

    .filter-group__label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--color-text-primary);
      font-size: 0.9rem;
    }

    .filter-group__select,
    .filter-group__input {
      padding: 0.75rem 1rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      font-size: 0.95rem;
      background-color: var(--color-background-secondary);
      color: var(--color-text-primary);
      transition: all 0.2s ease;
    }

    .filter-group__select:focus,
    .filter-group__input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);
      background-color: var(--color-background-primary);
    }

    /* ===== Content ===== */
    .profile-activities__content {
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }

    /* ===== Activities List ===== */
    .activities-list {
      max-height: 600px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      padding: 1.5rem;
      border-bottom: 1px solid var(--color-border);
      transition: all 0.2s ease;
    }

    .activity-item:hover {
      background-color: var(--color-background-secondary);
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-item__icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--color-primary) 15%, var(--color-background-secondary));
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .activity-item:hover .activity-item__icon {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
      transform: scale(1.05);
    }

    .activity-item__content {
      flex: 1;
    }

    .activity-item__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
      gap: 1rem;
    }

    .activity-item__title {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.3;
    }

    .activity-item__time {
      color: var(--color-text-secondary);
      font-size: 0.8rem;
      font-weight: 500;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .activity-item__description {
      color: var(--color-text-secondary);
      margin: 0 0 0.75rem 0;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .activity-item__meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .meta-item svg {
      color: var(--color-primary);
      flex-shrink: 0;
    }

    /* ===== Empty State ===== */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    .empty-state svg {
      opacity: 0.3;
      margin-bottom: 1.5rem;
    }

    .empty-state h3 {
      color: var(--color-text-primary);
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .empty-state p {
      color: var(--color-text-secondary);
      margin: 0;
      font-size: 1rem;
      line-height: 1.5;
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

    /* ===== Pagination ===== */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
      padding: 1.5rem;
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    .pagination__info {
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      min-width: 120px;
      text-align: center;
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-secondary {
      background: var(--color-text-secondary);
      color: var(--color-text-on-primary);
    }

    .btn-secondary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-text-secondary) 90%, black);
      transform: translateY(-1px);
    }

    /* ===== Responsive Design ===== */
    @media (max-width: 768px) {
      .profile-activities__filters {
        padding: 1.5rem;
      }

      .filters__content {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .activity-item {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
      
      .activity-item__icon {
        margin: 0 auto;
      }
      
      .activity-item__header {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }
      
      .activity-item__meta {
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .pagination {
        flex-direction: column;
        gap: 1rem;
      }

      .pagination__info {
        min-width: auto;
      }
    }

    @media (max-width: 480px) {
      .profile-activities__filters {
        padding: 1rem;
      }

      .activity-item {
        padding: 1rem;
      }

      .activity-item__icon {
        width: 40px;
        height: 40px;
      }

      .activity-item__title {
        font-size: 0.9rem;
      }

      .activity-item__description {
        font-size: 0.8rem;
      }

      .activity-item__meta {
        font-size: 0.75rem;
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
      'LOGIN': '/icons/login.svg',
      'LOGOUT': '/icons/logout.svg',
      'PROFILE_UPDATE': '/icons/account_circle.svg',
      'PASSWORD_CHANGE': '/icons/key.svg',
      'AVATAR_UPDATE': '/icons/image.svg',
      'DOCUMENT_VIEW': '/icons/visibility.svg',
      'DOCUMENT_CREATE': '/icons/add.svg',
      'DOCUMENT_UPDATE': '/icons/edit.svg',
      'DOCUMENT_DELETE': '/icons/delete.svg',
      'TASK_ASSIGNED': '/icons/assignment.svg',
      'TASK_COMPLETED': '/icons/check_circle.svg',
      'APPROVAL_REQUESTED': '/icons/schedule.svg',
      'APPROVAL_APPROVED': '/icons/thumb_up.svg',
      'APPROVAL_REJECTED': '/icons/thumb_down.svg'
    };
    return icons[activityType] || '/icons/info.svg';
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
