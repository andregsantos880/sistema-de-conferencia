import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import type { ModuleRoute } from '@/core/router/types';
import { ChatPage } from '../ui/pages/ChatPage';
import { CHAT_SYMBOLS } from './symbols';
import type { IChatRepository } from '../infrastructure/api/ChatRepository';
import { ChatRepository } from '../infrastructure/api/ChatRepository';

export function createChatModule(container: Container): AppModule {
  const routes: ModuleRoute[] = [
    {
      path: '/apps/chat/*',
      component: ChatPage,
      layout: 'app',
      layoutBehavior: 'fixed-height',
      module: 'chat',
    },
  ];

  return {
    name: 'chat',
    routes,
    registerBindings: () => {
      container
        .bind<IChatRepository>(CHAT_SYMBOLS.IChatRepository)
        .to(ChatRepository)
        .inSingletonScope();
    },
  };
}
