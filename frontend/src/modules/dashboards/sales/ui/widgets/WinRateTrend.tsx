import { TrendCard } from '../../../shared/components/TrendCard';
import { useWinRate } from '../../application/hooks/useSalesAnalytics';
import { useTranslation } from 'react-i18next';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { SalesDashboardFilters } from '../../application/hooks/useSalesDashboardFilters';

export interface WinRateTrendProps { range: DateRange; filters?: Partial<SalesDashboardFilters>; compare: boolean }

export function WinRateTrend({ range, filters, compare }: WinRateTrendProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading, refetch } = useWinRate(range, filters);

  if (isLoading || !data) {
    return <div className="h-[300px] rounded-lg border bg-card p-6 flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const series = [{ name: 'Win Rate', data: data.series }];
  const compareSeries = compare ? [{ name: 'Previous Win Rate', data: data.series.map((d) => ({ x: d.x, y: Math.max(0, d.y - 0.03) })) }] : undefined;

  return (
    <TrendCard
      title={t('sales.widgets.winRate')}
      series={series}
      compareSeries={compareSeries}
      yFormatter={(v) => `${((v as number) * 100).toFixed(1)}%`}
      type="area"
      height={300}
      onRefresh={() => refetch()}
    />
  );
}
