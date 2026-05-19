import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type { IExecutiveAnalyticsRepository } from '../../domain/repositories/IExecutiveAnalyticsRepository';
import type {
  MrrData,
  RevenueVsTargetData,
  ChurnData,
  MrrMovementsData,
  CohortRetentionData,
  RetentionData,
  RegionData,
  TopProductsData,
  PipelineFunnelData,
  NpsData,
  ActiveCustomersData,
  LtvCacData,
  ExecutiveAnalyticsQuery,
} from '../../domain/models/ExecutiveAnalytics';

/**
 * HTTP implementation of Executive Analytics Repository
 * Extends BaseRepository for consistent response handling
 */
@injectable()
export class ExecutiveAnalyticsRepository extends BaseRepository implements IExecutiveAnalyticsRepository {
  private readonly baseUrl = '/analytics/executive';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  /**
   * Build query string from ExecutiveAnalyticsQuery
   */
  private buildAnalyticsQuery(query: ExecutiveAnalyticsQuery): string {
    return this.buildQueryString({
      from: query.from,
      to: query.to,
      compare: query.compare ? 'true' : undefined,
      limit: query.limit,
    });
  }

  async getMrr(query: ExecutiveAnalyticsQuery): Promise<MrrData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<MrrData>(
      this.appendQuery(`${this.baseUrl}/mrr`, qs),
      'Failed to fetch MRR data'
    );
  }

  async getRevenueVsTarget(query: ExecutiveAnalyticsQuery): Promise<RevenueVsTargetData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<RevenueVsTargetData>(
      this.appendQuery(`${this.baseUrl}/revenue-vs-target`, qs),
      'Failed to fetch revenue vs target data'
    );
  }

  async getChurn(query: ExecutiveAnalyticsQuery): Promise<ChurnData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<ChurnData>(
      this.appendQuery(`${this.baseUrl}/churn`, qs),
      'Failed to fetch churn data'
    );
  }

  async getMrrMovements(query: ExecutiveAnalyticsQuery): Promise<MrrMovementsData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<MrrMovementsData>(
      this.appendQuery(`${this.baseUrl}/mrr-movements`, qs),
      'Failed to fetch MRR movements data'
    );
  }

  async getCohortRetention(query: ExecutiveAnalyticsQuery): Promise<CohortRetentionData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<CohortRetentionData>(
      this.appendQuery(`${this.baseUrl}/cohort-retention`, qs),
      'Failed to fetch cohort retention data'
    );
  }

  async getRetention(query: ExecutiveAnalyticsQuery): Promise<RetentionData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<RetentionData>(
      this.appendQuery(`${this.baseUrl}/retention`, qs),
      'Failed to fetch retention data'
    );
  }

  async getRegions(query: ExecutiveAnalyticsQuery): Promise<RegionData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<RegionData>(
      this.appendQuery(`${this.baseUrl}/regions`, qs),
      'Failed to fetch region data'
    );
  }

  async getTopProducts(query: ExecutiveAnalyticsQuery): Promise<TopProductsData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<TopProductsData>(
      this.appendQuery(`${this.baseUrl}/top-products`, qs),
      'Failed to fetch top products data'
    );
  }

  async getPipelineFunnel(_query: ExecutiveAnalyticsQuery): Promise<PipelineFunnelData> {
    return this.get<PipelineFunnelData>(
      `${this.baseUrl}/pipeline-funnel`,
      'Failed to fetch pipeline funnel data'
    );
  }

  async getNps(query: ExecutiveAnalyticsQuery): Promise<NpsData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<NpsData>(
      this.appendQuery(`${this.baseUrl}/nps`, qs),
      'Failed to fetch NPS data'
    );
  }

  async getActiveCustomers(query: ExecutiveAnalyticsQuery): Promise<ActiveCustomersData> {
    const qs = this.buildAnalyticsQuery(query);
    return this.get<ActiveCustomersData>(
      this.appendQuery(`${this.baseUrl}/active-customers`, qs),
      'Failed to fetch active customers data'
    );
  }

  async getLtvCac(query: ExecutiveAnalyticsQuery): Promise<LtvCacData> {
    const qs = this.buildQueryString({ compare: query.compare ? 'true' : undefined });
    return this.get<LtvCacData>(
      this.appendQuery(`${this.baseUrl}/ltv-cac`, qs),
      'Failed to fetch LTV/CAC data'
    );
  }
}
