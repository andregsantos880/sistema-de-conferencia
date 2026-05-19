import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import RelatoriosPage from '../ui/pages/RelatoriosPage';

export function createRelatoriosModule(_c: Container): AppModule {
  return {
    name: 'relatorios',
    routes: [
      { path: '/app/relatorios', module: 'relatorios', layout: 'app', component: RelatoriosPage, title: 'Relatórios' },
    ],
  };
}
