import type { ModuleRoute } from '@/core/router/types';
import { NOTIFICATIONS_PATHS } from './paths';
import { lazy } from 'react';

const NotificationsLayout = lazy(() => import('../layout/NotificationsLayout'));
const NotificationsHomePage = lazy(() => import('../pages/NotificationsHomePage'));
const GlobalSettingsPage = lazy(() => import('../pages/GlobalSettingsPage'));
const TemplatesListPage = lazy(() => import('../pages/TemplatesListPage'));
const TemplateEditorPage = lazy(() => import('../pages/TemplateEditorPage'));

export const NOTIFICATIONS_ROUTES: ModuleRoute[] = [
  {
    path: NOTIFICATIONS_PATHS.HOME,
    module: 'notifications',
    layout: 'app',
    titleKey: 'notifications:title',
    title: 'Email & Notifications',
    description: 'Manage email templates and notification settings',
    component: NotificationsLayout,
    children: [
      {
        path: '',
        index: true,
        module: 'notifications',
        layout: 'app',
        titleKey: 'notifications:routes.home',
        title: 'Email & Notifications',
        component: NotificationsHomePage,
      },
      {
        path: 'settings',
        module: 'notifications',
        layout: 'app',
        titleKey: 'notifications:routes.settings',
        title: 'Global Email Settings',
        component: GlobalSettingsPage,
      },
      {
        path: 'templates',
        module: 'notifications',
        layout: 'app',
        titleKey: 'notifications:routes.templates',
        title: 'Email Templates',
        component: TemplatesListPage,
      },
      {
        path: 'templates/:id',
        module: 'notifications',
        layout: 'app',
        titleKey: 'notifications:routes.editor',
        title: 'Edit Template',
        component: TemplateEditorPage
      },
    ],
  },
];

export { NOTIFICATIONS_PATHS } from './paths';
