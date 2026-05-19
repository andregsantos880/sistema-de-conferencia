import { useQuery } from '@tanstack/react-query';
import { useRef, useState, useEffect } from 'react';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useEcommerceAnalyticsRepository } from './useEcommerceAnalyticsRepository';
import type { EcommerceAnalyticsQuery } from '../../domain/models/EcommerceAnalytics';
import type { DashboardFilters } from './useDashboardFilters';

/**
 * Phase 4: Build query object with date range and filters
 */
function buildQuery(range: DateRange, filters?: Partial<DashboardFilters>): EcommerceAnalyticsQuery {
  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    channel: filters?.channel,
    productId: filters?.productId,
    funnelStage: filters?.funnelStage,
    country: filters?.country,
  };
}

/**
 * Phase 4: Create stable filter key for React Query
 * Only includes active filters to avoid unnecessary refetches
 */
function createFilterKey(filters?: Partial<DashboardFilters>) {
  if (!filters) return null;
  return {
    channel: filters.channel !== 'all' ? filters.channel : undefined,
    productId: filters.productId,
    funnelStage: filters.funnelStage,
    country: filters.country,
  };
}

export function useEcomKpis(range: DateRange, filters?: Partial<DashboardFilters>) {
  const repository = useEcommerceAnalyticsRepository();

  return useQuery({
    queryKey: ['ecom', 'kpis', range.from, range.to, createFilterKey(filters)],
    queryFn: () => repository.getKpis(buildQuery(range, filters)),
  });
}

export function useRevenueSeries(range: DateRange, filters?: Partial<DashboardFilters>) {
  const repository = useEcommerceAnalyticsRepository();

  return useQuery({
    queryKey: ['ecom', 'revenue-series', range.from, range.to, createFilterKey(filters)],
    queryFn: () => repository.getRevenueSeries(buildQuery(range, filters)),
  });
}

export function useChannelBreakdown(range: DateRange, filters?: Partial<DashboardFilters>) {
  const repository = useEcommerceAnalyticsRepository();

  return useQuery({
    queryKey: ['ecom', 'channels', range.from, range.to, createFilterKey(filters)],
    queryFn: () => repository.getChannelBreakdown(buildQuery(range, filters)),
  });
}

export function useTopProducts(range: DateRange, filters?: Partial<DashboardFilters>) {
  const repository = useEcommerceAnalyticsRepository();

  // Explicitly remove productId from the query sent to the backend
  const { productId, ...filtersWithoutProduct } = filters ?? {};

  return useQuery({
    queryKey: ['ecom', 'products', range.from, range.to, createFilterKey(filters)],
    queryFn: () => repository.getTopProducts(buildQuery(range, filtersWithoutProduct)),
  });
}

export function useFunnel(range: DateRange, filters?: Partial<DashboardFilters>) {
  const repository = useEcommerceAnalyticsRepository();

  return useQuery({
    queryKey: ['ecom', 'funnel', range.from, range.to, createFilterKey(filters)],
    queryFn: () => repository.getFunnel(buildQuery(range, filters)),
  });
}

// ============================================================================
// Realtime Polling Hooks (used by unified hooks in useRealtimeData.ts)
// ============================================================================

interface RealtimeOrdersOptions {
  maxOrders?: number;
  pollInterval?: number;
  /** Whether the query should be enabled. Set to false to disable polling. */
  enabled?: boolean;
}

/**
 * Realtime orders hook with options object - designed for unified hooks
 * Supports the `enabled` option to conditionally enable/disable polling
 */
export function useRealtimeOrdersWithQuery(options: RealtimeOrdersOptions = {}) {
  const { maxOrders = 20, pollInterval = 5000, enabled = true } = options;
  const repository = useEcommerceAnalyticsRepository();
  
  // Track previous order IDs across fetches
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  
  // State for new order IDs
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  const query = useQuery({
    queryKey: ['ecom', 'realtime-orders', maxOrders],
    queryFn: async () => {
      const response = await repository.getRealtimeOrders();
      return response.orders.slice(0, maxOrders);
    },
    refetchInterval: enabled ? pollInterval : false,
    enabled,
    placeholderData: (previousData) => previousData,
  });

  // Detect new orders using effect
  useEffect(() => {
    if (!query.data || !enabled) return;
    
    const currentIds = new Set(query.data.map(o => o.id));
    
    if (previousOrderIdsRef.current.size > 0) {
      const newIds = new Set<string>();
      query.data.forEach((order) => {
        if (!previousOrderIdsRef.current.has(order.id)) {
          newIds.add(order.id);
        }
      });
      
      if (newIds.size > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync derived state (new order detection) with React Query data
        setNewOrderIds(newIds);
        const timeout = setTimeout(() => setNewOrderIds(new Set()), 2000);
        return () => clearTimeout(timeout);
      }
    }
    
    previousOrderIdsRef.current = currentIds;
  }, [query.data, enabled]);

  return {
    orders: query.data ?? [],
    newOrderIds,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}

interface LiveVisitorsOptions {
  pollInterval?: number;
  /** Whether the query should be enabled. Set to false to disable polling. */
  enabled?: boolean;
}

/**
 * Live visitors hook with options object - designed for unified hooks
 * Supports the `enabled` option to conditionally enable/disable polling
 */
export function useLiveVisitorsWithQuery(options: LiveVisitorsOptions = {}) {
  const { pollInterval = 5000, enabled = true } = options;
  const repository = useEcommerceAnalyticsRepository();
  
  // Track previous count
  const previousCountRef = useRef<number | null>(null);
  
  // State for trend and previous count
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [previousCount, setPreviousCount] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ['ecom', 'live-visitors'],
    queryFn: async () => {
      const response = await repository.getLiveVisitors();
      return response.count;
    },
    refetchInterval: enabled ? pollInterval : false,
    enabled,
    placeholderData: (previousData) => previousData,
  });

  // Calculate trend using effect
  useEffect(() => {
    if (query.data === undefined || !enabled) return;
    
    const newCount = query.data;
    
    if (previousCountRef.current !== null) {
      setPreviousCount(previousCountRef.current);
      
      if (newCount > previousCountRef.current) {
        setTrend('up');
      } else if (newCount < previousCountRef.current) {
        setTrend('down');
      } else {
        setTrend('stable');
      }
      
      if (newCount !== previousCountRef.current) {
        const timeout = setTimeout(() => setTrend('stable'), 1500);
        previousCountRef.current = newCount;
        return () => clearTimeout(timeout);
      }
    }
    
    previousCountRef.current = newCount;
  }, [query.data, enabled]);

  return {
    count: query.data ?? null,
    previousCount,
    trend,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}

