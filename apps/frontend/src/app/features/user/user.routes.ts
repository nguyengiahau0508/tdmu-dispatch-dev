import { Routes } from '@angular/router';
import { IncomingDocuments } from './incoming-documents/incoming-documents';
import { OutgoingDocuments } from './outgoing-documents/outgoing-documents';
import { AllDocuments } from './all-documents/all-documents';
import { WORKFLOW_ROUTES } from './workflow/workflow.routes';
import { DocumentProcessingComponent } from './document-processing/document-processing.component';

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
    path: '',
    redirectTo: 'workflow',
    pathMatch: 'full'
  }
];
