export const NOTIFICATIONS_SYMBOLS = {
  INotificationsRepository: Symbol.for('INotificationsRepository'),
} as const;

export type NotificationsSymbols = typeof NOTIFICATIONS_SYMBOLS;
