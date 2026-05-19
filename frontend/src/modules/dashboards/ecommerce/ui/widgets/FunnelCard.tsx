import { FunnelChartCard, type FunnelDataItem } from '../../../shared/components/FunnelChartCard';
import { useFunnel } from '../../application/hooks/useEcommerceAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../shared/utils/formatters';
import { useMemo } from 'react';
import type { DashboardFilters } from '../../application/hooks/useDashboardFilters';

import { FunnelSkeleton } from './FunnelSkeleton';

export interface FunnelCardProps {
  range: DateRange;
  /** Phase 3: Selected funnel stage for filtering */
  selectedStage?: string | null;
  /** Phase 3: Handler for stage selection */
  onStageSelect?: (stage: string | null) => void;
  filters?: Partial<DashboardFilters>;
}

export function FunnelCard({ range, selectedStage, onStageSelect, filters }: FunnelCardProps) {
  const { t } = useTranslation('dashboards');
  
  // Funnel should NOT filter by funnelStage (it shows all stages)
  // Only pass other filters like channel
  const funnelFilters = useMemo(() => {
    if (!filters) return undefined;
    const { funnelStage, ...rest } = filters;
    return rest;
  }, [filters]);
  
  const { data, isLoading, refetch } = useFunnel(range, funnelFilters);

  if (isLoading || !data) {
    return <FunnelSkeleton />;
  }

  // Extract current data from comparative response
  const steps = data.data.current.steps;

  // Transform data to FunnelChartCard format
  const chartData: FunnelDataItem[] = steps.map((step) => ({
    name: step.step,
    value: step.value,
    dropoff: step.dropoff,
  }));

  // Calculate overall conversion rate
  const conversionRate = steps.length > 0
    ? ((steps[steps.length - 1]?.value / steps[0]?.value) * 100).toFixed(2)
    : '0';

  return (
    <FunnelChartCard
      title={t('ecommerce.widgets.funnel')}
      data={chartData}
      valueFormatter={(v) => formatNumber(v)}
      height={300}
      labelPosition="right"
      onRefresh={() => refetch()}
      onSegmentClick={(item) => {
        // Toggle: if clicking selected stage, clear filter; otherwise set new filter
        if (onStageSelect && item) {
          onStageSelect(selectedStage === item.name ? null : item.name);
        }
      }}
      selectedStage={selectedStage}
      className="h-full"
    >
      {/* Summary */}
      <div className="mt-4 rounded-lg bg-muted/50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Overall Conversion</span>
          <span className="text-lg font-bold text-primary">
            {conversionRate}%
          </span>
        </div>
      </div>
    </FunnelChartCard>
  );
}
