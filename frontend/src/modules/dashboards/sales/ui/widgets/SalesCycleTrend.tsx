import { TrendCard } from '../../../shared/components/TrendCard';
import { useCycleLength } from '../../application/hooks/useSalesAnalytics';
import { useTranslation } from 'react-i18next';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { SalesDashboardFilters } from '../../application/hooks/useSalesDashboardFilters';

export interface SalesCycleTrendProps { range: DateRange; filters?: Partial<SalesDashboardFilters>; compare: boolean }

export function SalesCycleTrend({ range, filters, compare }: SalesCycleTrendProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading, refetch } = useCycleLength(range, filters);

  if (isLoading || !data) {
    return <div className="h-[300px] rounded-lg border bg-card p-6 flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const series = [{ name: 'Sales Cycle', data: data.series }];
  const compareSeries = compare ? [{ name: 'Previous', data: data.series.map((d) => ({ x: d.x, y: Math.max(0, (d.y as number) + 3) })) }] : undefined;

  return (
    <TrendCard
      title={t('sales.widgets.cycleLength')}
      series={series}
      compareSeries={compareSeries}
      yFormatter={(v) => `${v}d`}
      type="area"
      height={300}
      onRefresh={() => refetch()}
    />
  );
}
