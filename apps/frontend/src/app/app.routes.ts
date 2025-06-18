import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { authRoutes } from './features/auth/auth.routes';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'auth', component: AuthLayout, children: authRoutes },
  {
    path: '', component: MainLayout, children: [

    ]
  },
  {
    path: 'admin', component: AdminLayout, canActivate: [AdminGuard], children: [

    ]
  }
];
