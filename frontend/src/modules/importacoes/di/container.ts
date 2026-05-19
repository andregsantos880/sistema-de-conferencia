import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import ImportacoesPage from '../ui/pages/ImportacoesPage';

export function createImportacoesModule(_c: Container): AppModule {
  return {
    name: 'importacoes',
    routes: [
      { path: '/app/importacoes', module: 'importacoes', layout: 'app', component: ImportacoesPage, title: 'Importações' },
    ],
  };
}
