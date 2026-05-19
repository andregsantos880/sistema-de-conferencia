import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type {
  Notification,
  NotificationListResponse,
  NotificationFilters,
  UpdateNotificationDto,
  BulkUpdateNotificationsDto,
  NotificationPreferences,
} from '../../domain/models/Notification';

export interface IInboxRepository {
  getNotifications(filters?: NotificationFilters): Promise<NotificationListResponse>;
  getUnreadCount(): Promise<number>;
  updateNotification(id: string, dto: UpdateNotificationDto): Promise<Notification>;
  bulkUpdateNotifications(dto: BulkUpdateNotificationsDto): Promise<{ updated: number }>;
  markAllAsRead(): Promise<{ updated: number }>;
  getPreferences(): Promise<NotificationPreferences>;
  updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
}

@injectable()
export class InboxRepository extends BaseRepository implements IInboxRepository {
  private readonly baseUrl = '/inbox';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  async getNotifications(filters?: NotificationFilters): Promise<NotificationListResponse> {
    let queryString = '';
    if (filters) {
      const params: Record<string, string | undefined> = {
        tab: filters.tab,
        types: filters.types?.join(','),
        priorities: filters.priorities?.join(','),
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      };
      // Remove undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined)
      ) as Record<string, string>;
      queryString = this.buildQueryString(cleanParams);
    }

    if (queryString) {
      queryString = `?${queryString}`;
    }

    return this.get<NotificationListResponse>(
      `${this.baseUrl}/notifications${queryString}`,
      'Failed to fetch notifications'
    );
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.get<{ count: number }>(
      `${this.baseUrl}/notifications/unread-count`,
      'Failed to fetch unread count'
    );
    return response.count;
  }

  async updateNotification(id: string, dto: UpdateNotificationDto): Promise<Notification> {
    return this.patch<Notification, UpdateNotificationDto>(
      `${this.baseUrl}/notifications/${id}`,
      dto,
      'Failed to update notification'
    );
  }

  async bulkUpdateNotifications(dto: BulkUpdateNotificationsDto): Promise<{ updated: number }> {
    return this.patch<{ updated: number }, BulkUpdateNotificationsDto>(
      `${this.baseUrl}/notifications/bulk`,
      dto,
      'Failed to bulk update notifications'
    );
  }

  async markAllAsRead(): Promise<{ updated: number }> {
    return this.patch<{ updated: number }>(
      `${this.baseUrl}/notifications/mark-all-read`,
      undefined,
      'Failed to mark all as read'
    );
  }

  async getPreferences(): Promise<NotificationPreferences> {
    return this.get<NotificationPreferences>(
      `${this.baseUrl}/preferences`,
      'Failed to fetch preferences'
    );
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return this.patch<NotificationPreferences, Partial<NotificationPreferences>>(
      `${this.baseUrl}/preferences`,
      preferences,
      'Failed to update preferences'
    );
  }
}
