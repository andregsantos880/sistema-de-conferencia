// Email & Notifications Module Route Path Constants
export const NOTIFICATIONS_PATHS = {
  HOME: '/management/notifications',
  SETTINGS: '/management/notifications/settings',
  TEMPLATES: '/management/notifications/templates',
  TEMPLATE: (id: string) => `/management/notifications/templates/${id}`,
} as const;

export type NotificationsPaths = typeof NOTIFICATIONS_PATHS;
