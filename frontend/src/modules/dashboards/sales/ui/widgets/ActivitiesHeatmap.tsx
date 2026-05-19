import { HeatmapChart } from '../../../shared/components/HeatmapChart';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { SalesDashboardFilters } from '../../application/hooks/useSalesDashboardFilters';
import { useActivitiesHeatmap } from '../../application/hooks/useSalesAnalytics';
import { useTranslation } from 'react-i18next';
import { SkeletonHeatmap } from '@/shared/ui/components/Skeleton';

export interface ActivitiesHeatmapProps { range: DateRange; filters?: Partial<SalesDashboardFilters> }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, h) => `${h}:00`);

export function ActivitiesHeatmap({ range, filters }: ActivitiesHeatmapProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading, refetch } = useActivitiesHeatmap(range, filters);

  if (isLoading) {
    return <SkeletonHeatmap className="h-full" />;
  }

  return (
    <HeatmapChart
      title={t('sales.widgets.activitiesHeatmap')}
      data={data?.matrix ?? []}
      rowLabels={DAYS}
      colLabels={HOURS}
      colLabelInterval={3}
      colorScheme="blue"
      valueFormatter={(v) => `${v} activities`}
      height={320}
      cellSize="md"
      onRefresh={() => refetch()}
      className="h-full"
    />
  );
}
