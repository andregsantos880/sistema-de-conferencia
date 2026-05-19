import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import type { INotificationsRepository } from '../domain/ports/INotificationsRepository';
import { HttpNotificationsRepository } from '../infrastructure/repositories/HttpNotificationsRepository';
import { NOTIFICATIONS_SYMBOLS } from './symbols';
import { NOTIFICATIONS_ROUTES } from '../ui/routes';

export function createNotificationsModule(parent: Container): AppModule {
  const registerBindings = () => {
    parent
      .bind<INotificationsRepository>(NOTIFICATIONS_SYMBOLS.INotificationsRepository)
      .to(HttpNotificationsRepository)
      .inSingletonScope();
  };

  return {
    name: 'notifications',
    routes: NOTIFICATIONS_ROUTES,
    registerBindings,
  };
}
