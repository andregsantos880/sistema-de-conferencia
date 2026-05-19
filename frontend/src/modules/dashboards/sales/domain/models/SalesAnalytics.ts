/**
 * Domain models for Sales Analytics
 */

export interface PipelineStage {
  name: string;
  count: number;
  value: number;
  weighted: number;
}

export interface PipelineStagesResponse {
  stages: PipelineStage[];
  /**
   * Daily total weighted pipeline value over the requested date range
   */
  trend: TimeSeriesDataPoint[];
}

export interface ForecastDataPoint {
  x: string;
  target: number;
  bestCase: number;
  commit: number;
  closedWon: number;
}

export interface ForecastResponse {
  series: ForecastDataPoint[];
}

export interface TimeSeriesDataPoint {
  x: string;
  y: number;
}

export interface WinRateResponse {
  series: TimeSeriesDataPoint[];
  current: number;
  previous: {
    value: number;
  };
}

export interface DealSizeResponse {
  series: TimeSeriesDataPoint[];
}

export interface CycleLengthResponse {
  series: TimeSeriesDataPoint[];
}

export interface SalesRep {
  id: string;
  name: string;
  revenue: number;
  wonDeals: number;
  avgDealSize: number;
  quotaAttainment: number;
  spark: number[];
}

export interface RepLeaderboardResponse {
  reps: SalesRep[];
}

export interface ActivitiesHeatmapResponse {
  matrix: number[][];
}

export type RiskScore = 'Low' | 'Medium' | 'High';

export interface OpportunityAtRisk {
  id: string;
  account: string;
  amount: number;
  stage: string;
  probability: number;
  lastActivityDays: number;
  closeDate: string;
  riskScore: RiskScore;
}

export interface OpportunitiesAtRiskResponse {
  opportunities: OpportunityAtRisk[];
}

export interface TopAccount {
  id: string;
  account: string;
  owner: string;
  region: string;
  pipeline: number;
  lastTouch: string;
  health: string;
}

export interface TopAccountsResponse {
  accounts: TopAccount[];
}

export interface SalesLocation {
  id: string;
  countryCode: string;
  countryName: string;
  lat: number;
  lng: number;
  orders: number;
  revenue: number;
}

export interface SalesLocationsResponse {
  locations: SalesLocation[];
}

/**
 * Query parameters for sales analytics endpoints
 */
export interface SalesAnalyticsQuery {
  from: string;
  to: string;
  team?: string;
  region?: string;
  owner?: string;
  limit?: number;
}
