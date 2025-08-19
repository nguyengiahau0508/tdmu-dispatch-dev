import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskRequestService, TaskRequest } from '../../../core/services/dispatch/task-request.service';
import { TaskRequestCreateComponent } from './task-request-create.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-task-request-list',
  standalone: true,
  imports: [CommonModule, TaskRequestCreateComponent],
  template: `
    <div class="task-request">
      <div class="task-request__header">
        <div class="header__content">
          <h2 class="header__title">Quản lý giao việc</h2>
          <p class="header__subtitle">Giao việc và theo dõi tiến độ công việc</p>
        </div>
        <div class="header__actions">
          @if (hasApprovedTasks) {
            <button class="btn btn-success" (click)="createDocumentFromFirstApprovedTask()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              Tạo văn bản nhanh
            </button>
          }
          <button class="btn btn-primary" (click)="showCreateModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Giao việc mới
          </button>
        </div>
      </div>

      <div class="task-request__stats">
        <div class="stat-card">
          <div class="stat-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11H1l8-8 8 8h-8v8z"></path>
            </svg>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ statistics.total }}</div>
            <div class="stat-card__label">Tổng cộng</div>
          </div>
        </div>
        <div class="stat-card stat-card--pending">
          <div class="stat-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ statistics.pending }}</div>
            <div class="stat-card__label">Chờ xử lý</div>
          </div>
        </div>
        <div class="stat-card stat-card--approved">
          <div class="stat-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ statistics.approved }}</div>
            <div class="stat-card__label">Đã phê duyệt</div>
          </div>
        </div>
        <div class="stat-card stat-card--rejected">
          <div class="stat-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ statistics.rejected }}</div>
            <div class="stat-card__label">Đã từ chối</div>
          </div>
        </div>
        <div class="stat-card stat-card--cancelled">
          <div class="stat-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__number">{{ statistics.cancelled }}</div>
            <div class="stat-card__label">Đã hủy</div>
          </div>
        </div>
      </div>

      @if (hasApprovedTasks && activeTab === 'assigned') {
        <div class="notification-banner">
          <div class="notification-banner__content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
            <span>Bạn có {{ approvedTasksCount }} công việc đã được phê duyệt và sẵn sàng tạo văn bản</span>
          </div>
          <button class="btn btn-success btn-sm" (click)="createDocumentFromFirstApprovedTask()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
            </svg>
            Tạo văn bản ngay
          </button>
        </div>
      }

      <div class="task-request__tabs">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'assigned'"
          (click)="activeTab = 'assigned'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
          Việc được giao cho tôi
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'created'"
          (click)="activeTab = 'created'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Việc tôi đã giao
        </button>
      </div>

      <div class="task-request__content">
        @if (isLoading) {
          <div class="loading">
            <div class="loading__spinner"></div>
            <p>Đang tải danh sách công việc...</p>
          </div>
        } @else if (currentTasks.length === 0) {
          <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            <h3>Không có yêu cầu giao việc nào</h3>
            <p>Chưa có yêu cầu giao việc nào được tạo hoặc bạn chưa được giao việc nào.</p>
            <button class="btn btn-primary" (click)="showCreateModal = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Tạo yêu cầu đầu tiên
            </button>
          </div>
        } @else {
          <div class="task-list">
            @for (task of currentTasks; track task.id) {
              <div class="task-card" [class]="'task-card--' + task.status.toLowerCase()">
                <div class="task-card__header">
                  <div class="task-card__title-section">
                    <h3 class="task-card__title">{{ task.title }}</h3>
                    @if (task.priority) {
                      <span class="priority-badge" [class]="'priority-' + task.priority.toLowerCase()">
                        {{ getPriorityText(task.priority) }}
                      </span>
                    }
                  </div>
                  <div class="task-card__status" [class]="'status-' + task.status.toLowerCase()">
                    {{ getStatusText(task.status) }}
                  </div>
                </div>
                
                <div class="task-card__content">
                  <div class="task-info">
                    <div class="task-info__item">
                      <span class="task-info__label">Người giao:</span>
                      <span class="task-info__value">{{ task.requestedByUser.fullName }}</span>
                    </div>
                    <div class="task-info__item">
                      <span class="task-info__label">Người nhận:</span>
                      <span class="task-info__value">{{ task.assignedToUser.fullName }}</span>
                    </div>
                    @if (task.description) {
                      <div class="task-info__item">
                        <span class="task-info__label">Mô tả:</span>
                        <span class="task-info__value">{{ task.description }}</span>
                      </div>
                    }
                    @if (task.deadline) {
                      <div class="task-info__item">
                        <span class="task-info__label">Deadline:</span>
                        <span class="task-info__value">{{ formatDate(task.deadline) }}</span>
                      </div>
                    }
                    <div class="task-info__item">
                      <span class="task-info__label">Ngày tạo:</span>
                      <span class="task-info__value">{{ formatDate(task.createdAt) }}</span>
                    </div>
                  </div>
                </div>

                @if (task.status === 'PENDING' && activeTab === 'assigned') {
                  <div class="task-card__actions">
                    <button class="btn btn-success" (click)="approveTask(task)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22,4 12,14.01 9,11.01"></polyline>
                      </svg>
                      Phê duyệt
                    </button>
                    <button class="btn btn-danger" (click)="rejectTask(task)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                      Từ chối
                    </button>
                  </div>
                }

                @if (task.status === 'APPROVED' && activeTab === 'assigned') {
                  <div class="task-card__actions">
                    <button class="btn btn-success" (click)="createDocumentFromTask(task)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                      </svg>
                      Tạo văn bản
                    </button>
                  </div>
                }

                @if (task.status === 'PENDING' && activeTab === 'created') {
                  <div class="task-card__actions">
                    <button class="btn btn-secondary" (click)="cancelTask(task)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Hủy
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>

    @if (showCreateModal) {
      <app-task-request-create
        (closeModal)="showCreateModal = false"
        (createdSuccessfully)="onTaskRequestCreated()"
      ></app-task-request-create>
    }
  `,
  styles: [`
    /* ===== Container ===== */
    .task-request {
      padding: 2rem;
      background: var(--color-background-layout);
      min-height: 100vh;
    }

    /* ===== Header ===== */
    .task-request__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      background: var(--color-background-primary);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    .header__content {
      flex: 1;
    }

    .header__title {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text-primary);
      line-height: 1.2;
    }

    .header__subtitle {
      margin: 0;
      font-size: 1rem;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    .header__actions {
      display: flex;
      gap: 0.75rem;
    }

    /* ===== Stats ===== */
    .task-request__stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-default);
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .stat-card__icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--color-primary) 10%, var(--color-background-secondary));
      color: var(--color-primary);
      flex-shrink: 0;
    }

    .stat-card--pending .stat-card__icon {
      background: color-mix(in srgb, #f59e0b 10%, var(--color-background-secondary));
      color: #f59e0b;
    }

    .stat-card--approved .stat-card__icon {
      background: color-mix(in srgb, #10b981 10%, var(--color-background-secondary));
      color: #10b981;
    }

    .stat-card--rejected .stat-card__icon {
      background: color-mix(in srgb, #ef4444 10%, var(--color-background-secondary));
      color: #ef4444;
    }

    .stat-card--cancelled .stat-card__icon {
      background: color-mix(in srgb, #6b7280 10%, var(--color-background-secondary));
      color: #6b7280;
    }

    .stat-card__content {
      flex: 1;
    }

    .stat-card__number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-text-primary);
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .stat-card__label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    /* ===== Notification Banner ===== */
    .notification-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: color-mix(in srgb, #10b981 5%, var(--color-background-secondary));
      border: 1px solid color-mix(in srgb, #10b981 20%, var(--color-border));
      color: #065f46;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .notification-banner__content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .notification-banner svg {
      color: #10b981;
      flex-shrink: 0;
    }

    /* ===== Tabs ===== */
    .task-request__tabs {
      display: flex;
      background: var(--color-background-primary);
      border-radius: 12px;
      padding: 0.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    .tab-btn {
      flex: 1;
      background: none;
      border: none;
      padding: 0.75rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .tab-btn:hover {
      color: var(--color-text-primary);
      background: var(--color-background-secondary);
    }

    .tab-btn.active {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
      box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 30%, transparent);
    }

    /* ===== Content ===== */
    .task-request__content {
      background: var(--color-background-primary);
      border-radius: 12px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }

    /* ===== Loading ===== */
    .loading {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--color-text-secondary);
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

    /* ===== Empty State ===== */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--color-text-secondary);
    }

    .empty-state svg {
      opacity: 0.3;
      margin-bottom: 1.5rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: var(--color-text-primary);
      font-size: 1.25rem;
      font-weight: 600;
    }

    .empty-state p {
      margin: 0 0 1.5rem 0;
      font-size: 1rem;
      line-height: 1.5;
    }

    /* ===== Task List ===== */
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem;
    }

    /* ===== Task Card ===== */
    .task-card {
      background: var(--color-background-primary);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.2s ease;
      border-left: 4px solid var(--color-border);
    }

    .task-card:hover {
      box-shadow: var(--shadow-default);
      transform: translateY(-1px);
    }

    .task-card--pending {
      border-left-color: #f59e0b;
    }

    .task-card--approved {
      border-left-color: #10b981;
    }

    .task-card--rejected {
      border-left-color: #ef4444;
    }

    .task-card--cancelled {
      border-left-color: #6b7280;
    }

    .task-card__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .task-card__title-section {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .task-card__title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
      line-height: 1.3;
    }

    .priority-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .priority-low {
      background: color-mix(in srgb, #10b981 15%, var(--color-background-secondary));
      color: #10b981;
    }

    .priority-medium {
      background: color-mix(in srgb, #f59e0b 15%, var(--color-background-secondary));
      color: #f59e0b;
    }

    .priority-high {
      background: color-mix(in srgb, #ef4444 15%, var(--color-background-secondary));
      color: #ef4444;
    }

    .priority-urgent {
      background: color-mix(in srgb, #dc2626 15%, var(--color-background-secondary));
      color: #dc2626;
      font-weight: 600;
    }

    .task-card__status {
      padding: 0.375rem 1rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }

    .status-pending {
      background: color-mix(in srgb, #f59e0b 15%, var(--color-background-secondary));
      color: #92400e;
    }

    .status-approved {
      background: color-mix(in srgb, #10b981 15%, var(--color-background-secondary));
      color: #065f46;
    }

    .status-rejected {
      background: color-mix(in srgb, #ef4444 15%, var(--color-background-secondary));
      color: #991b1b;
    }

    .status-cancelled {
      background: var(--color-background-disabled);
      color: var(--color-text-secondary);
    }

    .task-card__content {
      margin-bottom: 1rem;
    }

    .task-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .task-info__item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .task-info__label {
      font-weight: 500;
      color: var(--color-text-secondary);
      min-width: 100px;
      font-size: 0.875rem;
    }

    .task-info__value {
      color: var(--color-text-primary);
      flex: 1;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .task-card__actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
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

    .btn-primary {
      background: var(--color-primary);
      color: var(--color-text-on-primary);
      box-shadow: 0 2px 4px color-mix(in srgb, var(--color-primary) 30%, transparent);
    }

    .btn-primary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-primary) 90%, black);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px color-mix(in srgb, var(--color-primary) 40%, transparent);
    }

    .btn-success {
      background: #10b981;
      color: white;
      box-shadow: 0 2px 4px color-mix(in srgb, #10b981 30%, transparent);
    }

    .btn-success:hover:not(:disabled) {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px color-mix(in srgb, #10b981 40%, transparent);
    }

    .btn-danger {
      background: #ef4444;
      color: white;
      box-shadow: 0 2px 4px color-mix(in srgb, #ef4444 30%, transparent);
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px color-mix(in srgb, #ef4444 40%, transparent);
    }

    .btn-secondary {
      background: var(--color-text-secondary);
      color: var(--color-text-on-primary);
    }

    .btn-secondary:hover:not(:disabled) {
      background: color-mix(in srgb, var(--color-text-secondary) 90%, black);
      transform: translateY(-1px);
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
    }

    /* ===== Responsive Design ===== */
    @media (max-width: 768px) {
      .task-request {
        padding: 1rem;
      }

      .task-request__header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
        padding: 1.5rem;
      }

      .header__actions {
        justify-content: stretch;
      }

      .btn {
        flex: 1;
        justify-content: center;
      }

      .task-request__stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .stat-card {
        padding: 1rem;
      }

      .stat-card__icon {
        width: 40px;
        height: 40px;
      }

      .stat-card__number {
        font-size: 1.5rem;
      }

      .task-request__tabs {
        flex-direction: column;
        gap: 0.25rem;
      }

      .task-card__header {
        flex-direction: column;
        gap: 0.75rem;
      }

      .task-card__title-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .task-card__actions {
        flex-direction: column;
      }

      .notification-banner {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }

    @media (max-width: 480px) {
      .task-request__stats {
        grid-template-columns: 1fr;
      }

      .task-info__item {
        flex-direction: column;
        gap: 0.25rem;
      }

      .task-info__label {
        min-width: auto;
      }
    }
  `]
})
export class TaskRequestListComponent implements OnInit {
  private taskRequestService = inject(TaskRequestService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  activeTab: 'assigned' | 'created' = 'assigned';
  showCreateModal = false;
  isLoading = false;
  
  assignedTasks: TaskRequest[] = [];
  createdTasks: TaskRequest[] = [];
  statistics = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  };

