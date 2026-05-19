import { lazy } from 'react';
import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import type { ModuleRoute } from '@/core/router/types';
import { PROJECTS_DASHBOARD_PATHS } from '../ui/routes';
import { PROJECTS_SYMBOLS } from './symbols';
import type { IProjectsAnalyticsRepository } from '../domain/ports/IProjectsAnalyticsRepository';
import { ProjectsAnalyticsRepository } from '../infrastructure/repositories/ProjectsAnalyticsRepository';

// Lazy load the dashboard page for better initial bundle size
const ProjectsDashboardPage = lazy(
  () => import('../ui/pages/ProjectsDashboardPage')
);

const PROJECTS_DASHBOARD_ROUTES: ModuleRoute[] = [
  {
    path: PROJECTS_DASHBOARD_PATHS.ROOT,
    component: ProjectsDashboardPage,
    layout: 'app',
    module: 'dashboards',
  },
];

export function createProjectsDashboardModule(container: Container): AppModule {
  const registerBindings = () => {
    container
      .bind<IProjectsAnalyticsRepository>(PROJECTS_SYMBOLS.IProjectsAnalyticsRepository)
      .to(ProjectsAnalyticsRepository)
      .inSingletonScope();
  };

  return {
    name: 'projects',
    routes: PROJECTS_DASHBOARD_ROUTES,
    registerBindings,
  };
}
