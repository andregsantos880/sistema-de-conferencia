import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';

export function createSystemModule(_container: Container): AppModule {
  return { name: 'system', routes: [] };
}
