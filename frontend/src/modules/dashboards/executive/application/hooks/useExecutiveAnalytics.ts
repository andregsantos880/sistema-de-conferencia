import { useLiveQuery } from '../../../shared/hooks/useLiveQuery';
import { useQuery } from '@tanstack/react-query';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useExecutiveAnalyticsRepository } from './useExecutiveAnalyticsRepository';
import type { ExecutiveAnalyticsQuery } from '../../domain/models/ExecutiveAnalytics';

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

function buildQuery(range: DateRange, compare: boolean): ExecutiveAnalyticsQuery {
  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    compare,
  };
}

export function useMrrData(range: DateRange, compare: boolean) {
  const repository = useExecutiveAnalyticsRepository();

  return useLiveQuery<MrrData>({
    queryKey: ['analytics', 'executive', 'mrr', range.from, range.to, compare],
    queryFn: () => repository.getMrr(buildQuery(range, compare)),
  });
}

export function useRevenueVsTargetData(range: DateRange, compare: boolean) {
  const repository = useExecutiveAnalyticsRepository();

  return useLiveQuery<RevenueVsTargetData>({
    queryKey: ['analytics', 'executive', 'revenue-vs-target', range.from, range.to, compare],
    queryFn: () => repository.getRevenueVsTarget(buildQuery(range, compare)),
  });
}

export function useChurnData(range: DateRange, compare: boolean) {
  const repository = useExecutiveAnalyticsRepository();

  return useLiveQuery<ChurnData>({
    queryKey: ['analytics', 'executive', 'churn', range.from, range.to, compare],
    queryFn: () => repository.getChurn(buildQuery(range, compare)),
  });
}

export function useMrrMovementsData(range: DateRange, compare: boolean) {
  const repository = useExecutiveAnalyticsRepository();

  return useLiveQuery<MrrMovementsData>({
    queryKey: ['analytics', 'executive', 'mrr-movements', range.from, range.to, compare],
    queryFn: () => repository.getMrrMovements(buildQuery(range, compare)),
  });
}

export function useCohortRetentionData(range: DateRange) {
  const repository = useExecutiveAnalyticsRepository();

  return useQuery<CohortRetentionData>({
    queryKey: ['analytics', 'executive', 'cohort-retention', range.from, range.to],
    queryFn: () => repository.getCohortRetention(buildQuery(range, false)),
  });
}

export function useRetentionData(range: DateRange, compare: boolean) {
  const repository = useExecutiveAnalyticsRepository();

  return useLiveQuery<RetentionData>({
    queryKey: ['analytics', 'executive', 'retention', range.from, range.to, compare],
    queryFn: () => repository.getRetention(buildQuery(range, compare)),
  });
}

export function useRegionData(range: DateRange) {
  const repository = useExecutiveAnalyticsRepository();

  return useQuery<RegionData>({
    queryKey: ['analytics', 'executive', 'regions', range.from, range.to],
    queryFn: () => repository.getRegions(buildQuery(range, false)),
  });
}

export function useTopProductsData(range: DateRange, limit: number = 10) {
  const repository = useExecutiveAnalyticsRepository();

  return useQuery<TopProductsData>({
    queryKey: ['analytics', 'executive', 'top-products', range.from, range.to, limit],
    queryFn: () => repository.getTopProducts({ ...buildQuery(range, false), limit }),
  });
}

export function usePipelineFunnelData(range: DateRange) {
  const repository = useExecutiveAnalyticsRepository();

  return useQuery<PipelineFunnelData>({
    queryKey: ['analytics', 'executive', 'pipeline-funnel', range.from, range.to],
    queryFn: () => repository.getPipelineFunnel(buildQuery(range, false)),
  });
}

export function useNpsData(range: DateRange) {
  const repository = useExecutiveAnalyticsRepository();

  return useLiveQuery<NpsData>({
    queryKey: ['analytics', 'executive', 'nps', range.from, range.to],
    queryFn: () => repository.getNps(buildQuery(range, false)),
  });
}

export function useActiveCustomersData(range: DateRange, compare: boolean) {
  const repository = useExecutiveAnalyticsRepository();

  return useLiveQuery<ActiveCustomersData>({
    queryKey: ['analytics', 'executive', 'active-customers', range.from, range.to, compare],
    queryFn: () => repository.getActiveCustomers(buildQuery(range, compare)),
  });
}

export function useLtvCacData(compare: boolean) {
  const repository = useExecutiveAnalyticsRepository();

  return useQuery<LtvCacData>({
    queryKey: ['analytics', 'executive', 'ltv-cac', compare],
    queryFn: () => repository.getLtvCac({ compare }),
  });
}
