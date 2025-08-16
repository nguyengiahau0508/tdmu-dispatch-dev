import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WorkflowNavigationService {
  constructor(private router: Router) {}

  /**
   * Chuyển đến trang tổng quan workflow
   */
  navigateToOverview(): void {
    this.router.navigate(['/workflow']);
  }

  /**
   * Chuyển đến dashboard workflow
   */
  navigateToDashboard(): void {
    this.router.navigate(['/workflow/dashboard']);
  }

  /**
   * Chuyển đến trang văn bản cần xử lý
   */
  navigateToPendingDocuments(): void {
    this.router.navigate(['/workflow/pending']);
  }

  /**
   * Chuyển đến trang xử lý workflow cụ thể
   */
  navigateToWorkflowProcess(workflowId: number): void {
    this.router.navigate(['/workflow', workflowId, 'process']);
  }

  /**
   * Chuyển đến trang chi tiết workflow
   */
  navigateToWorkflowDetails(workflowId: number): void {
    this.router.navigate(['/workflow', workflowId, 'details']);
  }

  /**
   * Chuyển đến trang workflow (tổng quan)
   */
  navigateToWorkflow(workflowId: number): void {
    this.router.navigate(['/workflow', workflowId]);
  }

  /**
   * Chuyển đến trang thông báo
   */
  navigateToNotifications(): void {
    this.router.navigate(['/workflow/notifications']);
  }

  /**
   * Chuyển đến trang tạo workflow mới
   */
  navigateToCreateWorkflow(): void {
    this.router.navigate(['/workflow/create']);
  }

  /**
   * Quay lại trang trước đó
   */
  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.router.routerState.root });
  }

  /**
   * Chuyển đến trang chính
   */
  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Chuyển đến trang tài liệu
   */
  navigateToDocuments(): void {
    this.router.navigate(['/all-documents']);
  }

  /**
   * Kiểm tra xem có đang ở trang workflow không
   */
  isInWorkflowSection(): boolean {
    const url = this.router.url;
    return url.startsWith('/workflow');
  }

  /**
   * Lấy workflow ID từ URL hiện tại
   */
  getCurrentWorkflowId(): number | null {
    const url = this.router.url;
    const match = url.match(/\/workflow\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Lấy tab hiện tại từ URL
   */
  getCurrentTab(): string {
    const url = this.router.url;
    if (url.includes('/pending')) return 'pending';
    if (url.includes('/dashboard')) return 'dashboard';
    if (url.includes('/notifications')) return 'notifications';
    return 'overview';
  }
}
