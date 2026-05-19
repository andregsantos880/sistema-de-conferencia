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
} from '../models/ExecutiveAnalytics';

/**
 * Repository interface for Executive Analytics data
 */
export interface IExecutiveAnalyticsRepository {
  getMrr(query: ExecutiveAnalyticsQuery): Promise<MrrData>;
  getRevenueVsTarget(query: ExecutiveAnalyticsQuery): Promise<RevenueVsTargetData>;
  getChurn(query: ExecutiveAnalyticsQuery): Promise<ChurnData>;
  getMrrMovements(query: ExecutiveAnalyticsQuery): Promise<MrrMovementsData>;
  getCohortRetention(query: ExecutiveAnalyticsQuery): Promise<CohortRetentionData>;
  getRetention(query: ExecutiveAnalyticsQuery): Promise<RetentionData>;
  getRegions(query: ExecutiveAnalyticsQuery): Promise<RegionData>;
  getTopProducts(query: ExecutiveAnalyticsQuery): Promise<TopProductsData>;
  getPipelineFunnel(query: ExecutiveAnalyticsQuery): Promise<PipelineFunnelData>;
  getNps(query: ExecutiveAnalyticsQuery): Promise<NpsData>;
  getActiveCustomers(query: ExecutiveAnalyticsQuery): Promise<ActiveCustomersData>;
  getLtvCac(query: ExecutiveAnalyticsQuery): Promise<LtvCacData>;
}
