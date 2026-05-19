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
} from '../models/SalesAnalytics';

/**
 * Repository interface for Sales Analytics data
 */
export interface ISalesAnalyticsRepository {
  getPipelineStages(query: SalesAnalyticsQuery): Promise<PipelineStagesResponse>;
  getForecast(query: SalesAnalyticsQuery): Promise<ForecastResponse>;
  getWinRate(query: SalesAnalyticsQuery): Promise<WinRateResponse>;
  getDealSize(query: SalesAnalyticsQuery): Promise<DealSizeResponse>;
  getCycleLength(query: SalesAnalyticsQuery): Promise<CycleLengthResponse>;
  getRepLeaderboard(query: SalesAnalyticsQuery): Promise<RepLeaderboardResponse>;
  getActivitiesHeatmap(query: SalesAnalyticsQuery): Promise<ActivitiesHeatmapResponse>;
  getOpportunitiesAtRisk(query: SalesAnalyticsQuery): Promise<OpportunitiesAtRiskResponse>;
  getTopAccounts(query: SalesAnalyticsQuery): Promise<TopAccountsResponse>;
  getSalesLocations(query: SalesAnalyticsQuery): Promise<SalesLocationsResponse>;
}
