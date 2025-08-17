import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // milliseconds, 0 = không tự đóng
  action?: {
    label: string;
    callback: () => void;
  };
}

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notification) {
      <div class="notification-banner" [class]="'notification-' + notification.type">
        <div class="notification-content">
          <div class="notification-icon">
            @switch (notification.type) {
              @case ('success') {
                <img src="/icons/check_circle.svg" alt="Success">
              }
              @case ('error') {
                <img src="/icons/error.svg" alt="Error">
              }
              @case ('warning') {
                <img src="/icons/warning.svg" alt="Warning">
              }
              @case ('info') {
                <img src="/icons/info.svg" alt="Info">
              }
            }
          </div>
          <div class="notification-text">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
          </div>
        </div>
        <div class="notification-actions">
          @if (notification.action) {
            <button class="btn btn-sm btn-primary" (click)="notification.action!.callback()">
              {{ notification.action.label }}
            </button>
          }
          <button class="btn btn-sm btn-close" (click)="close()">
            <img src="/icons/close.svg" alt="Close">
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .notification-banner {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      min-width: 300px;
      max-width: 400px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      animation: slideIn 0.3s ease-out;
    }

    .notification-success {
      border-left: 4px solid #10b981;
    }

    .notification-error {
      border-left: 4px solid #ef4444;
    }

    .notification-warning {
      border-left: 4px solid #f59e0b;
    }

    .notification-info {
      border-left: 4px solid #3b82f6;
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .notification-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .notification-icon img {
      width: 100%;
      height: 100%;
    }

    .notification-text {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      font-size: 14px;
      color: var(--color-text-primary);
      margin-bottom: 2px;
    }

    .notification-message {
      font-size: 13px;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    .notification-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 12px;
    }

    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 11px;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover {
      background: color-mix(in srgb, var(--color-primary) 80%, black);
    }

    .btn-close {
      background: transparent;
      color: var(--color-text-secondary);
      padding: 4px;
    }

    .btn-close:hover {
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
    }

    .btn-close img {
      width: 16px;
      height: 16px;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .notification-banner.closing {
      animation: slideOut 0.3s ease-in forwards;
    }

    @media (max-width: 768px) {
      .notification-banner {
        top: 10px;
        right: 10px;
        left: 10px;
        min-width: auto;
        max-width: none;
      }
    }
  `]
})
export class NotificationBannerComponent {
  @Input() notification: Notification | null = null;
  @Output() closeNotification = new EventEmitter<string>();

  close(): void {
    this.closeNotification.emit(this.notification?.id || '');
  }
}
