import type { RouteObject } from 'react-router-dom';
import { EmailPage } from '../pages/EmailPage';

export const EMAIL_PATHS = {
  ROOT: '/apps/email',
  TRAY: '/apps/email/:tray',
  MESSAGE: '/apps/email/:tray/:id',
} as const;

export const emailRoutes: RouteObject = {
  path: '/apps/email/*',
  Component: EmailPage,
};
