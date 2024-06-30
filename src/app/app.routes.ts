import { VexRoutes } from '@vex/interfaces/vex-route.interface';
import { LayoutComponent } from './layouts/layout/layout.component';
import { AuthGuard } from './pages/pages/auth/login/auth.guard';

export const appRoutes: VexRoutes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/pages/auth/login/login.component').then(
        (m) => m.LoginComponent
      )
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/pages/auth/register/register.component').then(
        (m) => m.RegisterComponent
      )
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/pages/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      )
  },
  {
    path: 'coming-soon',
    loadComponent: () =>
      import('./pages/pages/coming-soon/coming-soon.component').then(
        (m) => m.ComingSoonComponent
      )
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard], // Protege todas as rotas dentro de LayoutComponent
    children: [
      {
        path: 'dashboards/analytics',
        loadComponent: () =>
          import('./pages/dashboards/dashboard-analytics/dashboard-analytics.component').then(
            (m) => m.DashboardAnalyticsComponent
          )
      },
      {
        path: 'apps',
        children: [
          {
            path: 'puzzle-block',
            loadComponent: () =>
              import('./pages/apps/puzzle-block/puzzle-block.component').then(
                (m) => m.PuzzleBlockComponent
              ),
            data: {
              toolbarShadowEnabled: false
            }
          },
          {
            path: 'notes',
            loadComponent: () =>
              import('./pages/apps/note/note.component').then(
                (m) => m.NoteComponent
              ),
            data: {
              toolbarShadowEnabled: false
            }
          },
          // adicione outras rotas de aplicativos aqui
        ]
      },
      {
        path: 'pages',
        children: [
          {
            path: 'pricing',
            loadComponent: () =>
              import('./pages/pages/pricing/pricing.component').then(
                (m) => m.PricingComponent
              )
          },
          {
            path: 'faq',
            loadComponent: () =>
              import('./pages/pages/faq/faq.component').then(
                (m) => m.FaqComponent
              )
          },
          {
            path: 'invoice',
            loadComponent: () =>
              import('./pages/pages/invoice/invoice.component').then(
                (m) => m.InvoiceComponent
              )
          },
          {
            path: 'error-404',
            loadComponent: () =>
              import('./pages/pages/errors/error-404/error-404.component').then(
                (m) => m.Error404Component
              )
          },
          {
            path: 'error-500',
            loadComponent: () =>
              import('./pages/pages/errors/error-500/error-500.component').then(
                (m) => m.Error500Component
              )
          }
        ]
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/pages/errors/error-404/error-404.component').then(
            (m) => m.Error404Component
          )
      }
    ]
  }
];
