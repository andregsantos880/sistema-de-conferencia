import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en_common from '@/i18n/locales/en/common.json';
import en_dashboard from '@/i18n/locales/en/home.json';
import en_users from '@/i18n/locales/en/users.json';
import en_auth from '@/i18n/locales/en/auth.json';
import en_settings from '@/i18n/locales/en/settings.json';
import en_calendar from '@/i18n/locales/en/calendar.json';
import en_chat from '@/i18n/locales/en/chat.json';
import en_email from '@/i18n/locales/en/email.json';
import en_dashboards from '@/i18n/locales/en/dashboards.json';
import en_kanban from '@/i18n/locales/en/kanban.json';
import en_notifications from '@/i18n/locales/en/notifications.json';
import en_teams from '@/i18n/locales/en/teams.json';
import en_invoices from '@/i18n/locales/en/invoices.json';
import en_system from '@/i18n/locales/en/system.json';
import en_guidedSetup from '@/i18n/locales/en/guidedSetup.json';
import en_activityHub from '@/i18n/locales/en/activityHub.json';
import en_integrations from '@/i18n/locales/en/integrations.json';
import en_pricing from '@/i18n/locales/en/pricing.json';
import en_errors from '@/i18n/locales/en/errors.json';
import en_layouts from '@/i18n/locales/en/layouts.json';
import en_navigation from '@/i18n/locales/en/navigation.json';
import en_inbox from '@/i18n/locales/en/inbox.json';

import es_common from '@/i18n/locales/es/common.json';
import es_dashboard from '@/i18n/locales/es/home.json';
import es_users from '@/i18n/locales/es/users.json';
import es_auth from '@/i18n/locales/es/auth.json';
import es_settings from '@/i18n/locales/es/settings.json';
import es_calendar from '@/i18n/locales/es/calendar.json';
import es_chat from '@/i18n/locales/es/chat.json';
import es_email from '@/i18n/locales/es/email.json';
import es_dashboards from '@/i18n/locales/es/dashboards.json';
import es_kanban from '@/i18n/locales/es/kanban.json';
import es_notifications from '@/i18n/locales/es/notifications.json';
import es_teams from '@/i18n/locales/es/teams.json';
import es_invoices from '@/i18n/locales/es/invoices.json';
import es_system from '@/i18n/locales/es/system.json';
import es_guidedSetup from '@/i18n/locales/es/guidedSetup.json';
import es_activityHub from '@/i18n/locales/es/activityHub.json';
import es_integrations from '@/i18n/locales/es/integrations.json';
import es_pricing from '@/i18n/locales/es/pricing.json';
import es_errors from '@/i18n/locales/es/errors.json';
import es_layouts from '@/i18n/locales/es/layouts.json';
import es_navigation from '@/i18n/locales/es/navigation.json';
import es_inbox from '@/i18n/locales/es/inbox.json';

import ptBR_common from '@/i18n/locales/pt-BR/common.json';
import ptBR_dashboard from '@/i18n/locales/pt-BR/home.json';
import ptBR_users from '@/i18n/locales/pt-BR/users.json';
import ptBR_auth from '@/i18n/locales/pt-BR/auth.json';
import ptBR_settings from '@/i18n/locales/pt-BR/settings.json';
import ptBR_calendar from '@/i18n/locales/pt-BR/calendar.json';
import ptBR_chat from '@/i18n/locales/pt-BR/chat.json';
import ptBR_email from '@/i18n/locales/pt-BR/email.json';
import ptBR_dashboards from '@/i18n/locales/pt-BR/dashboards.json';
import ptBR_kanban from '@/i18n/locales/pt-BR/kanban.json';
import ptBR_notifications from '@/i18n/locales/pt-BR/notifications.json';
import ptBR_teams from '@/i18n/locales/pt-BR/teams.json';
import ptBR_invoices from '@/i18n/locales/pt-BR/invoices.json';
import ptBR_system from '@/i18n/locales/pt-BR/system.json';
import ptBR_guidedSetup from '@/i18n/locales/pt-BR/guidedSetup.json';
import ptBR_activityHub from '@/i18n/locales/pt-BR/activityHub.json';
import ptBR_integrations from '@/i18n/locales/pt-BR/integrations.json';
import ptBR_pricing from '@/i18n/locales/pt-BR/pricing.json';
import ptBR_errors from '@/i18n/locales/pt-BR/errors.json';
import ptBR_layouts from '@/i18n/locales/pt-BR/layouts.json';
import ptBR_navigation from '@/i18n/locales/pt-BR/navigation.json';
import ptBR_inbox from '@/i18n/locales/pt-BR/inbox.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    resources: {
      en: { common: en_common, dashboard: en_dashboard, home: en_dashboard, users: en_users, auth: en_auth, settings: en_settings, calendar: en_calendar, chat: en_chat, email: en_email, dashboards: en_dashboards, kanban: en_kanban, notifications: en_notifications, teams: en_teams, invoices: en_invoices, system: en_system, guidedSetup: en_guidedSetup, activityHub: en_activityHub, integrations: en_integrations, pricing: en_pricing, errors: en_errors, layouts: en_layouts, navigation: en_navigation, inbox: en_inbox },
      es: { common: es_common, dashboard: es_dashboard, home: es_dashboard, users: es_users, auth: es_auth, settings: es_settings, calendar: es_calendar, chat: es_chat, email: es_email, dashboards: es_dashboards, kanban: es_kanban, notifications: es_notifications, teams: es_teams, invoices: es_invoices, system: es_system, guidedSetup: es_guidedSetup, activityHub: es_activityHub, integrations: es_integrations, pricing: es_pricing, errors: es_errors, layouts: es_layouts, navigation: es_navigation, inbox: es_inbox },
      'pt-BR': { common: ptBR_common, dashboard: ptBR_dashboard, home: ptBR_dashboard, users: ptBR_users, auth: ptBR_auth, settings: ptBR_settings, calendar: ptBR_calendar, chat: ptBR_chat, email: ptBR_email, dashboards: ptBR_dashboards, kanban: ptBR_kanban, notifications: ptBR_notifications, teams: ptBR_teams, invoices: ptBR_invoices, system: ptBR_system, guidedSetup: ptBR_guidedSetup, activityHub: ptBR_activityHub, integrations: ptBR_integrations, pricing: ptBR_pricing, errors: ptBR_errors, layouts: ptBR_layouts, navigation: ptBR_navigation, inbox: ptBR_inbox },
    },
    defaultNS: 'common',
    ns: ['common', 'dashboard', 'home', 'users', 'auth', 'settings', 'calendar', 'chat', 'email', 'dashboards', 'kanban', 'notifications', 'teams', 'invoices', 'system', 'guidedSetup', 'activityHub', 'integrations', 'pricing', 'errors', 'layouts', 'navigation', 'inbox'],
  });

export default i18n;
