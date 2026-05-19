import { Container } from 'inversify';
import { ECOMMERCE_SYMBOLS } from './symbols';
import type { IEcommerceAnalyticsRepository } from '../domain/repositories/IEcommerceAnalyticsRepository';
import { EcommerceAnalyticsRepository } from '../infrastructure/repositories/EcommerceAnalyticsRepository';
import { ECOMMERCE_DASHBOARD_ROUTES } from '../ui/routes';
import type { AppModule } from '@/core/di/module-loader';

export function createEcommerceDashboardModule(container: Container): AppModule {
  const registerBindings = () => {
    // Bind repositories
    container
      .bind<IEcommerceAnalyticsRepository>(ECOMMERCE_SYMBOLS.IEcommerceAnalyticsRepository)
      .to(EcommerceAnalyticsRepository)
      .inSingletonScope();
  };

  return {
    name: 'ecommerce',
    routes: ECOMMERCE_DASHBOARD_ROUTES,
    registerBindings,
  };
}
