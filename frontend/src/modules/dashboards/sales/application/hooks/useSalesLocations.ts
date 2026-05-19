import { useQuery } from '@tanstack/react-query';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { SalesDashboardFilters } from './useSalesDashboardFilters';
import { useSalesAnalyticsRepository } from './useSalesAnalyticsRepository';
import type { SalesAnalyticsQuery, SalesLocationsResponse } from '../../domain/models/SalesAnalytics';

function buildQuery(range: DateRange, filters?: Partial<SalesDashboardFilters>): SalesAnalyticsQuery {
  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    team: filters?.team ?? undefined,
    region: filters?.region ?? undefined,
    owner: filters?.owner ?? undefined,
  };
}

export function useSalesLocations(range: DateRange, filters?: Partial<SalesDashboardFilters>) {
  const repository = useSalesAnalyticsRepository();

  return useQuery<SalesLocationsResponse>({
    queryKey: ['sales', 'locations', range.from, range.to, filters],
    queryFn: () => repository.getSalesLocations(buildQuery(range, filters)),
  });
}
