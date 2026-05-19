import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import LandingPage from '../ui/pages/LandingPage';
import PrecosPage from '../ui/pages/PrecosPage';
import LoginPage from '../ui/pages/LoginPage';
import SignupPage from '../ui/pages/SignupPage';

export function createPublicModule(_container: Container): AppModule {
  return {
    name: 'public',
    routes: [
      { path: '/', module: 'public', layout: 'none', component: LandingPage, title: 'SisConf' },
      { path: '/precos', module: 'public', layout: 'none', component: PrecosPage, title: 'Planos' },
      { path: '/login', module: 'public', layout: 'none', component: LoginPage, title: 'Entrar' },
      { path: '/cadastro', module: 'public', layout: 'none', component: SignupPage, title: 'Criar conta' },
    ],
  };
}
