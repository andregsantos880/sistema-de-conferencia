import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import type { ModuleRoute } from '@/core/router/types';
import { KANBAN_PATHS } from '../ui/routes';
import { BoardListPage } from '../ui/pages/BoardListPage';
import { AlternativeBoardDetailPage } from '../ui/pages/AlternativeBoardDetailPage';
import { KANBAN_SYMBOLS } from './symbols';
import type { IKanbanRepository } from '../infrastructure/repositories/KanbanRepository';
import { KanbanRepository } from '../infrastructure/repositories/KanbanRepository';

export function createKanbanModule(container: Container): AppModule {
  const routes: ModuleRoute[] = [
    {
      path: KANBAN_PATHS.ROOT,
      component: BoardListPage,
      layout: 'app',
      module: 'kanban',
    },
    {
      path: `${KANBAN_PATHS.ROOT}/board/:boardId`,
      component: AlternativeBoardDetailPage,
      layout: 'app',
      layoutBehavior: 'fixed-height',
      module: 'kanban',
    },
  ];

  return {
    name: 'kanban',
    routes,
    registerBindings: () => {
      container
        .bind<IKanbanRepository>(KANBAN_SYMBOLS.IKanbanRepository)
        .to(KanbanRepository)
        .inSingletonScope();
    },
  };
}
