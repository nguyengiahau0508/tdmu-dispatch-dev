import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowActionComponent } from '../workflow-action/workflow-action.component';
import { WorkflowBreadcrumbComponent } from '../workflow-breadcrumb/workflow-breadcrumb.component';

@Component({
  selector: 'app-workflow-process-page',
  standalone: true,
  imports: [CommonModule, WorkflowActionComponent, WorkflowBreadcrumbComponent],
  template: `
    <div class="workflow-process-page">
      <app-workflow-breadcrumb></app-workflow-breadcrumb>
      
      <div class="page-content">
        <div class="page-header">
          <h2>Xử lý Workflow</h2>
          <p>Thực hiện hành động trên workflow hiện tại</p>
        </div>
        
        <div class="action-container">
          <app-workflow-action></app-workflow-action>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .workflow-process-page {
      min-height: 100vh;
      background: #f8fafc;
    }

    .page-content {
      padding: 24px;
      max-width: 800px;
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

    .action-container {
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
export class WorkflowProcessPageComponent {}
