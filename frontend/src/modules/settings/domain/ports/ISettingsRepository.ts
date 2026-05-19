/**
 * ISettingsRepository - Port interface for Settings data access
 * 
 * Defines all operations available for the Settings module.
 * Implemented by SettingsRepository in the infrastructure layer.
 */

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
} from '../models/Settings';

export interface ISettingsRepository {
  // Profile
  getProfile(): Promise<UserProfile>;
  updateProfile(dto: UpdateProfileDto): Promise<UserProfile>;
  uploadAvatar(file: File): Promise<string>;

  // Account
  getAccount(): Promise<AccountSettings>;
  updateAccount(dto: UpdateAccountDto): Promise<AccountSettings>;

  // Billing
  getBilling(): Promise<BillingInfo>;

  // Security
  getSecurity(): Promise<SecuritySettings>;
  revokeSession(sessionId: string): Promise<void>;
  createApiKey(dto: CreateApiKeyDto): Promise<ApiKey>;
  deleteApiKey(keyId: string): Promise<void>;

  // Apps
  getApps(): Promise<ConnectedApp[]>;
  connectApp(appId: string): Promise<void>;
  disconnectApp(appId: string): Promise<void>;

  // Notifications
  getNotifications(): Promise<NotificationPreferences>;
  updateNotifications(dto: UpdateNotificationsDto): Promise<NotificationPreferences>;

  // Preferences
  getPreferences(): Promise<UserPreferences>;
  updatePreferences(dto: UpdatePreferencesDto): Promise<UserPreferences>;
}
