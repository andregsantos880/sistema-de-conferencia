import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import ConferenciaPage from '../ui/pages/ConferenciaPage';

export function createConferenciaModule(_c: Container): AppModule {
  return {
    name: 'conferencia',
    routes: [
      { path: '/app/conferencia', module: 'conferencia', layout: 'app', component: ConferenciaPage, title: 'Conferência' },
    ],
  };
}
