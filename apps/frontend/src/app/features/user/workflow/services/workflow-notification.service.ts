import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { WorkflowInstancesService } from './workflow-instances.service';
import { WorkflowInstance } from '../models/workflow-instance.model';

export interface WorkflowNotification {
  id: number;
  type: 'pending' | 'completed' | 'rejected';
  message: string;
  workflowId: number;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowNotificationService {
  private pendingCountSubject = new BehaviorSubject<number>(0);
  private notificationsSubject = new BehaviorSubject<WorkflowNotification[]>([]);
  private refreshInterval = 30000; // 30 giây

  public pendingCount$ = this.pendingCountSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private workflowInstancesService: WorkflowInstancesService) {
    this.startAutoRefresh();
  }

  /**
   * Bắt đầu tự động refresh dữ liệu
   */
  private startAutoRefresh(): void {
    interval(this.refreshInterval)
      .pipe(
        startWith(0),
        switchMap(() => this.loadPendingCount())
      )
      .subscribe();
  }

  /**
   * Load số lượng văn bản đang chờ xử lý
   */
  async loadPendingCount(): Promise<void> {
    try {
      this.workflowInstancesService.getMyPendingWorkflows().subscribe({
        next: (response: any) => {
          const pendingWorkflows = response.data?.myPendingWorkflows || [];
          this.pendingCountSubject.next(pendingWorkflows.length);
          this.checkForNewNotifications(pendingWorkflows);
        },
        error: (error) => {
          console.error('Error loading pending count:', error);
        }
      });
    } catch (error) {
      console.error('Error loading pending count:', error);
    }
  }

  /**
   * Kiểm tra và tạo thông báo mới
   */
  private checkForNewNotifications(pendingWorkflows: WorkflowInstance[]): void {
    const currentNotifications = this.notificationsSubject.value;
    const newNotifications: WorkflowNotification[] = [];

    pendingWorkflows.forEach(workflow => {
      // Kiểm tra xem đã có thông báo cho workflow này chưa
      const existingNotification = currentNotifications.find(
        n => n.workflowId === workflow.id && n.type === 'pending'
      );

      if (!existingNotification) {
        // Tạo thông báo mới
        const notification: WorkflowNotification = {
          id: Date.now() + Math.random(), // Tạo ID duy nhất
          type: 'pending',
          message: `Văn bản "${workflow.template.name}" cần xử lý`,
          workflowId: workflow.id,
          timestamp: new Date(),
          read: false
        };
        newNotifications.push(notification);
      }
    });

    if (newNotifications.length > 0) {
      const updatedNotifications = [...currentNotifications, ...newNotifications];
      this.notificationsSubject.next(updatedNotifications);
      this.showBrowserNotification(newNotifications);
    }
  }

  /**
   * Hiển thị thông báo trình duyệt
   */
  private showBrowserNotification(notifications: WorkflowNotification[]): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      notifications.forEach(notification => {
        new Notification('TDMU Dispatch', {
          body: notification.message,
          icon: '/assets/icons/notification-icon.png',
          tag: `workflow-${notification.workflowId}`
        });
      });
    }
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  markAsRead(notificationId: number): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification =>
      ({ ...notification, read: true })
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Xóa thông báo
   */
  removeNotification(notificationId: number): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(
      notification => notification.id !== notificationId
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Xóa tất cả thông báo
   */
  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount(): Observable<number> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        const unreadCount = notifications.filter(n => !n.read).length;
        observer.next(unreadCount);
      });
    });
  }

  /**
   * Yêu cầu quyền thông báo
   */
  requestNotificationPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          resolve(true);
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().then(permission => {
            resolve(permission === 'granted');
          });
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }

  /**
   * Refresh thủ công
   */
  manualRefresh(): void {
    this.loadPendingCount();
  }

  /**
   * Lấy thông báo theo loại
   */
  getNotificationsByType(type: 'pending' | 'completed' | 'rejected'): Observable<WorkflowNotification[]> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        const filteredNotifications = notifications.filter(n => n.type === type);
        observer.next(filteredNotifications);
      });
    });
  }
}
