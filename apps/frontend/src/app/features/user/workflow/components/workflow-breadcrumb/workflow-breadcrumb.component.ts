import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { WorkflowNavigationService } from '../../services/workflow-navigation.service';
import { WorkflowInstancesService } from '../../services/workflow-instances.service';

interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
}

@Component({
  selector: 'app-workflow-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        @for (item of breadcrumbs; track item.url) {
          <li class="breadcrumb-item">
            @if (item.active) {
              <span class="breadcrumb-current">{{ item.label }}</span>
            } @else {
              <a [routerLink]="item.url" class="breadcrumb-link">{{ item.label }}</a>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-nav {
      padding: 12px 0;
      background: #f8fafc;
      border-bottom: 1px solid #e5e7eb;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0 24px;
      font-size: 0.875rem;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
    }

    .breadcrumb-item:not(:last-child)::after {
      content: '/';
      margin: 0 8px;
      color: #9ca3af;
    }

    .breadcrumb-link {
      color: #3b82f6;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .breadcrumb-link:hover {
      color: #2563eb;
      text-decoration: underline;
    }

    .breadcrumb-current {
      color: #6b7280;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .breadcrumb-list {
        padding: 0 16px;
        font-size: 0.8rem;
      }

      .breadcrumb-item:not(:last-child)::after {
        margin: 0 6px;
      }
    }
  `]
})
export class WorkflowBreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItem[] = [];
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navigationService: WorkflowNavigationService,
    private workflowService: WorkflowInstancesService
  ) {}

  ngOnInit(): void {
    this.updateBreadcrumbs();
    
    // Subscribe to route changes
    this.subscription.add(
      this.router.events.subscribe(() => {
        this.updateBreadcrumbs();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateBreadcrumbs(): void {
    const url = this.router.url;
    const breadcrumbs: BreadcrumbItem[] = [];

    // Home
    breadcrumbs.push({
      label: 'Trang chủ',
      url: '/',
      active: false
    });

    // Workflow section
    if (url.startsWith('/workflow')) {
      breadcrumbs.push({
        label: 'Quy trình xử lý',
        url: '/workflow',
        active: url === '/workflow'
      });

      // Specific workflow pages
      if (url.includes('/dashboard')) {
        breadcrumbs.push({
          label: 'Dashboard',
          url: '/workflow/dashboard',
          active: true
        });
      } else if (url.includes('/pending')) {
        breadcrumbs.push({
          label: 'Văn bản cần xử lý',
          url: '/workflow/pending',
          active: true
        });
      } else if (url.includes('/notifications')) {
        breadcrumbs.push({
          label: 'Thông báo',
          url: '/workflow/notifications',
          active: true
        });
      } else if (url.match(/\/workflow\/\d+/)) {
        // Workflow detail page
        const workflowId = this.navigationService.getCurrentWorkflowId();
        if (workflowId) {
          breadcrumbs.push({
            label: `Workflow #${workflowId}`,
            url: `/workflow/${workflowId}`,
            active: !url.includes('/process') && !url.includes('/details')
          });

          if (url.includes('/process')) {
            breadcrumbs.push({
              label: 'Xử lý',
              url: `/workflow/${workflowId}/process`,
              active: true
            });
          } else if (url.includes('/details')) {
            breadcrumbs.push({
              label: 'Chi tiết',
              url: `/workflow/${workflowId}/details`,
              active: true
            });
          }
        }
      }
    }

    this.breadcrumbs = breadcrumbs;
  }
}
