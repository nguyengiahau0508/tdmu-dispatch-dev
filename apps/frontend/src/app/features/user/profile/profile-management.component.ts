import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { ProfileActivitiesComponent } from './profile-activities.component';
import { ProfileStatsComponent } from './profile-stats.component';

@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [CommonModule, ProfileComponent, ProfileActivitiesComponent, ProfileStatsComponent],
  template: `
    <div class="profile-management">
      <div class="profile-management__header">
        <div class="header__content">
          <h1 class="header__title">Quản lý Profile</h1>
          <p class="header__subtitle">Quản lý thông tin cá nhân, xem lịch sử hoạt động và thống kê</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="profile-management__tabs">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'profile'"
          (click)="setActiveTab('profile')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Thông tin cá nhân</span>
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'activities'"
          (click)="setActiveTab('activities')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
          </svg>
          <span>Lịch sử hoạt động</span>
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'stats'"
          (click)="setActiveTab('stats')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"></path>
          </svg>
          <span>Thống kê</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="profile-management__content">
        <div *ngIf="activeTab === 'profile'" class="tab-pane">
          <app-profile></app-profile>
        </div>
        
        <div *ngIf="activeTab === 'activities'" class="tab-pane">
          <app-profile-activities></app-profile-activities>
        </div>
        
        <div *ngIf="activeTab === 'stats'" class="tab-pane">
          <app-profile-stats></app-profile-stats>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Container ===== */
    .profile-management {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* ===== Header ===== */
    .profile-management__header {
      text-align: center;
      margin-bottom: 3rem;
      background: var(--color-background-primary);
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
    }

    .header__content {
      max-width: 600px;
      margin: 0 auto;
    }

    .header__title {
      color: var(--color-text-primary);
      margin: 0 0 1rem 0;
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1.2;
      background: linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 70%, black) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header__subtitle {
      color: var(--color-text-secondary);
      font-size: 1.1rem;
      line-height: 1.5;
      margin: 0;
    }

    /* ===== Tabs ===== */
    .profile-management__tabs {
      display: flex;
      justify-content: center;
      margin-bottom: 3rem;
      background: var(--color-background-primary);
      border-radius: 16px;
      padding: 0.5rem;
      box-shadow: var(--shadow-default);
      border: 1px solid var(--color-border);
      gap: 0.5rem;
    }

    .tab-btn {
      background: none;
      border: none;
      padding: 1rem 2rem;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      border-radius: 12px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 180px;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .tab-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 80%, black) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 0;
    }

    .tab-btn:hover::before {
      opacity: 0.1;
    }

    .tab-btn > * {
      position: relative;
      z-index: 1;
    }

    .tab-btn:hover {
      color: var(--color-text-primary);
      transform: translateY(-1px);
    }

    .tab-btn.active {
      background: linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 80%, black) 100%);
      color: var(--color-text-on-primary);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 40%, transparent);
      transform: translateY(-2px);
    }

    .tab-btn.active::before {
      opacity: 0;
    }

    .tab-btn svg {
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .tab-btn:hover svg {
      transform: scale(1.1);
    }

    .tab-btn.active svg {
      transform: scale(1.1);
    }

    .tab-btn span {
      font-weight: 600;
      white-space: nowrap;
    }

    /* ===== Content ===== */
    .profile-management__content {
      min-height: 600px;
    }

    .tab-pane {
      animation: fadeInUp 0.4s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ===== Responsive Design ===== */
    @media (max-width: 768px) {
      .profile-management {
        padding: 1rem;
      }

      .profile-management__header {
        padding: 2rem 1.5rem;
        margin-bottom: 2rem;
      }

      .header__title {
        font-size: 2rem;
      }

      .header__subtitle {
        font-size: 1rem;
      }
      
      .profile-management__tabs {
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.75rem;
        margin-bottom: 2rem;
      }
      
      .tab-btn {
        margin: 0;
        min-width: auto;
        justify-content: flex-start;
        padding: 1rem 1.5rem;
      }
      
      .tab-btn.active {
        background: linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 80%, black) 100%);
        color: var(--color-text-on-primary);
        transform: translateY(-1px);
      }
    }

    @media (max-width: 480px) {
      .profile-management {
        padding: 0.5rem;
      }

      .profile-management__header {
        padding: 1.5rem 1rem;
      }

      .header__title {
        font-size: 1.75rem;
      }

      .profile-management__tabs {
        padding: 0.5rem;
      }

      .tab-btn {
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
      }

      .tab-btn span {
        font-size: 0.85rem;
      }
    }
  `]
})
export class ProfileManagementComponent {
  activeTab: 'profile' | 'activities' | 'stats' = 'profile';

  setActiveTab(tab: 'profile' | 'activities' | 'stats') {
    this.activeTab = tab;
  }
}
