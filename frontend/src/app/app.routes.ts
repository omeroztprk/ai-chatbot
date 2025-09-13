import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { authRoutes } from './features/auth/auth.routes';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'auth',
    children: authRoutes,
  },
  { path: '**', redirectTo: '' }
];
