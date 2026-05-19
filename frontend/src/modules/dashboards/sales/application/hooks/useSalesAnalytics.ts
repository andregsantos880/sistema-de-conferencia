import { useQuery } from '@tanstack/react-query';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { SalesDashboardFilters } from './useSalesDashboardFilters';
import { useLiveQuery } from '../../../shared/hooks/useLiveQuery';
import { useSalesAnalyticsRepository } from './useSalesAnalyticsRepository';
import type { SalesAnalyticsQuery } from '../../domain/models/SalesAnalytics';

/**
 * Build query object from DateRange and SalesDashboardFilters
 */
function buildQuery(
  range: DateRange, 
  filters?: Partial<SalesDashboardFilters>, 
  limit?: number
): SalesAnalyticsQuery {
  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    team: filters?.team ?? undefined,
    region: filters?.region ?? undefined,
    owner: filters?.owner ?? undefined,
    limit,
  };
}

export function usePipelineStages(range: DateRange, filters?: Partial<SalesDashboardFilters>) {
  const repository = useSalesAnalyticsRepository();
  
  return useQuery({
    queryKey: ['sales', 'pipeline-stages', range.from, range.to, filters],
    queryFn: () => repository.getPipelineStages(buildQuery(range, filters)),
  });
}

export function useForecast(range: DateRange, filters?: Partial<SalesDashboardFilters>) {
  const repository = useSalesAnalyticsRepository();
  
  return useQuery({
    queryKey: ['sales', 'forecast', range.from, range.to, filters],
    queryFn: () => repository.getForecast(buildQuery(range, filters)),
  });
}

export function useWinRate(range: DateRange, filters?: Partial<SalesDashboardFilters>) {
  const repository = useSalesAnalyticsRepository();
  
  return useLiveQuery({
    queryKey: ['sales', 'win-rate', range.from, range.to, filters],
    queryFn: () => repository.getWinRate(buildQuery(range, filters)),
  });
}

export function useDealSize(range: DateRange, filters?: Partial<SalesDashboardFilters>) {
  const repository = useSalesAnalyticsRepository();
  
  return useQuery({
    queryKey: ['sales', 'deal-size', range.from, range.to, filters],
    queryFn: () => repository.getDealSize(buildQuery(range, filters)),
  });
}

export function useCycleLength(range: DateRange, filters?: Partial<SalesDashboardFilters>) {
  const repository = useSalesAnalyticsRepository();
  
  return useQuery({
    queryKey: ['sales', 'cycle-length', range.from, range.to, filters],
    queryFn: () => repository.getCycleLength(buildQuery(range, filters)),
  });
}

export function useRepLeaderboard(range: DateRange, filters?: Partial<SalesDashboardFilters>) {
  const repository = useSalesAnalyticsRepository();
  
  // Explicitly remove owner from the query sent to the backend
  const { owner, ...filtersWithoutRep } = filters ?? {};

  return useQuery({
    queryKey: ['sales', 'rep-leaderboard', range.from, range.to, filtersWithoutRep],
    queryFn: () => repository.getRepLeaderboard(buildQuery(range, filtersWithoutRep)),
  });
}

export function useActivitiesHeatmap(range: DateRange, filters?: Partial<SalesDashboardFilters>) {
  const repository = useSalesAnalyticsRepository();
  
  return useQuery({
    queryKey: ['sales', 'activities-heatmap', range.from, range.to, filters],
    queryFn: () => repository.getActivitiesHeatmap(buildQuery(range, filters)),
  });
}

export function useOpportunitiesAtRisk(range: DateRange, filters?: Partial<SalesDashboardFilters>) {
  const repository = useSalesAnalyticsRepository();
  
  return useQuery({
    queryKey: ['sales', 'opportunities-at-risk', range.from, range.to, filters],
    queryFn: () => repository.getOpportunitiesAtRisk(buildQuery(range, filters)),
  });
}

export function useTopAccounts(range: DateRange, filters?: Partial<SalesDashboardFilters>, limit = 10) {
  const repository = useSalesAnalyticsRepository();
  
  return useQuery({
    queryKey: ['sales', 'top-accounts', range.from, range.to, filters, limit],
    queryFn: () => repository.getTopAccounts(buildQuery(range, filters, limit)),
  });
}
