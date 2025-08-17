import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast" [class]="'toast-' + type" (click)="close()">
      <div class="toast-icon">{{ getIcon() }}</div>
      <div class="toast-content">
        <div class="toast-message">{{ message }}</div>
      </div>
      <button class="toast-close" (click)="close()">
        <span class="close-icon">✕</span>
      </button>
      <div class="toast-progress" [style.width.%]="progress"></div>
    </div>
  `,
  styles: [`
    .toast {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 300px;
      max-width: 400px;
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      animation: slideIn 0.3s ease;
      cursor: pointer;
      overflow: hidden;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .toast:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }

    .toast-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-message {
      color: var(--color-text-primary);
      font-size: 0.875rem;
      line-height: 1.4;
      margin: 0;
    }

    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      color: var(--color-text-secondary);
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .toast-close:hover {
      background: var(--color-background-secondary);
      color: var(--color-text-primary);
    }

    .close-icon {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: currentColor;
      opacity: 0.3;
      transition: width 0.1s linear;
    }

    /* Toast Types */
    .toast-success {
      border-left: 4px solid #10b981;
      color: #10b981;
    }

    .toast-success .toast-icon {
      color: #10b981;
    }

    .toast-error {
      border-left: 4px solid #ef4444;
      color: #ef4444;
    }

    .toast-error .toast-icon {
      color: #ef4444;
    }

    .toast-info {
      border-left: 4px solid var(--color-primary);
      color: var(--color-primary);
    }

    .toast-info .toast-icon {
      color: var(--color-primary);
    }

    .toast-warning {
      border-left: 4px solid #f59e0b;
      color: #f59e0b;
    }

    .toast-warning .toast-icon {
      color: #f59e0b;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .toast {
        min-width: 280px;
        max-width: 350px;
        padding: 12px;
      }

      .toast-message {
        font-size: 0.8rem;
      }

      .toast-icon {
        font-size: 1.125rem;
      }
    }

    @media (max-width: 480px) {
      .toast {
        min-width: 250px;
        max-width: 300px;
        padding: 10px;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'info' | 'warning' = 'info';
  @Input() position: string = 'top-right';
  @Output() closeEvent = new EventEmitter<void>();

  progress: number = 100;
  private progressInterval: any;

  ngOnInit(): void {
    this.startProgress();
  }

  ngOnDestroy(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  getIcon(): string {
    switch (this.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  }

  startProgress(): void {
    const duration = 5000; // 5 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const decrement = 100 / steps;

    this.progressInterval = setInterval(() => {
      this.progress -= decrement;
      if (this.progress <= 0) {
        this.closeEvent.emit();
      }
    }, interval);
  }

  close(): void {
    this.closeEvent.emit();
  }
}
