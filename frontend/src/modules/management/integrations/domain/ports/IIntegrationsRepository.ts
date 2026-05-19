import type {
  Integration,
  IntegrationListItem,
  ListIntegrationsParams,
  UpdateIntegrationConfigPayload,
} from '../models';

export interface IIntegrationsRepository {
  listIntegrations(params?: ListIntegrationsParams): Promise<IntegrationListItem[]>;
  getIntegration(id: string): Promise<Integration | null>;
  toggleFavorite(id: string): Promise<IntegrationListItem>;
  connect(id: string): Promise<Integration>;
  disconnect(id: string): Promise<Integration>;
  updateConfig(id: string, payload: UpdateIntegrationConfigPayload): Promise<Integration>;
}
