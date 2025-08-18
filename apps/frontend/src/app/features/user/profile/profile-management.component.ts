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
    <div class="profile-management-container">
      <div class="profile-header">
        <h1>Quản lý Profile</h1>
        <p>Quản lý thông tin cá nhân, xem lịch sử hoạt động và thống kê</p>
      </div>

      <!-- Navigation Tabs -->
      <div class="nav-tabs">
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'profile'"
          (click)="setActiveTab('profile')"
        >
          <img src="/icons/account_circle.svg" alt="Profile">
          <span>Thông tin cá nhân</span>
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'activities'"
          (click)="setActiveTab('activities')"
        >
          <img src="/icons/history.svg" alt="Activities">
          <span>Lịch sử hoạt động</span>
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'stats'"
          (click)="setActiveTab('stats')"
        >
          <img src="/icons/analytics.svg" alt="Stats">
          <span>Thống kê</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
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
    .profile-management-container {
      margin: 0 auto;
      padding: 24px;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .profile-header h1 {
      color: var(--color-text-primary);
      margin-bottom: 8px;
      font-size: 1.75rem;
      font-weight: 600;
    }

    .profile-header p {
      color: var(--color-text-secondary);
      font-size: 1rem;
    }

    .nav-tabs {
      display: flex;
      justify-content: center;
      margin-bottom: 32px;
      border-bottom: 1px solid var(--color-border);
      background-color: var(--color-background-primary);
      border-radius: 8px;
      padding: 4px;
      box-shadow: var(--shadow-default);
    }

    .nav-tab {
      background: none;
      border: none;
      padding: 12px 20px;
      margin: 0 2px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-secondary);
      border-radius: 6px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 140px;
      justify-content: center;
    }

    .nav-tab:hover {
      color: var(--color-primary);
      background-color: var(--color-background-secondary);
    }

    .nav-tab.active {
      color: var(--color-primary);
      background-color: color-mix(in srgb, var(--color-primary) 10%, var(--color-background-secondary));
      box-shadow: var(--shadow-default);
    }

    .nav-tab img {
      width: 18px;
      height: 18px;
      object-fit: contain;
      filter: brightness(0) saturate(100%) invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
      transition: filter 0.2s ease;
    }

    .nav-tab:hover img,
    .nav-tab.active img {
      filter: brightness(0) saturate(100%) invert(27%) sepia(87%) saturate(5091%) hue-rotate(202deg) brightness(94%) contrast(101%);
    }

    .nav-tab span {
      font-weight: 500;
    }

    .tab-content {
      min-height: 500px;
    }

    .tab-pane {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .profile-management-container {
        padding: 16px;
      }
      
      .nav-tabs {
        flex-direction: column;
        gap: 4px;
        padding: 8px;
      }
      
      .nav-tab {
        margin: 0;
        min-width: auto;
        justify-content: flex-start;
      }
      
      .nav-tab.active {
        background-color: var(--color-primary);
        color: var(--color-text-on-primary);
      }
      
      .nav-tab.active img {
        filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
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
