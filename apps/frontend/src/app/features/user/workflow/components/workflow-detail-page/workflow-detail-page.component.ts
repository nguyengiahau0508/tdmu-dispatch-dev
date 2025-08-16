import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowInstanceDetailComponent } from '../workflow-instance-detail/workflow-instance-detail';
import { WorkflowBreadcrumbComponent } from '../workflow-breadcrumb/workflow-breadcrumb.component';

@Component({
  selector: 'app-workflow-detail-page',
  standalone: true,
  imports: [CommonModule, WorkflowInstanceDetailComponent, WorkflowBreadcrumbComponent],
  template: `
    <div class="workflow-detail-page">
      <app-workflow-breadcrumb></app-workflow-breadcrumb>
      
      <div class="page-content">
        <div class="page-header">
          <h2>Chi tiết Workflow</h2>
          <p>Xem thông tin chi tiết và lịch sử workflow</p>
        </div>
        
        <div class="detail-container">
          <app-workflow-instance-detail></app-workflow-instance-detail>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .workflow-detail-page {
      min-height: 100vh;
      background: #f8fafc;
    }

    .page-content {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .page-header h2 {
      margin: 0 0 8px 0;
      font-size: 1.875rem;
      font-weight: 600;
      color: #1f2937;
    }

    .page-header p {
      margin: 0;
      color: #6b7280;
      font-size: 1rem;
    }

    .detail-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .page-content {
        padding: 16px;
      }

      .page-header h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class WorkflowDetailPageComponent {}
