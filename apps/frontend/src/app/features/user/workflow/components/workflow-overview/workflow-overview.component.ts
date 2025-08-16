import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WorkflowDashboardComponent } from '../workflow-dashboard/workflow-dashboard.component';
import { PendingDocumentsComponent } from '../pending-documents/pending-documents.component';
import { WorkflowNotificationService } from '../../services/workflow-notification.service';
import { WorkflowNavigationService } from '../../services/workflow-navigation.service';

@Component({
  selector: 'app-workflow-overview',
  standalone: true,
  imports: [CommonModule, WorkflowDashboardComponent, PendingDocumentsComponent],
  template: `
    <div class="workflow-overview">
      <div class="overview-header">
        <h1>Quản lý Quy trình Văn bản</h1>
        <p>Hệ thống quản lý quy trình xử lý văn bản theo vai trò</p>
      </div>

      <div class="overview-content">
        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'dashboard'"
            (click)="setActiveTab('dashboard')"
          >
            <span class="tab-icon">📊</span>
            Tổng quan
          </button>
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'pending'"
            (click)="setActiveTab('pending')"
          >
            <span class="tab-icon">📄</span>
            Văn bản cần xử lý
            @if (pendingCount > 0) {
              <span class="badge">{{ pendingCount }}</span>
            }
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          @if (activeTab === 'dashboard') {
            <app-workflow-dashboard></app-workflow-dashboard>
          } @else if (activeTab === 'pending') {
            <app-pending-documents></app-pending-documents>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .workflow-overview {
      min-height: 100vh;
      background: #f8fafc;
    }

    .overview-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 24px;
      text-align: center;
    }

    .overview-header h1 {
      margin: 0 0 12px 0;
      font-size: 2.5rem;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .overview-header p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }

    .overview-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .tab-navigation {
      display: flex;
      background: white;
      border-radius: 12px;
      padding: 8px;
      margin: -20px 0 24px 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      position: relative;
      z-index: 10;
    }

    .tab-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .tab-button:hover {
      color: #374151;
      background: #f9fafb;
    }

    .tab-button.active {
      color: #3b82f6;
      background: #eff6ff;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
    }

    .tab-icon {
      font-size: 1.2rem;
    }

    .badge {
      background: #ef4444;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .tab-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .overview-header {
        padding: 24px 16px;
      }

      .overview-header h1 {
        font-size: 2rem;
      }

      .overview-content {
        padding: 0 16px;
      }

      .tab-navigation {
        flex-direction: column;
        gap: 4px;
      }

      .tab-button {
        justify-content: flex-start;
        padding: 16px 20px;
      }
    }
  `]
})
export class WorkflowOverviewComponent implements OnInit, OnDestroy {
  activeTab = 'dashboard';
  pendingCount = 0;
  private subscription = new Subscription();

  constructor(
    private notificationService: WorkflowNotificationService,
    private navigationService: WorkflowNavigationService
  ) {}

  ngOnInit(): void {
    // Subscribe để lấy số lượng pending documents
    this.subscription.add(
      this.notificationService.pendingCount$.subscribe(count => {
        this.pendingCount = count;
      })
    );

    // Yêu cầu quyền thông báo
    this.requestNotificationPermission();

    // Set active tab dựa trên URL hiện tại
    this.activeTab = this.navigationService.getCurrentTab();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  private async requestNotificationPermission(): Promise<void> {
    try {
      const granted = await this.notificationService.requestNotificationPermission();
      if (granted) {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  refreshData(): void {
    this.notificationService.manualRefresh();
  }
}
