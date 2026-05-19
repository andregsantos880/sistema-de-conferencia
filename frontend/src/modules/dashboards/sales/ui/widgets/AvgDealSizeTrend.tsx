import { TrendCard } from '../../../shared/components/TrendCard';
import { useDealSize } from '../../application/hooks/useSalesAnalytics';
import { useTranslation } from 'react-i18next';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { SalesDashboardFilters } from '../../application/hooks/useSalesDashboardFilters';
import { formatCurrency } from '../../../shared/utils/formatters';

export interface AvgDealSizeTrendProps { range: DateRange; filters?: Partial<SalesDashboardFilters>; compare: boolean }

export function AvgDealSizeTrend({ range, filters, compare }: AvgDealSizeTrendProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading, refetch } = useDealSize(range, filters);

  if (isLoading || !data) {
    return <div className="h-[300px] rounded-lg border bg-card p-6 flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const series = [{ name: 'Avg Deal Size', data: data.series }];
  const compareSeries = compare ? [{ name: 'Previous', data: data.series.map((d) => ({ x: d.x, y: Math.max(0, d.y * 0.9) })) }] : undefined;

  return (
    <TrendCard
      title={t('sales.widgets.avgDealSize')}
      series={series}
      compareSeries={compareSeries}
      yFormatter={(v) => formatCurrency(v as number, 'USD', true)}
      type="area"
      height={300}
      onRefresh={() => refetch()}
    />
  );
}
