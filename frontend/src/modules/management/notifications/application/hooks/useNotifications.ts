import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useService } from '@/app/providers/useDI';
import type { INotificationsRepository, ListTemplatesParams } from '../../domain/ports/INotificationsRepository';
import { NOTIFICATIONS_SYMBOLS } from '../../di/symbols';
import type { UpdateTemplatePayload, GlobalEmailSettings } from '../../domain/models';

// ============================================================================
// Query Keys
// ============================================================================

export const notificationsKeys = {
  all: ['notifications'] as const,
  templates: () => [...notificationsKeys.all, 'templates'] as const,
  templatesList: (params?: ListTemplatesParams) => [...notificationsKeys.templates(), 'list', params] as const,
  templateDetail: (id: string) => [...notificationsKeys.templates(), 'detail', id] as const,
  settings: () => [...notificationsKeys.all, 'settings'] as const,
  globalSettings: () => [...notificationsKeys.settings(), 'email'] as const,
  events: () => [...notificationsKeys.all, 'events'] as const,
  metrics: () => [...notificationsKeys.all, 'metrics'] as const,
};

// ============================================================================
// Template Hooks
// ============================================================================

/**
 * Fetch all email templates with optional filtering
 */
export function useEmailTemplates(params?: ListTemplatesParams) {
  const repo = useService<INotificationsRepository>(NOTIFICATIONS_SYMBOLS.INotificationsRepository);

  return useQuery({
    queryKey: notificationsKeys.templatesList(params),
    queryFn: () => repo.getTemplates(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single email template by ID
 */
export function useEmailTemplate(id: string) {
  const repo = useService<INotificationsRepository>(NOTIFICATIONS_SYMBOLS.INotificationsRepository);

  return useQuery({
    queryKey: notificationsKeys.templateDetail(id),
    queryFn: () => repo.getTemplate(id),
    enabled: !!id,
  });
}

/**
 * Update an email template
 */
export function useUpdateTemplate() {
  const repo = useService<INotificationsRepository>(NOTIFICATIONS_SYMBOLS.INotificationsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplatePayload }) =>
      repo.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.templates() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.templateDetail(id) });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.metrics() });
    },
  });
}

/**
 * Restore a template to its default state
 */
export function useRestoreTemplateDefault() {
  const repo = useService<INotificationsRepository>(NOTIFICATIONS_SYMBOLS.INotificationsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repo.restoreTemplateDefault(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.templates() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.templateDetail(id) });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.metrics() });
    },
  });
}

/**
 * Restore a template to a specific version
 */
export function useRestoreTemplateVersion() {
  const repo = useService<INotificationsRepository>(NOTIFICATIONS_SYMBOLS.INotificationsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, versionId }: { templateId: string; versionId: string }) =>
      repo.restoreTemplateVersion(templateId, versionId),
    onSuccess: (_, { templateId }) => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.templates() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.templateDetail(templateId) });
    },
  });
}

/**
 * Send a test email
 */
export function useSendTestEmail() {
  const repo = useService<INotificationsRepository>(NOTIFICATIONS_SYMBOLS.INotificationsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, recipientEmail }: { templateId: string; recipientEmail: string }) =>
      repo.sendTestEmail(templateId, recipientEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.globalSettings() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.metrics() });
    },
  });
}

// ============================================================================
// Settings Hooks
// ============================================================================

/**
 * Fetch global email settings
 */
export function useGlobalEmailSettings() {
  const repo = useService<INotificationsRepository>(NOTIFICATIONS_SYMBOLS.INotificationsRepository);

  return useQuery({
    queryKey: notificationsKeys.globalSettings(),
    queryFn: () => repo.getGlobalSettings(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Update global email settings
 */
export function useUpdateGlobalSettings() {
  const repo = useService<INotificationsRepository>(NOTIFICATIONS_SYMBOLS.INotificationsRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<GlobalEmailSettings>) => repo.updateGlobalSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.globalSettings() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.metrics() });
    },
  });
}

/**
 * Test email provider configuration
 */
export function useTestProviderConfig() {
  const repo = useService<INotificationsRepository>(NOTIFICATIONS_SYMBOLS.INotificationsRepository);

  return useMutation({
    mutationFn: () => repo.testProviderConfig(),
  });
}

// ============================================================================
// Events & Metrics Hooks
// ============================================================================

/**
 * Fetch all notification events
 */
export function useNotificationEvents() {
  const repo = useService<INotificationsRepository>(NOTIFICATIONS_SYMBOLS.INotificationsRepository);

  return useQuery({
    queryKey: notificationsKeys.events(),
    queryFn: () => repo.getEvents(),
    staleTime: 1000 * 60 * 30, // 30 minutes (rarely changes)
  });
}

/**
 * Fetch notification metrics
 */
export function useNotificationMetrics() {
  const repo = useService<INotificationsRepository>(NOTIFICATIONS_SYMBOLS.INotificationsRepository);

  return useQuery({
    queryKey: notificationsKeys.metrics(),
    queryFn: () => repo.getMetrics(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
