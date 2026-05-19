import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import { SHOWCASE_ROUTES } from '../ui/routes';

export function createShowcaseModule(_container: Container): AppModule {
  return {
    name: 'showcase',
    routes: SHOWCASE_ROUTES,
  };
}
