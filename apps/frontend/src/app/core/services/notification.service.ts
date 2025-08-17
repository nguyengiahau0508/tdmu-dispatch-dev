import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification } from '../../shared/components/notification-banner/notification-banner.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private notificationIdCounter = 0;

  show(notification: Omit<Notification, 'id'>): string {
    const id = `notification-${++this.notificationIdCounter}`;
    const fullNotification: Notification = {
      ...notification,
      id
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, fullNotification]);

    // Tự động đóng notification sau thời gian duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, notification.duration);
    }

    return id;
  }

  showSuccess(title: string, message: string, duration: number = 5000): string {
    return this.show({
      type: 'success',
      title,
      message,
      duration
    });
  }

  showError(title: string, message: string, duration: number = 0): string {
    return this.show({
      type: 'error',
      title,
      message,
      duration
    });
  }

  showWarning(title: string, message: string, duration: number = 5000): string {
    return this.show({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  showInfo(title: string, message: string, duration: number = 5000): string {
    return this.show({
      type: 'info',
      title,
      message,
      duration
    });
  }

  remove(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(filteredNotifications);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }
}
