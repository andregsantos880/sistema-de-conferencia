import type { ModuleRoute } from '@/core/router/types';
import { USERS_PATHS } from './paths';
import { lazy } from 'react';

const UsersPage = lazy(() => import('../pages/UsersPage'));

export const USERS_ROUTES: ModuleRoute[] = [
  {
    path: USERS_PATHS.HOME,
    module: 'management-users',
    layout: 'app',
    titleKey: 'users:title',
    title: 'Users',
    description: 'Manage user accounts, invitations, and permissions',
    component: UsersPage,
  },
];

export { USERS_PATHS } from './paths';
