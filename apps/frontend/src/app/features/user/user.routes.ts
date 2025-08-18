import { Routes } from '@angular/router';
import { IncomingDocuments } from './incoming-documents/incoming-documents';
import { OutgoingDocuments } from './outgoing-documents/outgoing-documents';
import { AllDocuments } from './all-documents/all-documents';
import { WORKFLOW_ROUTES } from './workflow/workflow.routes';
import { DocumentProcessingComponent } from './document-processing/document-processing.component';
import { TaskManagementComponent } from './task-assignment/task-management.component';
import { TaskRequestListComponent } from './task-request/task-request-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DocumentCreationComponent } from './document-creation/document-creation.component';
import { ProfileManagementComponent } from './profile/profile-management.component';
import { WorkflowDetailComponent } from './workflow/workflow-detail/workflow-detail.component';

export const USER_ROUTES: Routes = [
  {
    path: 'all-documents',
    component: AllDocuments,
    title: 'Tất cả công văn'
  },
  {
    path: 'incoming-documents',
    component: IncomingDocuments,
    title: 'Công văn đến'
  },
  {
    path: 'outgoing-documents',
    component: OutgoingDocuments,
    title: 'Công văn đi'
  },
  {
    path: 'workflow',
    children: WORKFLOW_ROUTES,
    title: 'Quy trình xử lý'
  },
  {
    path: 'document-processing',
    component: DocumentProcessingComponent,
    title: 'Xử lý văn bản'
  },
  {
    path: 'task-management',
    component: TaskRequestListComponent,
    title: 'Quản lý công việc'
  },
  {
    path: 'document-creation/:taskId',
    component: DocumentCreationComponent,
    title: 'Tạo văn bản từ công việc'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Bảng điều khiển'
  },
  {
    path: 'profile',
    component: ProfileManagementComponent,
    title: 'Quản lý Profile'
  },
  {
    path: 'workflow-detail/:documentId',
    component: WorkflowDetailComponent,
    title: 'Chi tiết quy trình'
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