  get hasApprovedTasks(): boolean {
    return this.assignedTasks.some(task => task.status === 'APPROVED');
  }

  get approvedTasksCount(): number {
    return this.assignedTasks.filter(task => task.status === 'APPROVED').length;
  }

  get currentTasks(): TaskRequest[] {
    return this.activeTab === 'assigned' ? this.assignedTasks : this.createdTasks;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    // Load assigned tasks
    this.taskRequestService.getMyTaskRequests().subscribe({
      next: (tasks) => {
        this.assignedTasks = tasks;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading assigned tasks:', error);
        this.isLoading = false;
      }
    });

    // Load created tasks
    this.taskRequestService.getMyCreatedTaskRequests().subscribe({
      next: (tasks) => {
        this.createdTasks = tasks;
      },
      error: (error) => {
        console.error('Error loading created tasks:', error);
      }
    });

    // Load statistics
    this.taskRequestService.getTaskRequestStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  onTaskRequestCreated(): void {
    this.showCreateModal = false;
    this.loadData();
  }

  approveTask(task: TaskRequest): void {
    if (confirm('Bạn có chắc chắn muốn phê duyệt yêu cầu giao việc này?')) {
      this.taskRequestService.approveTaskRequest({
        taskRequestId: task.id,
        notes: 'Đã phê duyệt'
      }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Thành công', 'Đã phê duyệt yêu cầu giao việc');
          this.loadData();
        },
        error: (error) => {
          console.error('Error approving task:', error);
          this.notificationService.showError('Lỗi', 'Có lỗi xảy ra khi phê duyệt. Vui lòng thử lại.');
        }
      });
    }
  }

  rejectTask(task: TaskRequest): void {
    const reason = prompt('Lý do từ chối:');
    if (reason) {
      this.taskRequestService.rejectTaskRequest({
        taskRequestId: task.id,
        rejectionReason: reason
      }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Thành công', 'Đã từ chối yêu cầu giao việc');
          this.loadData();
        },
        error: (error) => {
          console.error('Error rejecting task:', error);
          this.notificationService.showError('Lỗi', 'Có lỗi xảy ra khi từ chối. Vui lòng thử lại.');
        }
      });
    }
  }

  cancelTask(task: TaskRequest): void {
    if (confirm('Bạn có chắc chắn muốn hủy yêu cầu giao việc này?')) {
      this.taskRequestService.cancelTaskRequest(task.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Thành công', 'Đã hủy yêu cầu giao việc');
          this.loadData();
        },
        error: (error) => {
          console.error('Error cancelling task:', error);
          this.notificationService.showError('Lỗi', 'Có lỗi xảy ra khi hủy. Vui lòng thử lại.');
        }
      });
    }
  }

  createDocumentFromTask(task: TaskRequest): void {
    this.router.navigate(['/document-creation', task.id]);
  }

  createDocumentFromFirstApprovedTask(): void {
    const firstApprovedTask = this.assignedTasks.find(task => task.status === 'APPROVED');
    if (firstApprovedTask) {
      this.createDocumentFromTask(firstApprovedTask);
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Chờ xử lý',
      'APPROVED': 'Đã phê duyệt',
      'REJECTED': 'Đã từ chối',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'LOW': 'Thấp',
      'MEDIUM': 'Trung bình',
      'HIGH': 'Cao',
      'URGENT': 'Khẩn cấp'
    };
    return priorityMap[priority] || priority;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
