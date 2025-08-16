import { Routes } from '@angular/router';
import { WorkflowOverviewComponent } from './components/workflow-overview/workflow-overview.component';
import { WorkflowDashboardComponent } from './components/workflow-dashboard/workflow-dashboard.component';
import { PendingDocumentsComponent } from './components/pending-documents/pending-documents.component';
import { WorkflowProcessPageComponent } from './components/workflow-process-page/workflow-process-page.component';
import { WorkflowDetailPageComponent } from './components/workflow-detail-page/workflow-detail-page.component';
import { WorkflowNotificationsComponent } from './components/workflow-notifications/workflow-notifications.component';

export const WORKFLOW_ROUTES: Routes = [
  {
    path: '',
    component: WorkflowOverviewComponent,
    title: 'Quản lý Quy trình Văn bản'
  },
  {
    path: 'dashboard',
    component: WorkflowDashboardComponent,
    title: 'Dashboard Quy trình'
  },
  {
    path: 'pending',
    component: PendingDocumentsComponent,
    title: 'Văn bản cần xử lý'
  },
  {
    path: ':id',
    component: WorkflowDetailPageComponent,
    title: 'Chi tiết Workflow'
  },
  {
    path: ':id/process',
    component: WorkflowProcessPageComponent,
    title: 'Xử lý Workflow'
  },
  {
    path: ':id/details',
    component: WorkflowDetailPageComponent,
    title: 'Chi tiết Workflow'
  },
  {
    path: 'notifications',
    component: WorkflowNotificationsComponent,
    title: 'Thông báo'
  }
];
