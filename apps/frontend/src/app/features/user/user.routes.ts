import { Routes } from '@angular/router';
import { IncomingDocuments } from './incoming-documents/incoming-documents';
import { OutgoingDocuments } from './outgoing-documents/outgoing-documents';
import { AllDocuments } from './all-documents/all-documents';
import { WorkflowInstances } from './workflow/workflow-instances';

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
    path: 'workflow-instances',
    component: WorkflowInstances,
    title: 'Quy trình xử lý'
  },
  {
    path: '',
    redirectTo: 'all-documents',
    pathMatch: 'full'
  }
];
