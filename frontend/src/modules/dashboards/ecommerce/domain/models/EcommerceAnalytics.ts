/**
 * Domain models for E-commerce Analytics
 */

export interface TimeSeriesPoint {
  x: string;
  y: number;
}

/**
 * Period Range for comparative analytics
 */
export interface PeriodRange {
  from: string;
  to: string;
}

/**
 * Shared Response Contract for all comparative analytics endpoints
 * All analytics endpoints must return data using this shape
 */
export type ComparativeResponse<T> = {
  period: {
    current: PeriodRange;
    previous: PeriodRange;
  };
  data: {
    current: T;
    previous: T;
  };
};

// KPIs
export interface EcomKpisData {
  revenueTotal: number;
  ordersTotal: number;
  averageOrderValue: number;
  conversionRate: number;
  refundRate: number;
  revenueTrend: TimeSeriesPoint[];
  ordersTrend: TimeSeriesPoint[];
  aovTrend: TimeSeriesPoint[];
  conversionTrend: TimeSeriesPoint[];
  refundTrend: TimeSeriesPoint[];
}

export type EcomKpisResponse = ComparativeResponse<EcomKpisData>;

// Revenue Series
export interface RevenueSeriesPoint {
  x: string;
  revenue: number;
  target: number;
}

export interface RevenueSeriesData {
  series: RevenueSeriesPoint[];
}

export type RevenueSeriesResponse = ComparativeResponse<RevenueSeriesData>;

// Channel Breakdown
export interface ChannelData {
  channel: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface ChannelBreakdownData {
  channels: ChannelData[];
}

export type ChannelBreakdownResponse = ComparativeResponse<ChannelBreakdownData>;

// Top Products
export interface ProductData {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  revenue: number;
  orders: number;
  trend: number[];
}

export interface TopProductsData {
  products: ProductData[];
}

export type TopProductsResponse = ComparativeResponse<TopProductsData>;

// Abandonment Funnel
export interface FunnelStep {
  step: string;
  value: number;
  dropoff: number;
}

export interface FunnelData {
  steps: FunnelStep[];
}

export type FunnelResponse = ComparativeResponse<FunnelData>;

// Realtime Order
export interface RealtimeOrder {
  id: string;
  timestamp: string;
  amount: number;
  channel: string;
  country: string;
  countryCode: string;
}

export interface RealtimeOrdersResponse {
  orders: RealtimeOrder[];
  lastUpdated: string;
}

// Live Visitors (Phase 2)
/**
 * Live Visitors Message Contract
 * All Live Visitors updates must conform to this shape regardless of transport (WebSocket or REST)
 * 
 * WebSocket messages are wrapped as: { type: 'LIVE_VISITORS_UPDATE', data: LiveVisitorsMessage }
 * REST responses return LiveVisitorsMessage directly
 */
export interface LiveVisitorsMessage {
  timestamp: number; // Date.now() - moment the count was measured
  count: number; // Current number of active visitors
}

export interface LiveVisitorsResponse {  
  count: number;
  timestamp: number; // Changed from string to number for Phase 2
}

// Query parameters
export interface EcommerceAnalyticsQuery {
  from: string;
  to: string;
  // Phase 4: Filter parameters (optional)
  channel?: string | null;
  productId?: string | null;
  funnelStage?: string | null;
  country?: string | null;
}
