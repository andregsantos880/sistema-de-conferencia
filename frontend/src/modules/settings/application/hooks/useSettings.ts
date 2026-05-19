/**
 * Settings React Query Hooks
 * 
 * Provides data fetching and mutation hooks for all Settings sections.
 * Uses the SettingsRepository via DI for data access.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useService } from '@/app/providers/useDI';
import { SETTINGS_SYMBOLS } from '../../di/symbols';
import type { ISettingsRepository } from '../../domain/ports/ISettingsRepository';
import type {
  UpdateProfileDto,
  UpdateAccountDto,
  CreateApiKeyDto,
  UpdateNotificationsDto,
  UpdatePreferencesDto,
} from '../../domain/models/Settings';

// ============================================================================
// Query Keys
// ============================================================================

export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  account: () => [...settingsKeys.all, 'account'] as const,
  billing: () => [...settingsKeys.all, 'billing'] as const,
  security: () => [...settingsKeys.all, 'security'] as const,
  apps: () => [...settingsKeys.all, 'apps'] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
  preferences: () => [...settingsKeys.all, 'preferences'] as const,
};

// ============================================================================
// Profile Hooks
// ============================================================================

export function useProfile() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);

  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: () => repo.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateProfile() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => repo.updateProfile(dto),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(settingsKeys.profile(), updatedProfile);
    },
  });
}

export function useUploadAvatar() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => repo.uploadAvatar(file),
    onSuccess: () => {
      // Invalidate profile to refetch with new avatar
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() });
    },
  });
}

// ============================================================================
// Account Hooks
// ============================================================================

export function useAccount() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);

  return useQuery({
    queryKey: settingsKeys.account(),
    queryFn: () => repo.getAccount(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateAccount() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateAccountDto) => repo.updateAccount(dto),
    onSuccess: (updatedAccount) => {
      queryClient.setQueryData(settingsKeys.account(), updatedAccount);
    },
  });
}

// ============================================================================
// Billing Hooks
// ============================================================================

export function useBilling() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);

  return useQuery({
    queryKey: settingsKeys.billing(),
    queryFn: () => repo.getBilling(),
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================================================
// Security Hooks
// ============================================================================

export function useSecurity() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);

  return useQuery({
    queryKey: settingsKeys.security(),
    queryFn: () => repo.getSecurity(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRevokeSession() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => repo.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security() });
    },
  });
}

export function useCreateApiKey() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateApiKeyDto) => repo.createApiKey(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security() });
    },
  });
}

export function useDeleteApiKey() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => repo.deleteApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security() });
    },
  });
}

// ============================================================================
// Apps Hooks
// ============================================================================

export function useApps() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);

  return useQuery({
    queryKey: settingsKeys.apps(),
    queryFn: () => repo.getApps(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useConnectApp() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string) => repo.connectApp(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.apps() });
    },
  });
}

export function useDisconnectApp() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string) => repo.disconnectApp(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.apps() });
    },
  });
}

// ============================================================================
// Notifications Hooks
// ============================================================================

export function useNotifications() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);

  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: () => repo.getNotifications(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateNotifications() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateNotificationsDto) => repo.updateNotifications(dto),
    onSuccess: (updatedNotifications) => {
      queryClient.setQueryData(settingsKeys.notifications(), updatedNotifications);
    },
  });
}

// ============================================================================
// Preferences Hooks
// ============================================================================

export function usePreferences() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);

  return useQuery({
    queryKey: settingsKeys.preferences(),
    queryFn: () => repo.getPreferences(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdatePreferences() {
  const repo = useService<ISettingsRepository>(SETTINGS_SYMBOLS.ISettingsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdatePreferencesDto) => repo.updatePreferences(dto),
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(settingsKeys.preferences(), updatedPreferences);
    },
  });
}
