import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import AssinaturaPage from '../ui/pages/AssinaturaPage';
import FaturasPage from '../ui/pages/FaturasPage';

export function createBillingModule(_c: Container): AppModule {
  return {
    name: 'billing',
    routes: [
      { path: '/app/assinatura', module: 'billing', layout: 'app', component: AssinaturaPage, title: 'Assinatura' },
      { path: '/app/faturas', module: 'billing', layout: 'app', component: FaturasPage, title: 'Faturas' },
    ],
  };
}
