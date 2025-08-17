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
          <i class="fas fa-user"></i>
          Thông tin cá nhân
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'activities'"
          (click)="setActiveTab('activities')"
        >
          <i class="fas fa-history"></i>
          Lịch sử hoạt động
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'stats'"
          (click)="setActiveTab('stats')"
        >
          <i class="fas fa-chart-bar"></i>
          Thống kê
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
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .profile-header h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 28px;
    }

    .profile-header p {
      color: #666;
      font-size: 16px;
    }

    .nav-tabs {
      display: flex;
      justify-content: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #f0f0f0;
    }

    .nav-tab {
      background: none;
      border: none;
      padding: 15px 25px;
      margin: 0 5px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
      color: #666;
      border-bottom: 3px solid transparent;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-tab:hover {
      color: #007bff;
      background-color: #f8f9fa;
    }

    .nav-tab.active {
      color: #007bff;
      border-bottom-color: #007bff;
      background-color: #f8f9fa;
    }

    .nav-tab i {
      font-size: 14px;
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
      .nav-tabs {
        flex-direction: column;
        gap: 5px;
      }
      
      .nav-tab {
        margin: 0;
        border-radius: 4px;
        border-bottom: none;
      }
      
      .nav-tab.active {
        border-bottom: none;
        background-color: #007bff;
        color: white;
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
