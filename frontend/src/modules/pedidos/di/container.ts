import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import PedidosPage from '../ui/pages/PedidosPage';

export function createPedidosModule(_c: Container): AppModule {
  return {
    name: 'pedidos',
    routes: [
      { path: '/app/pedidos', module: 'pedidos', layout: 'app', component: PedidosPage, title: 'Pedidos' },
    ],
  };
}
