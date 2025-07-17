import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { authRoutes } from './features/auth/auth.routes';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { AdminGuard } from './core/guards/admin.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { Organizational } from './features/admin/organizational/organizational';
import { Users } from './features/admin/users/users';
import { organizationalRoutes } from './features/admin/organizational/organizational.routes';
import { DocumentCatalog } from './features/admin/document-catalog/document-catalog';
import { DocumentCategory } from './features/admin/document-catalog/document-category/document-category';
import {  documentCatalogRoutes } from './features/admin/document-catalog/document-catalog.routes';

export const routes: Routes = [
  { path: 'auth', component: AuthLayout, children: authRoutes },
  {
    path: '', component: MainLayout, canActivate: [AuthGuard], children: [

    ]
  },
  {
    path: 'admin', component: AdminLayout, canActivate: [AdminGuard], children: [
      { path: 'users', component: Users },
      { path: 'organizational', component: Organizational, children: organizationalRoutes },
      {path: 'document-catalog', component: DocumentCatalog, children: documentCatalogRoutes}
    ]
  }
];
