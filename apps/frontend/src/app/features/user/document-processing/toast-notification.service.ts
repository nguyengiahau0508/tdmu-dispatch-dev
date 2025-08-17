import { Injectable, ComponentRef, createComponent, ApplicationRef, Injector, Type } from '@angular/core';
import { ToastComponent } from './toast.component';

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

@Injectable({
  providedIn: 'root'
})
export class ToastNotificationService {
  private toasts: ComponentRef<ToastComponent>[] = [];
  private container: HTMLElement | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
    this.createContainer();
  }

  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  show(options: ToastOptions): void {
    const toastRef = createComponent(ToastComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    // Set inputs
    toastRef.instance.message = options.message;
    toastRef.instance.type = options.type || 'info';
    toastRef.instance.position = options.position || 'top-right';

    // Add to container
    if (this.container) {
      this.container.appendChild(toastRef.location.nativeElement);
    }

    // Add to app ref
    this.appRef.attachView(toastRef.hostView);

    // Add to toasts array
    this.toasts.push(toastRef);

    // Auto remove after duration
    const duration = options.duration || 5000;
    setTimeout(() => {
      this.removeToast(toastRef);
    }, duration);

    // Emit close event
    toastRef.instance.closeEvent.subscribe(() => {
      this.removeToast(toastRef);
    });
  }

  success(message: string, options?: Partial<ToastOptions>): void {
    this.show({ ...options, message, type: 'success' });
  }

  error(message: string, options?: Partial<ToastOptions>): void {
    this.show({ ...options, message, type: 'error' });
  }

  info(message: string, options?: Partial<ToastOptions>): void {
    this.show({ ...options, message, type: 'info' });
  }

  warning(message: string, options?: Partial<ToastOptions>): void {
    this.show({ ...options, message, type: 'warning' });
  }

  private removeToast(toastRef: ComponentRef<ToastComponent>): void {
    const index = this.toasts.indexOf(toastRef);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }

    // Remove from DOM
    if (toastRef.location.nativeElement.parentNode) {
      toastRef.location.nativeElement.parentNode.removeChild(toastRef.location.nativeElement);
    }

    // Detach from app ref
    this.appRef.detachView(toastRef.hostView);
    toastRef.destroy();
  }

  clearAll(): void {
    this.toasts.forEach(toastRef => this.removeToast(toastRef));
  }
}
