import { FunnelChartCard, type FunnelDataItem } from '../../../shared/components/FunnelChartCard';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { SalesDashboardFilters } from '../../application/hooks/useSalesDashboardFilters';
import { usePipelineStages } from '../../application/hooks/useSalesAnalytics';
import { useTranslation } from 'react-i18next';
import { SkeletonFunnel } from '@/shared/ui/components/Skeleton';

export interface PipelineFunnelProps {
  range: DateRange;
  filters?: Partial<SalesDashboardFilters>;
  /** Currently selected stage for visual emphasis */
  selectedStage?: string | null;
  /** Callback when a stage is clicked */
  onStageClick?: (stage: string | null) => void;
}

export function PipelineFunnel({ range, filters, selectedStage, onStageClick }: PipelineFunnelProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading, refetch } = usePipelineStages(range, filters);

  // Transform data to FunnelDataItem format
  const funnelData: FunnelDataItem[] = data?.stages.map((s) => ({
    name: s.name,
    value: s.weighted,
  })) ?? [];

  const handleSegmentClick = (item: FunnelDataItem | null) => {
    if (onStageClick) {
      // Toggle: if clicking selected stage, clear; otherwise set new stage
      onStageClick(item?.name === selectedStage ? null : item?.name ?? null);
    }
  };

  if (isLoading) {
    return <SkeletonFunnel className="h-full" />;
  }

  return (
    <FunnelChartCard
      title={t('sales.widgets.pipelineFunnel')}
      data={funnelData}
      height={320}
      showLabels
      labelPosition="right"
      onSegmentClick={handleSegmentClick}
      selectedStage={selectedStage}
      onRefresh={() => refetch()}
      className="h-full"
    />
  );
}
