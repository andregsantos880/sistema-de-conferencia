import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import HistoricoPage from '../ui/pages/HistoricoPage';

export function createHistoricoModule(_c: Container): AppModule {
  return {
    name: 'historico',
    routes: [
      { path: '/app/historico', module: 'historico', layout: 'app', component: HistoricoPage, title: 'Histórico' },
    ],
  };
}
