import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import type { IIntegrationsRepository } from '../domain/ports/IIntegrationsRepository';
import { HttpIntegrationsRepository } from '../infrastructure/repositories/HttpIntegrationsRepository';
import { INTEGRATIONS_SYMBOLS } from './symbols';
import { INTEGRATIONS_ROUTES } from '../ui/routes';

export function createIntegrationsModule(parent: Container): AppModule {
  const registerBindings = () => {
    parent
      .bind<IIntegrationsRepository>(INTEGRATIONS_SYMBOLS.IIntegrationsRepository)
      .to(HttpIntegrationsRepository)
      .inSingletonScope();
  };

  return {
    name: 'management-integrations',
    routes: INTEGRATIONS_ROUTES,
    registerBindings,
  };
}
