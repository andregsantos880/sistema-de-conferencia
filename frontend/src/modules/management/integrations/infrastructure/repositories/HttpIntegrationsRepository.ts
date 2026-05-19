import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type { IIntegrationsRepository } from '../../domain/ports/IIntegrationsRepository';
import type {
  Integration,
  IntegrationListItem,
  ListIntegrationsParams,
  UpdateIntegrationConfigPayload,
} from '../../domain/models';

@injectable()
export class HttpIntegrationsRepository extends BaseRepository implements IIntegrationsRepository {
  private readonly baseUrl = '/integrations';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  async listIntegrations(params?: ListIntegrationsParams): Promise<IntegrationListItem[]> {
    const queryString = this.buildQueryString({
      search: params?.search ?? '',
      category: params?.category && params.category !== 'all' ? params.category : undefined,
      status: params?.status && params.status !== 'all' ? params.status : undefined,
      favoritesOnly: params?.favoritesOnly ? true : undefined,
    });

    return this.get<IntegrationListItem[]>(
      this.appendQuery(this.baseUrl, queryString),
      'Failed to fetch integrations'
    );
  }

  async getIntegration(id: string): Promise<Integration | null> {
    try {
      return await this.get<Integration>(
        `${this.baseUrl}/${id}`,
        'Failed to fetch integration'
      );
    } catch {
      return null;
    }
  }

  async toggleFavorite(id: string): Promise<IntegrationListItem> {
    return this.put<IntegrationListItem, Record<string, never>>(
      `${this.baseUrl}/${id}/favorite`,
      {},
      'Failed to update favorite'
    );
  }

  async connect(id: string): Promise<Integration> {
    return this.post<Integration, Record<string, never>>(
      `${this.baseUrl}/${id}/connect`,
      {},
      'Failed to connect integration'
    );
  }

  async disconnect(id: string): Promise<Integration> {
    return this.post<Integration, Record<string, never>>(
      `${this.baseUrl}/${id}/disconnect`,
      {},
      'Failed to disconnect integration'
    );
  }

  async updateConfig(id: string, payload: UpdateIntegrationConfigPayload): Promise<Integration> {
    return this.put<Integration, UpdateIntegrationConfigPayload>(
      `${this.baseUrl}/${id}/config`,
      payload,
      'Failed to update integration configuration'
    );
  }
}
