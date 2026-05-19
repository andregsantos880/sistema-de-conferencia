import { useRepository } from '@/shared/hooks/useRepository';
import { NOTIFICATIONS_SYMBOLS } from '../../di/symbols';
import type { INotificationsRepository } from '../../domain/ports/INotificationsRepository';

/**
 * Module-specific hook for Notifications Repository
 * Provides semantic clarity while using the generic useRepository internally
 */
export const useNotificationsRepository = (): INotificationsRepository =>
  useRepository<INotificationsRepository>(NOTIFICATIONS_SYMBOLS.INotificationsRepository);
