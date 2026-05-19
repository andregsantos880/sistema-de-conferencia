/**
 * SettingsRepository - HTTP implementation of ISettingsRepository
 * 
 * Extends BaseRepository for consistent HTTP handling and error management.
 * All methods call the /settings/* endpoints which are intercepted by MSW in development.
 */

import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type { ISettingsRepository } from '../../domain/ports/ISettingsRepository';
import type {
  UserProfile,
  UpdateProfileDto,
  AccountSettings,
  UpdateAccountDto,
  BillingInfo,
  SecuritySettings,
  CreateApiKeyDto,
  ApiKey,
  ConnectedApp,
  NotificationPreferences,
  UpdateNotificationsDto,
  UserPreferences,
  UpdatePreferencesDto,
} from '../../domain/models/Settings';

// API response wrappers (match MSW handler shapes)
interface ProfileResponse {
  profile: UserProfile;
}

interface AccountResponse {
  account: AccountSettings;
}

interface BillingResponse {
  billing: BillingInfo;
}

interface SecurityResponse {
  security: SecuritySettings;
}

interface AppsResponse {
  apps: ConnectedApp[];
}

interface NotificationsResponse {
  notifications: NotificationPreferences;
}

interface PreferencesResponse {
  preferences: UserPreferences;
}

interface AvatarResponse {
  avatar: string;
}

interface ApiKeyResponse {
  apiKey: ApiKey;
}

@injectable()
export class SettingsRepository extends BaseRepository implements ISettingsRepository {
  private readonly baseUrl = '/settings';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  // ============================================================================
  // Profile
  // ============================================================================

  async getProfile(): Promise<UserProfile> {
    const response = await this.get<ProfileResponse>(
      `${this.baseUrl}/profile`,
      'Failed to fetch profile'
    );
    return response.profile;
  }

  async updateProfile(dto: UpdateProfileDto): Promise<UserProfile> {
    const response = await this.put<ProfileResponse, UpdateProfileDto>(
      `${this.baseUrl}/profile`,
      dto,
      'Failed to update profile'
    );
    return response.profile;
  }

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    // For file uploads, we need to use the raw http client with FormData
    const response = await this.http.post<AvatarResponse, FormData>(`${this.baseUrl}/profile/avatar`, formData);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to upload avatar');
    }
    return response.data.avatar;
  }

  // ============================================================================
  // Account
  // ============================================================================

  async getAccount(): Promise<AccountSettings> {
    const response = await this.get<AccountResponse>(
      `${this.baseUrl}/account`,
      'Failed to fetch account settings'
    );
    return response.account;
  }

  async updateAccount(dto: UpdateAccountDto): Promise<AccountSettings> {
    const response = await this.put<AccountResponse, UpdateAccountDto>(
      `${this.baseUrl}/account`,
      dto,
      'Failed to update account settings'
    );
    return response.account;
  }

  // ============================================================================
  // Billing
  // ============================================================================

  async getBilling(): Promise<BillingInfo> {
    const response = await this.get<BillingResponse>(
      `${this.baseUrl}/billing`,
      'Failed to fetch billing info'
    );
    return response.billing;
  }

  // ============================================================================
  // Security
  // ============================================================================

  async getSecurity(): Promise<SecuritySettings> {
    const response = await this.get<SecurityResponse>(
      `${this.baseUrl}/security`,
      'Failed to fetch security settings'
    );
    return response.security;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.delete(
      `${this.baseUrl}/security/sessions/${sessionId}`,
      'Failed to revoke session'
    );
  }

  async createApiKey(dto: CreateApiKeyDto): Promise<ApiKey> {
    const response = await this.post<ApiKeyResponse, CreateApiKeyDto>(
      `${this.baseUrl}/security/api-keys`,
      dto,
      'Failed to create API key'
    );
    return response.apiKey;
  }

  async deleteApiKey(keyId: string): Promise<void> {
    await this.delete(
      `${this.baseUrl}/security/api-keys/${keyId}`,
      'Failed to delete API key'
    );
  }

  // ============================================================================
  // Apps
  // ============================================================================

  async getApps(): Promise<ConnectedApp[]> {
    const response = await this.get<AppsResponse>(
      `${this.baseUrl}/apps`,
      'Failed to fetch connected apps'
    );
    return response.apps;
  }

  async connectApp(appId: string): Promise<void> {
    await this.post(
      `${this.baseUrl}/apps/${appId}/connect`,
      undefined,
      'Failed to connect app'
    );
  }

  async disconnectApp(appId: string): Promise<void> {
    await this.post(
      `${this.baseUrl}/apps/${appId}/disconnect`,
      undefined,
      'Failed to disconnect app'
    );
  }

  // ============================================================================
  // Notifications
  // ============================================================================

  async getNotifications(): Promise<NotificationPreferences> {
    const response = await this.get<NotificationsResponse>(
      `${this.baseUrl}/notifications`,
      'Failed to fetch notification preferences'
    );
    return response.notifications;
  }

  async updateNotifications(dto: UpdateNotificationsDto): Promise<NotificationPreferences> {
    const response = await this.put<NotificationsResponse, UpdateNotificationsDto>(
      `${this.baseUrl}/notifications`,
      dto,
      'Failed to update notification preferences'
    );
    return response.notifications;
  }

  // ============================================================================
  // Preferences
  // ============================================================================

  async getPreferences(): Promise<UserPreferences> {
    const response = await this.get<PreferencesResponse>(
      `${this.baseUrl}/preferences`,
      'Failed to fetch preferences'
    );
    return response.preferences;
  }

  async updatePreferences(dto: UpdatePreferencesDto): Promise<UserPreferences> {
    const response = await this.put<PreferencesResponse, UpdatePreferencesDto>(
      `${this.baseUrl}/preferences`,
      dto,
      'Failed to update preferences'
    );
    return response.preferences;
  }
}
