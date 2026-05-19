/**
 * Domain models for Executive Analytics
 */

export interface MrrData {
  current: number;
  delta: number;
  series: Array<{ x: string; y: number }>;
  previous?: {
    series: Array<{ x: string; y: number }>;
    value: number;
  };
}

export interface RevenueVsTargetData {
  series: Array<{
    name: string;
    data: Array<{ x: string; y: number }>;
  }>;
  previous?: {
    revenue: Array<{ x: string; y: number }>;
    target: Array<{ x: string; y: number }>;
  };
}

export interface ChurnData {
  current: number;
  delta: number;
  series: Array<{ x: string; y: number }>;
  previous?: {
    series: Array<{ x: string; y: number }>;
    value: number;
  };
}

export interface CohortRetentionData {
  cohorts: Array<{
    cohort: string;
    data: number[];
  }>;
}

export interface MrrMovementsPoint {
  x: string;
  new: number;
  expansion: number;
  contraction: number;
  churn: number;
  net: number;
}

export interface MrrMovementsData {
  current: MrrMovementsPoint[];
  previous?: MrrMovementsPoint[];
}

export interface RetentionPoint {
  x: string;
  retention: number;
  churned: number;
}

export interface RetentionData {
  headline: number;
  delta: number;
  series: RetentionPoint[];
  previous?: {
    headline: number;
    series: RetentionPoint[];
  };
}

export interface RegionData {
  regions: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    growth: number;
  }>;
}

export interface TopProductsData {
  products: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    grossMargin: number;
    spark: number[];
  }>;
}

export interface PipelineFunnelData {
  stages: Array<{
    label: string;
    value: number;
    conversion: number;
  }>;
}

export interface NpsData {
  current: number;
  delta: number;
  series: Array<{ x: string; y: number }>;
  distribution: {
    promoters: number;
    passives: number;
    detractors: number;
  };
}

export interface ActiveCustomersData {
  current: number;
  delta: number;
  series: Array<{ x: string; y: number }>;
  previous?: {
    series: Array<{ x: string; y: number }>;
    value: number;
  };
}

export interface LtvCacData {
  ltv: number;
  cac: number;
  ratio: number;
  previous?: {
    ltv: number;
    cac: number;
    ratio: number;
  };
}

/**
 * Query parameters for executive analytics endpoints
 */
export interface ExecutiveAnalyticsQuery {
  from?: string;
  to?: string;
  compare?: boolean;
  limit?: number;
}
