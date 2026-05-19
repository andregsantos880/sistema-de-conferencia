import type {
  EcomKpisResponse,
  RevenueSeriesResponse,
  ChannelBreakdownResponse,
  TopProductsResponse,
  FunnelResponse,
  RealtimeOrdersResponse,
  LiveVisitorsResponse,
  EcommerceAnalyticsQuery,
} from '../models/EcommerceAnalytics';

export interface IEcommerceAnalyticsRepository {
  getKpis(query: EcommerceAnalyticsQuery): Promise<EcomKpisResponse>;
  getRevenueSeries(query: EcommerceAnalyticsQuery): Promise<RevenueSeriesResponse>;
  getChannelBreakdown(query: EcommerceAnalyticsQuery): Promise<ChannelBreakdownResponse>;
  getTopProducts(query: EcommerceAnalyticsQuery): Promise<TopProductsResponse>;
  getFunnel(query: EcommerceAnalyticsQuery): Promise<FunnelResponse>;
  getRealtimeOrders(): Promise<RealtimeOrdersResponse>;
  getLiveVisitors(): Promise<LiveVisitorsResponse>;
}
