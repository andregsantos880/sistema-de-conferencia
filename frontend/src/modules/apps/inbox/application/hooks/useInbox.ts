import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInboxRepository } from './useInboxRepository';
import type {
  NotificationFilters,
  UpdateNotificationDto,
  BulkUpdateNotificationsDto,
  NotificationPreferences,
} from '../../domain/models/Notification';

const QUERY_KEYS = {
  notifications: (filters?: NotificationFilters) => ['inbox', 'notifications', filters] as const,
  unreadCount: ['inbox', 'unread-count'] as const,
  preferences: ['inbox', 'preferences'] as const,
};

/**
 * Hook to fetch notifications with optional filters
 */
export function useNotifications(filters?: NotificationFilters) {
  const repository = useInboxRepository();

  return useQuery({
    queryKey: QUERY_KEYS.notifications(filters),
    queryFn: () => repository.getNotifications(filters),
  });
}

/**
 * Hook to fetch unread notification count
 */
export function useUnreadCount() {
  const repository = useInboxRepository();

  return useQuery({
    queryKey: QUERY_KEYS.unreadCount,
    queryFn: () => repository.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to update a single notification
 */
export function useUpdateNotification() {
  const repository = useInboxRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateNotificationDto }) =>
      repository.updateNotification(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });
}

/**
 * Hook to bulk update notifications
 */
export function useBulkUpdateNotifications() {
  const repository = useInboxRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: BulkUpdateNotificationsDto) => repository.bulkUpdateNotifications(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const repository = useInboxRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repository.markAllAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });
}

/**
 * Hook to fetch notification preferences
 */
export function useNotificationPreferences() {
  const repository = useInboxRepository();

  return useQuery({
    queryKey: QUERY_KEYS.preferences,
    queryFn: () => repository.getPreferences(),
  });
}

/**
 * Hook to update notification preferences
 */
export function useUpdatePreferences() {
  const repository = useInboxRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Partial<NotificationPreferences>) =>
      repository.updatePreferences(preferences),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.preferences });
    },
  });
}
