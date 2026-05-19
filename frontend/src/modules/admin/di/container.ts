import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import UsuariosPage from '../ui/pages/UsuariosPage';
import RolesPage from '../ui/pages/RolesPage';
import GruposPage from '../ui/pages/GruposPage';

export function createAdminModule(_c: Container): AppModule {
  return {
    name: 'admin',
    routes: [
      { path: '/app/usuarios', module: 'admin', layout: 'app', component: UsuariosPage, title: 'Usuários' },
      { path: '/app/roles', module: 'admin', layout: 'app', component: RolesPage, title: 'Roles' },
      { path: '/app/grupos', module: 'admin', layout: 'app', component: GruposPage, title: 'Grupos' },
    ],
  };
}
