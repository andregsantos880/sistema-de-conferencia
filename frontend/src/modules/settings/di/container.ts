import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import { SETTINGS_ROUTES } from '../ui/routes';
import { SETTINGS_SYMBOLS } from './symbols';
import type { ISettingsRepository } from '../domain/ports/ISettingsRepository';
import { SettingsRepository } from '../infrastructure/repositories/SettingsRepository';

export function createSettingsModule(container: Container): AppModule {
  return {
    name: 'settings',
    routes: SETTINGS_ROUTES,
    registerBindings: () => {
      container
        .bind<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository)
        .to(SettingsRepository)
        .inSingletonScope();
    },
  };
}
