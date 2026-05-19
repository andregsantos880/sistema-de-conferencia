import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type { IEcommerceAnalyticsRepository } from '../../domain/repositories/IEcommerceAnalyticsRepository';
import type {
  EcomKpisResponse,
  RevenueSeriesResponse,
  ChannelBreakdownResponse,
  TopProductsResponse,
  FunnelResponse,
  RealtimeOrdersResponse,
  LiveVisitorsResponse,
  EcommerceAnalyticsQuery,
} from '../../domain/models/EcommerceAnalytics';

/**
 * HTTP implementation of E-commerce Analytics Repository
 * Extends BaseRepository for consistent response handling
 */
@injectable()
export class EcommerceAnalyticsRepository extends BaseRepository implements IEcommerceAnalyticsRepository {
  private readonly baseUrl = '/analytics/ecom';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  /**
   * Build query string from EcommerceAnalyticsQuery
   * Includes date range and optional filter parameters
   */
  private buildEcomQuery(query: EcommerceAnalyticsQuery): string {
    const params: Record<string, string> = {
      from: query.from,
      to: query.to,
    };

    // Phase 4: Add active filters to query params
    if (query.channel && query.channel !== 'all') {
      params.channel = query.channel;
    }
    if (query.productId) {
      params.productId = query.productId;
    }
    if (query.funnelStage) {
      params.funnelStage = query.funnelStage;
    }
    if (query.country) {
      params.country = query.country;
    }

    return this.buildQueryString(params);
  }

  async getKpis(query: EcommerceAnalyticsQuery): Promise<EcomKpisResponse> {
    const qs = this.buildEcomQuery(query);
    return this.get<EcomKpisResponse>(
      `${this.baseUrl}/kpis?${qs}`,
      'Failed to fetch KPIs'
    );
  }

  async getRevenueSeries(query: EcommerceAnalyticsQuery): Promise<RevenueSeriesResponse> {
    const qs = this.buildEcomQuery(query);
    return this.get<RevenueSeriesResponse>(
      `${this.baseUrl}/revenue-series?${qs}`,
      'Failed to fetch revenue series'
    );
  }

  async getChannelBreakdown(query: EcommerceAnalyticsQuery): Promise<ChannelBreakdownResponse> {
    const qs = this.buildEcomQuery(query);
    return this.get<ChannelBreakdownResponse>(
      `${this.baseUrl}/channels?${qs}`,
      'Failed to fetch channel breakdown'
    );
  }

  async getTopProducts(query: EcommerceAnalyticsQuery): Promise<TopProductsResponse> {
    const qs = this.buildEcomQuery(query);
    return this.get<TopProductsResponse>(
      `${this.baseUrl}/products?${qs}`,
      'Failed to fetch top products'
    );
  }

  async getFunnel(query: EcommerceAnalyticsQuery): Promise<FunnelResponse> {
    const qs = this.buildEcomQuery(query);
    return this.get<FunnelResponse>(
      `${this.baseUrl}/funnel?${qs}`,
      'Failed to fetch funnel'
    );
  }

  async getRealtimeOrders(): Promise<RealtimeOrdersResponse> {
    return this.get<RealtimeOrdersResponse>(
      `${this.baseUrl}/realtime/orders`,
      'Failed to fetch realtime orders'
    );
  }

  async getLiveVisitors(): Promise<LiveVisitorsResponse> {
    return this.get<LiveVisitorsResponse>(
      `${this.baseUrl}/realtime/visitors`,
      'Failed to fetch live visitors'
    );
  }
}
