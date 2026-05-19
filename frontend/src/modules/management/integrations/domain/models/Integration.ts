export type IntegrationProviderType = 'internal' | 'third_party';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export type IntegrationCategory =
  | 'communication'
  | 'productivity'
  | 'payments'
  | 'analytics'
  | 'developer_tools'
  | 'storage'
  | 'security'
  | 'other';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  providerType: IntegrationProviderType;
  status: IntegrationStatus;
  isFavorite: boolean;
  iconUrl?: string;
  websiteUrl?: string;
  docsUrl?: string;
  createdAt: string;
  updatedAt: string;
  connectedAt?: string | null;
  lastSyncAt?: string | null;
  errorMessage?: string | null;
  usageCount?: number;
  config: {
    apiKey?: string;
    workspaceId?: string;
    webhookUrl?: string;
  };
}

export interface IntegrationListItem {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  providerType: IntegrationProviderType;
  status: IntegrationStatus;
  isFavorite: boolean;
  iconUrl?: string;
  lastSyncAt?: string | null;
  errorMessage?: string | null;
  usageCount?: number;
}

export interface ListIntegrationsParams {
  search?: string;
  category?: IntegrationCategory | 'all';
  status?: IntegrationStatus | 'all';
  favoritesOnly?: boolean;
}

export interface UpdateIntegrationConfigPayload {
  apiKey?: string;
  workspaceId?: string;
  webhookUrl?: string;
}
