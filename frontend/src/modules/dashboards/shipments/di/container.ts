import { lazy } from 'react';
import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import type { ModuleRoute } from '@/core/router/types';

// Lazy load the dashboard page for better initial bundle size
const ShipmentsDashboardPage = lazy(
  () => import('../ui/pages/ShipmentsDashboardPage')
);

const SHIPMENTS_ROUTES: ModuleRoute[] = [
  {
    path: '/dashboards/shipments',
    component: ShipmentsDashboardPage,
    layout: 'app',
    module: 'dashboards',
    // layoutBehavior: 'fixed-height'
  },
];

/**
 * Create and configure the Shipments module
 */
export function createShipmentsModule(_container: Container): AppModule {
  return {
    name: 'shipments',
   routes: SHIPMENTS_ROUTES,
    registerBindings: () => {
      // No repository bindings needed yet since we're using MSW directly
      // Future: Register shipments repository here when implementing real API
    },
  };
}
