/**
 * useExecutiveInsights Hook
 * 
 * Aggregates data from multiple analytics hooks and derives actionable insights.
 * This is the primary consumer-facing hook for the Executive Summary and Risks/Opportunities widgets.
 */

import { useMemo } from 'react';
import type { DateRange } from '../../../shared/utils/dateRange';
import {
  useMrrData,
  useChurnData,
  useTopProductsData,
  useRetentionData,
  useRevenueVsTargetData,
  useMrrMovementsData,
} from './useExecutiveAnalytics';
import {
  generateInsights,
  generateExecutiveSummary,
  computeMrrMovementsSummary,
  computeRevenueGap,
  computeChurnStatus,
  computeProductInsights,
  computeRetentionInsight,
  type ExecutiveInsight,
  type ExecutiveSummary,
  type MrrMovementsSummary,
  type KpiStatus,
  type ProductInsight,
  type RetentionInsight,
} from '../selectors/executiveInsights';

export interface UseExecutiveInsightsResult {
  // Loading state
  isLoading: boolean;
  
  // Summary data
  summary: ExecutiveSummary | null;
  
  // Risks & Opportunities
  risks: ExecutiveInsight[];
  opportunities: ExecutiveInsight[];
  
  // Derived KPI data
  mrrMovementsSummary: MrrMovementsSummary | null;
  revenueGap: ReturnType<typeof computeRevenueGap> | null;
  churnStatus: KpiStatus | null;
  productInsights: ProductInsight[];
  retentionInsight: RetentionInsight | null;
}

export function useExecutiveInsights(range: DateRange, compare: boolean): UseExecutiveInsightsResult {
  // Fetch all required data
  const { data: mrrData, isLoading: mrrLoading } = useMrrData(range, compare);
  const { data: churnData, isLoading: churnLoading } = useChurnData(range, compare);
  const { data: productsData, isLoading: productsLoading } = useTopProductsData(range, 10);
  const { data: retentionData, isLoading: retentionLoading } = useRetentionData(range, compare);
  const { data: revenueData, isLoading: revenueLoading } = useRevenueVsTargetData(range, compare);
  const { data: movementsData, isLoading: movementsLoading } = useMrrMovementsData(range, compare);

  const isLoading = mrrLoading || churnLoading || productsLoading || retentionLoading || revenueLoading || movementsLoading;

  // Compute derived insights
  const insights = useMemo(() => {
    if (isLoading) {
      return {
        summary: null,
        risks: [],
        opportunities: [],
        mrrMovementsSummary: null,
        revenueGap: null,
        churnStatus: null,
        productInsights: [],
        retentionInsight: null,
      };
    }

    const input = {
      mrr: mrrData ?? undefined,
      churn: churnData ?? undefined,
      products: productsData ?? undefined,
      retention: retentionData ?? undefined,
      revenueVsTarget: revenueData ?? undefined,
      mrrMovements: movementsData ?? undefined,
    };

    const { risks, opportunities } = generateInsights(input);
    const summary = generateExecutiveSummary(input);

    return {
      summary,
      risks,
      opportunities,
      mrrMovementsSummary: movementsData ? computeMrrMovementsSummary(movementsData) : null,
      revenueGap: revenueData ? computeRevenueGap(revenueData) : null,
      churnStatus: churnData ? computeChurnStatus(churnData) : null,
      productInsights: productsData ? computeProductInsights(productsData) : [],
      retentionInsight: retentionData ? computeRetentionInsight(retentionData) : null,
    };
  }, [isLoading, mrrData, churnData, productsData, retentionData, revenueData, movementsData]);

  return {
    isLoading,
    ...insights,
  };
}
