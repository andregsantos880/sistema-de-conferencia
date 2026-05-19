import { lazy } from 'react';
import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import type { ModuleRoute } from '@/core/router/types';
import { EXECUTIVE_DASHBOARD_PATHS } from '../ui/routes';
import { EXECUTIVE_SYMBOLS } from './symbols';
import type { IExecutiveAnalyticsRepository } from '../domain/repositories/IExecutiveAnalyticsRepository';
import { ExecutiveAnalyticsRepository } from '../infrastructure/repositories/ExecutiveAnalyticsRepository';

// Lazy load the dashboard page for better initial bundle size
const ExecutiveDashboardPage = lazy(
  () => import('../ui/pages/ExecutiveDashboardPage')
);

const EXECUTIVE_DASHBOARD_ROUTES: ModuleRoute[] = [
  {
    path: EXECUTIVE_DASHBOARD_PATHS.ROOT,
    component: ExecutiveDashboardPage,
    layout: 'app',
    module: 'dashboards',
  },
];

export function createExecutiveDashboardModule(container: Container): AppModule {
  const registerBindings = () => {
    container
      .bind<IExecutiveAnalyticsRepository>(EXECUTIVE_SYMBOLS.IExecutiveAnalyticsRepository)
      .to(ExecutiveAnalyticsRepository)
      .inSingletonScope();
  };

  return {
    name: 'executive',
    routes: EXECUTIVE_DASHBOARD_ROUTES,
    registerBindings,
  };
}
