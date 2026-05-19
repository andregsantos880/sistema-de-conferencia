import type { ModuleRoute } from '@/core/router/types';
import { ECOMMERCE_DASHBOARD_PATHS } from './paths';
import { lazy } from 'react';

const EcommerceDashboardPage = lazy(
  () => import('@/modules/dashboards/ecommerce/ui/pages/EcommerceDashboardPage')
);

export const ECOMMERCE_DASHBOARD_ROUTES: ModuleRoute[] = [
  {
    path: ECOMMERCE_DASHBOARD_PATHS.ROOT,
    component: EcommerceDashboardPage,
    layout: 'app',
    module: 'dashboards',
  },
];
