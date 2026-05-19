import { useMemo } from 'react';
import { useService } from '@/app/providers/useDI';
import { NOTIFICATIONS_SYMBOLS } from '../../di/symbols';
import type { INotificationsRepository } from '../../domain/ports/INotificationsRepository';
import { NotificationService } from '../services/NotificationService';

/**
 * Hook to access the NotificationService
 * 
 * @example
 * const notificationService = useNotificationService();
 * 
 * // Send an email
 * await notificationService.sendEmail('user.invited', {
 *   user_name: 'John Doe',
 *   invite_link: 'https://...',
 * });
 */
export function useNotificationService(): NotificationService {
  const repository = useService<INotificationsRepository>(
    NOTIFICATIONS_SYMBOLS.INotificationsRepository
  );

  return useMemo(() => new NotificationService(repository), [repository]);
}

export default useNotificationService;
