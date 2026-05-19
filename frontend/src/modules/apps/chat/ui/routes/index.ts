import type { RouteObject } from 'react-router-dom';
import { ChatPage } from '../pages/ChatPage';

export const CHAT_PATHS = {
  ROOT: '/apps/chat',
  CONVERSATION: '/apps/chat/:convId',
  CONTACT_INFO: '/apps/chat/:convId/info',
} as const;

export const chatRoutes: RouteObject = {
  path: '/apps/chat/*',
  Component: ChatPage,
};
