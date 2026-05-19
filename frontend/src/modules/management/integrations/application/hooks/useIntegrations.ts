import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIntegrationsRepository } from './useIntegrationsRepository';
import type {
  ListIntegrationsParams,
  UpdateIntegrationConfigPayload,
} from '../../domain/models';

export const INTEGRATIONS_QUERY_KEYS = {
  all: ['integrations'] as const,
  list: (params?: ListIntegrationsParams) => [...INTEGRATIONS_QUERY_KEYS.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...INTEGRATIONS_QUERY_KEYS.all, 'detail', id] as const,
};

export function useIntegrations(params?: ListIntegrationsParams) {
  const repo = useIntegrationsRepository();

  return useQuery({
    queryKey: INTEGRATIONS_QUERY_KEYS.list(params),
    queryFn: () => repo.listIntegrations(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useIntegration(id: string | null) {
  const repo = useIntegrationsRepository();

  return useQuery({
    queryKey: INTEGRATIONS_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => repo.getIntegration(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

export function useToggleIntegrationFavorite() {
  const repo = useIntegrationsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repo.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEYS.all });
    },
  });
}

export function useConnectIntegration() {
  const repo = useIntegrationsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repo.connect(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(INTEGRATIONS_QUERY_KEYS.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEYS.all });
    },
  });
}

export function useDisconnectIntegration() {
  const repo = useIntegrationsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repo.disconnect(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(INTEGRATIONS_QUERY_KEYS.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEYS.all });
    },
  });
}

export function useUpdateIntegrationConfig() {
  const repo = useIntegrationsRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateIntegrationConfigPayload }) =>
      repo.updateConfig(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(INTEGRATIONS_QUERY_KEYS.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: INTEGRATIONS_QUERY_KEYS.all });
    },
  });
}

export function useFavoriteIntegrations() {
  return useIntegrations({ favoritesOnly: true });
}
