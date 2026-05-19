import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import type { ModuleRoute } from '@/core/router/types';
import { INBOX_PATHS } from '../ui/routes';
import { InboxPage } from '../ui/pages/InboxPage';
import { PreferencesPage } from '../ui/pages/PreferencesPage';
import { INBOX_SYMBOLS } from './symbols';
import type { IInboxRepository } from '../infrastructure/repositories/InboxRepository';
import { InboxRepository } from '../infrastructure/repositories/InboxRepository';

export function createInboxModule(container: Container): AppModule {
  const routes: ModuleRoute[] = [
    {
      path: INBOX_PATHS.ROOT,
      component: InboxPage,
      layout: 'app',
      layoutBehavior: 'fixed-height',
      module: 'inbox',
    },
    {
      path: INBOX_PATHS.PREFERENCES,
      component: PreferencesPage,
      layout: 'app',
      module: 'inbox',
    },
  ];

  return {
    name: 'inbox',
    routes,
    registerBindings: () => {
      container
        .bind<IInboxRepository>(INBOX_SYMBOLS.IInboxRepository)
        .to(InboxRepository)
        .inSingletonScope();
    },
  };
}
