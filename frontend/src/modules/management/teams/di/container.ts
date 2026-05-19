import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import type { ITeamsRepository } from '../domain/ports/ITeamsRepository';
import { HttpTeamsRepository } from '../infrastructure/repositories/HttpTeamsRepository';
import { TEAMS_SYMBOLS } from './symbols';
import { TEAMS_ROUTES } from '../ui/routes';

export function createTeamsModule(parent: Container): AppModule {
  const registerBindings = () => {
    parent
      .bind<ITeamsRepository>(TEAMS_SYMBOLS.ITeamsRepository)
      .to(HttpTeamsRepository)
      .inSingletonScope();
  };

  return {
    name: 'management-teams',
    routes: TEAMS_ROUTES,
    registerBindings,
  };
}
