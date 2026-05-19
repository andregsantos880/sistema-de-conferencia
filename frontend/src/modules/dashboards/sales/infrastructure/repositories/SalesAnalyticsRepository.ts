import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type { ISalesAnalyticsRepository } from '../../domain/repositories/ISalesAnalyticsRepository';
import type {
  PipelineStagesResponse,
  ForecastResponse,
  WinRateResponse,
  DealSizeResponse,
  CycleLengthResponse,
  RepLeaderboardResponse,
  ActivitiesHeatmapResponse,
  OpportunitiesAtRiskResponse,
  TopAccountsResponse,
  SalesLocationsResponse,
  SalesAnalyticsQuery,
} from '../../domain/models/SalesAnalytics';

/**
 * HTTP implementation of Sales Analytics Repository
 * Extends BaseRepository for consistent response handling
 */
@injectable()
export class SalesAnalyticsRepository extends BaseRepository implements ISalesAnalyticsRepository {
  private readonly baseUrl = '/analytics/sales';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  /**
   * Build query string from SalesAnalyticsQuery
   */
  private buildSalesQuery(query: SalesAnalyticsQuery): string {
    return this.buildQueryString({
      from: query.from,
      to: query.to,
      team: query.team,
      region: query.region,
      owner: query.owner,
      limit: query.limit,
    });
  }

  async getPipelineStages(query: SalesAnalyticsQuery): Promise<PipelineStagesResponse> {
    const qs = this.buildSalesQuery(query);
    return this.get<PipelineStagesResponse>(
      `${this.baseUrl}/pipeline-stages?${qs}`,
      'Failed to fetch pipeline stages'
    );
  }

  async getForecast(query: SalesAnalyticsQuery): Promise<ForecastResponse> {
    const qs = this.buildSalesQuery(query);
    return this.get<ForecastResponse>(
      `${this.baseUrl}/forecast?${qs}`,
      'Failed to fetch forecast'
    );
  }

  async getWinRate(query: SalesAnalyticsQuery): Promise<WinRateResponse> {
    const qs = this.buildSalesQuery(query);
    return this.get<WinRateResponse>(
      `${this.baseUrl}/win-rate?${qs}`,
      'Failed to fetch win rate'
    );
  }

  async getDealSize(query: SalesAnalyticsQuery): Promise<DealSizeResponse> {
    const qs = this.buildSalesQuery(query);
    return this.get<DealSizeResponse>(
      `${this.baseUrl}/deal-size?${qs}`,
      'Failed to fetch deal size'
    );
  }

  async getCycleLength(query: SalesAnalyticsQuery): Promise<CycleLengthResponse> {
    const qs = this.buildSalesQuery(query);
    return this.get<CycleLengthResponse>(
      `${this.baseUrl}/cycle-length?${qs}`,
      'Failed to fetch cycle length'
    );
  }

  async getRepLeaderboard(query: SalesAnalyticsQuery): Promise<RepLeaderboardResponse> {
    const qs = this.buildSalesQuery(query);
    return this.get<RepLeaderboardResponse>(
      `${this.baseUrl}/rep-leaderboard?${qs}`,
      'Failed to fetch rep leaderboard'
    );
  }

  async getActivitiesHeatmap(query: SalesAnalyticsQuery): Promise<ActivitiesHeatmapResponse> {
    const qs = this.buildSalesQuery(query);
    return this.get<ActivitiesHeatmapResponse>(
      `${this.baseUrl}/activities-heatmap?${qs}`,
      'Failed to fetch activities heatmap'
    );
  }

  async getOpportunitiesAtRisk(query: SalesAnalyticsQuery): Promise<OpportunitiesAtRiskResponse> {
    const qs = this.buildSalesQuery(query);
    return this.get<OpportunitiesAtRiskResponse>(
      `${this.baseUrl}/opportunities-at-risk?${qs}`,
      'Failed to fetch opportunities at risk'
    );
  }

  async getTopAccounts(query: SalesAnalyticsQuery): Promise<TopAccountsResponse> {
    const qs = this.buildSalesQuery(query);
    return this.get<TopAccountsResponse>(
      `${this.baseUrl}/top-accounts?${qs}`,
      'Failed to fetch top accounts'
    );
  }

  async getSalesLocations(query: SalesAnalyticsQuery): Promise<SalesLocationsResponse> {
    const qs = this.buildSalesQuery(query);
    return this.get<SalesLocationsResponse>(
      `${this.baseUrl}/locations?${qs}`,
      'Failed to fetch sales locations'
    );
  }
}
