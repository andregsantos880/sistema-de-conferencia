// Settings Module Route Path Constants
export const SETTINGS_PATHS = {
  ROOT: '/settings',
  PROFILE: '/settings/profile',
  ACCOUNT: '/settings/account',
  BILLING: '/settings/billing',
  SECURITY: '/settings/security',
  APPS: '/settings/apps',
  NOTIFICATIONS: '/settings/notifications',
  PREFERENCES: '/settings/preferences',
} as const;

export type SettingsPaths = typeof SETTINGS_PATHS;
