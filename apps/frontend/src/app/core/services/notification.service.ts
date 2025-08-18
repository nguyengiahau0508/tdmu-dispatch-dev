import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  showSuccess(title: string, message: string): void {
    // Implement success notification
    console.log('Success:', title, message);
  }

  showError(title: string, message: string): void {
    // Implement error notification
    console.error('Error:', title, message);
  }

  showWarning(title: string, message: string): void {
    // Implement warning notification
    console.warn('Warning:', title, message);
  }

  showInfo(title: string, message: string): void {
    // Implement info notification
    console.log('Info:', title, message);
  }
}
