/**
 * Invoicing Module DI Container
 * 
 * Creates and configures the Invoicing module with routes and bindings.
 */

import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import type { ModuleRoute } from '@/core/router/types';
import { INVOICING_PATHS } from '../ui/routes';
import { InvoiceListPage } from '../ui/pages/InvoiceListPage';
import { InvoiceDetailPage } from '../ui/pages/InvoiceDetailPage';
import { InvoiceFormPage } from '../ui/pages/InvoiceFormPage';
import { INVOICING_SYMBOLS } from './symbols';
import type { IInvoiceRepository } from '../infrastructure/repositories/InvoiceRepository';
import { InvoiceRepository } from '../infrastructure/repositories/InvoiceRepository';

export function createInvoicingModule(container: Container): AppModule {
  const routes: ModuleRoute[] = [
    {
      path: INVOICING_PATHS.ROOT,
      component: InvoiceListPage,
      layout: 'app',
      module: 'invoicing',
    },
    {
      path: INVOICING_PATHS.NEW,
      component: InvoiceFormPage,
      layout: 'app',
      module: 'invoicing',
    },
    {
      path: `${INVOICING_PATHS.ROOT}/:id`,
      component: InvoiceDetailPage,
      layout: 'app',
      module: 'invoicing',
    },
    {
      path: `${INVOICING_PATHS.ROOT}/:id/edit`,
      component: InvoiceFormPage,
      layout: 'app',
      module: 'invoicing',
    },
  ];

  return {
    name: 'invoicing',
    routes,
    registerBindings: () => {
      container
        .bind<IInvoiceRepository>(INVOICING_SYMBOLS.IInvoiceRepository)
        .to(InvoiceRepository)
        .inSingletonScope();
    },
  };
}
