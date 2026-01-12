import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Landing page (público)
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(m => m.LandingComponent),
    canActivate: [guestGuard]
  },

  // Autenticación (solo para no autenticados)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/components/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/components/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Dashboard (requiere autenticación)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },

  // Torneos
  {
    path: 'tournaments',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/tournaments/components/tournament-list/tournament-list.component').then(m => m.TournamentListComponent)
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/tournaments/components/tournament-detail/tournament-detail.component').then(m => m.TournamentDetailComponent)
      }
    ]
  },

  // Gameplay - Preguntas diarias
  {
    path: 'play/:tournamentId',
    loadComponent: () =>
      import('./features/gameplay/gameplay.component').then(m => m.GameplayComponent),
    canActivate: [authGuard]
  },

  // Ranking
  {
    path: 'ranking/:tournamentId',
    loadComponent: () =>
      import('./features/ranking/ranking.component').then(m => m.RankingComponent),
    canActivate: [authGuard]
  },

  // Panel de administración
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'tournaments',
        loadComponent: () =>
          import('./features/admin/tournament-management/tournament-management.component').then(m => m.TournamentManagementComponent)
      },
      {
        path: 'questions',
        loadComponent: () =>
          import('./features/admin/question-import/question-import.component').then(m => m.QuestionImportComponent)
      },
      {
        path: 'daily-content/:tournamentId',
        loadComponent: () =>
          import('./features/admin/daily-content-management/daily-content-management.component').then(m => m.DailyContentManagementComponent)
      },
      {
        path: 'video-review',
        loadComponent: () =>
          import('./features/admin/video-review/video-review.component').then(m => m.VideoReviewComponent)
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('./features/admin/statistics/statistics.component').then(m => m.StatisticsComponent)
      }
    ]
  },

  // Página no encontrada
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
