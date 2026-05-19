import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import type { IUsersRepository } from '../domain/ports/IUsersRepository';
import { HttpUsersRepository } from '../infrastructure/repositories/HttpUsersRepository';
import { USERS_SYMBOLS } from './symbols';
import { USERS_ROUTES } from '../ui/routes';

export function createUsersModule(parent: Container): AppModule {
  const registerBindings = () => {
    parent
      .bind<IUsersRepository>(USERS_SYMBOLS.IUsersRepository)
      .to(HttpUsersRepository)
      .inSingletonScope();
  };

  return {
    name: 'management-users',
    routes: USERS_ROUTES,
    registerBindings,
  };
}
