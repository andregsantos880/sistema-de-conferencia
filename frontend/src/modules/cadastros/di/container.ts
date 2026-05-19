import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import StatusPage from '../ui/pages/StatusPage';
import BoxesPage from '../ui/pages/BoxesPage';
import LayoutsPage from '../ui/pages/LayoutsPage';

export function createCadastrosModule(_c: Container): AppModule {
  return {
    name: 'cadastros',
    routes: [
      { path: '/app/status', module: 'cadastros', layout: 'app', component: StatusPage, title: 'Status' },
      { path: '/app/boxes', module: 'cadastros', layout: 'app', component: BoxesPage, title: 'Boxes' },
      { path: '/app/layouts', module: 'cadastros', layout: 'app', component: LayoutsPage, title: 'Layouts' },
    ],
  };
}
