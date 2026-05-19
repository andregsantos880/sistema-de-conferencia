import type { ModuleRoute } from '@/core/router/types';
import { SETTINGS_PATHS } from './paths';
import { lazy } from 'react';

const SettingsLayout = lazy(() => import('../../ui/layout/SettingsLayout'));
const ProfileSection = lazy(() => import('../sections/ProfileSection'));
const AccountSection = lazy(() => import('../sections/AccountSection'));
const BillingSection = lazy(() => import('../sections/BillingSection'));
const SecuritySection = lazy(() => import('../sections/SecuritySection'));
const AppsSection = lazy(() => import('../sections/AppsSection'));
const NotificationsSection = lazy(() => import('../sections/NotificationsSection'));
const PreferencesSection = lazy(() => import('../sections/PreferencesSection'));

export const SETTINGS_ROUTES: ModuleRoute[] = [
  { 
    path: SETTINGS_PATHS.ROOT,
    module: 'settings', 
    layout: 'app',
    titleKey: 'settings:title',
    title: 'Settings',
    description: 'User settings',
    component: SettingsLayout,
    children: [
      { path: '', index: true, module: 'settings', layout: 'app', titleKey: 'settings:nav.items.profile', title: 'Profile', component: ProfileSection },
      { path: SETTINGS_PATHS.PROFILE, module: 'settings', layout: 'app', titleKey: 'settings:nav.items.profile', title: 'Profile', component: ProfileSection },
      { path: SETTINGS_PATHS.ACCOUNT, module: 'settings', layout: 'app', titleKey: 'settings:nav.items.account', title: 'Account', component: AccountSection },
      { path: SETTINGS_PATHS.BILLING, module: 'settings', layout: 'app', titleKey: 'settings:nav.items.billing', title: 'Billing', component: BillingSection },
      { path: SETTINGS_PATHS.SECURITY, module: 'settings', layout: 'app', titleKey: 'settings:nav.items.security', title: 'Security', component: SecuritySection },
      { path: SETTINGS_PATHS.APPS, module: 'settings', layout: 'app', titleKey: 'settings:nav.items.apps', title: 'Apps', component: AppsSection },
      { path: SETTINGS_PATHS.NOTIFICATIONS, module: 'settings', layout: 'app', titleKey: 'settings:nav.items.notifications', title: 'Notifications', component: NotificationsSection },
      { path: SETTINGS_PATHS.PREFERENCES, module: 'settings', layout: 'app', titleKey: 'settings:nav.items.preferences', title: 'Preferences', component: PreferencesSection },
    ]
  },
];

export const getSettingsRoutes = (): ModuleRoute[] => SETTINGS_ROUTES;

export { SETTINGS_PATHS } from './paths';
