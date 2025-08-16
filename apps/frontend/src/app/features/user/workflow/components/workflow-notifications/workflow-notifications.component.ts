import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WorkflowNotificationService, WorkflowNotification } from '../../services/workflow-notification.service';
import { WorkflowNavigationService } from '../../services/workflow-navigation.service';

@Component({
  selector: 'app-workflow-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-panel" [class.open]="isOpen">
      <div class="notifications-header">
        <h3>Thông báo</h3>
        <div class="header-actions">
          <button 
            class="btn-icon" 
            (click)="markAllAsRead()"
            [disabled]="unreadCount === 0"
            title="Đánh dấu tất cả đã đọc"
          >
            ✓
          </button>
          <button 
            class="btn-icon" 
            (click)="clearAll()"
            [disabled]="notifications.length === 0"
            title="Xóa tất cả"
          >
            🗑️
          </button>
          <button 
            class="btn-icon" 
            (click)="togglePanel()"
            title="Đóng"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="notifications-content">
        @if (notifications.length > 0) {
          <div class="notifications-list">
            @for (notification of notifications; track notification.id) {
              <div 
                class="notification-item" 
                [class.unread]="!notification.read"
                (click)="handleNotificationClick(notification)"
              >
                <div class="notification-icon">
                  @if (notification.type === 'pending') {
                    <span class="icon pending">📄</span>
                  } @else if (notification.type === 'completed') {
                    <span class="icon completed">✅</span>
                  } @else if (notification.type === 'rejected') {
                    <span class="icon rejected">❌</span>
                  }
                </div>
                
                <div class="notification-content">
                  <p class="notification-message">{{ notification.message }}</p>
                  <span class="notification-time">{{ notification.timestamp | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>

                <div class="notification-actions">
                  <button 
                    class="btn-icon small" 
                    (click)="markAsRead(notification.id); $event.stopPropagation()"
                    [disabled]="notification.read"
                    title="Đánh dấu đã đọc"
                  >
                    ✓
                  </button>
                  <button 
                    class="btn-icon small" 
                    (click)="removeNotification(notification.id); $event.stopPropagation()"
                    title="Xóa thông báo"
                  >
                    ×
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-notifications">
            <div class="empty-icon">🔔</div>
            <p>Không có thông báo nào</p>
          </div>
        }
      </div>

      @if (notifications.length > 0) {
        <div class="notifications-footer">
          <button class="btn btn-secondary" (click)="markAllAsRead()">
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-panel {
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
      transition: right 0.3s ease;
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }

    .notifications-panel.open {
      right: 0;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .notifications-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: none;
      border: none;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .btn-icon:hover:not(:disabled) {
      background: #e5e7eb;
    }

    .btn-icon:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-icon.small {
      padding: 4px;
      font-size: 0.875rem;
    }

    .notifications-content {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }

    .notifications-list {
      padding: 0;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .notification-item:hover {
      background: #f9fafb;
    }

    .notification-item.unread {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
    }

    .notification-item.unread:hover {
      background: #dbeafe;
    }

    .notification-icon {
      flex-shrink: 0;
    }

    .icon {
      font-size: 1.5rem;
    }

    .icon.pending {
      color: #f59e0b;
    }

    .icon.completed {
      color: #10b981;
    }

    .icon.rejected {
      color: #ef4444;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-message {
      margin: 0 0 4px 0;
      font-size: 0.9rem;
      color: #374151;
      line-height: 1.4;
    }

    .notification-time {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .notification-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .empty-notifications {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .empty-notifications p {
      margin: 0;
      font-size: 1rem;
    }

    .notifications-footer {
      padding: 16px 20px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .btn {
      width: 100%;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    @media (max-width: 768px) {
      .notifications-panel {
        width: 100%;
        right: -100%;
      }

      .notifications-header {
        padding: 16px;
      }

      .notification-item {
        padding: 12px 16px;
      }

      .notifications-footer {
        padding: 12px 16px;
      }
    }
  `]
})
export class WorkflowNotificationsComponent implements OnInit, OnDestroy {
  notifications: WorkflowNotification[] = [];
  unreadCount = 0;
  isOpen = false;
  private subscription = new Subscription();

  constructor(
    private notificationService: WorkflowNotificationService,
    private router: Router,
    private navigationService: WorkflowNavigationService
  ) {}

  ngOnInit(): void {
    // Subscribe để lấy thông báo
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
        this.unreadCount = notifications.filter(n => !n.read).length;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  removeNotification(notificationId: number): void {
    this.notificationService.removeNotification(notificationId);
  }

  clearAll(): void {
    this.notificationService.clearAllNotifications();
  }

  handleNotificationClick(notification: WorkflowNotification): void {
    // Đánh dấu đã đọc
    this.markAsRead(notification.id);

    // Chuyển đến trang xử lý workflow
    this.navigationService.navigateToWorkflow(notification.workflowId);
    
    // Đóng panel
    this.isOpen = false;
  }
}
