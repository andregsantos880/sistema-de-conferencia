import { Container } from 'inversify';
import { SALES_SYMBOLS } from './symbols';
import type { ISalesAnalyticsRepository } from '../domain/repositories/ISalesAnalyticsRepository';
import { SalesAnalyticsRepository } from '../infrastructure/repositories/SalesAnalyticsRepository';
import { SALES_DASHBOARD_ROUTES } from '../ui/routes';
import type { AppModule } from '@/core/di/module-loader';

export function createSalesDashboardModule(container: Container): AppModule {
  const registerBindings = () => {
    // Bind repositories
    container
      .bind<ISalesAnalyticsRepository>(SALES_SYMBOLS.ISalesAnalyticsRepository)
      .to(SalesAnalyticsRepository)
      .inSingletonScope();
  };

  return {
    name: 'sales',
    routes: SALES_DASHBOARD_ROUTES,
    registerBindings,
  };
}
