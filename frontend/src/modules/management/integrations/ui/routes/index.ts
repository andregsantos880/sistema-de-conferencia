import type { ModuleRoute } from '@/core/router/types';
import { INTEGRATIONS_PATHS } from './paths';
import { lazy } from 'react';

const IntegrationsPage = lazy(() => import('../pages/IntegrationsPage'));
const IntegrationDetailPage = lazy(() => import('../pages/IntegrationDetailPage'));

export const INTEGRATIONS_ROUTES: ModuleRoute[] = [
  {
    path: INTEGRATIONS_PATHS.HOME,
    module: 'management-integrations',
    layout: 'app',
    titleKey: 'integrations:title',
    title: 'Apps',
    description: 'Manage internal and third-party integrations',
    component: IntegrationsPage,
  },
  {
    path: INTEGRATIONS_PATHS.DETAIL,
    module: 'management-integrations',
    layout: 'app',
    titleKey: 'integrations:detail.title',
    title: 'App Integration',
    description: 'Configure and manage an integration',
    component: IntegrationDetailPage,
  },
];

export { INTEGRATIONS_PATHS, getIntegrationDetailPath } from './paths';
