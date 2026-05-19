import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import type { ModuleRoute } from '@/core/router/types';
import { EmailPage } from '../ui/pages/EmailPage';
import { EMAIL_SYMBOLS } from './symbols';
import type { IEmailRepository } from '../infrastructure/api/EmailRepository';
import { EmailRepository } from '../infrastructure/api/EmailRepository';

export function createEmailModule(container: Container): AppModule {
  const routes: ModuleRoute[] = [
    {
      path: '/apps/email/*',
      component: EmailPage,
      layout: 'app',
      layoutBehavior: 'fixed-height',
      module: 'email',
    },
  ];

  return {
    name: 'email',
    routes,
    registerBindings: () => {
      container
        .bind<IEmailRepository>(EMAIL_SYMBOLS.IEmailRepository)
        .to(EmailRepository)
        .inSingletonScope();
    },
  };
}
