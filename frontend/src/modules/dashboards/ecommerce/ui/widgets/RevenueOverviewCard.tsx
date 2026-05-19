import { TrendCard, type ChartSeries } from '../../../shared/components/TrendCard';
import { useRevenueSeries } from '../../application/hooks/useEcommerceAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../shared/utils/formatters';
import { useMemo } from 'react';
import type { DashboardFilters } from '../../application/hooks/useDashboardFilters';

import { RevenueOverviewSkeleton } from './RevenueOverviewSkeleton';

export interface RevenueOverviewCardProps {
  range: DateRange;
  compare: boolean;
  filters?: Partial<DashboardFilters>;
}

export function RevenueOverviewCard({ range, compare, filters }: RevenueOverviewCardProps) {
  const { t } = useTranslation('dashboards');
  const { data: response, isLoading, refetch } = useRevenueSeries(range, filters);

  const chartData = useMemo(() => {
    if (!response) return null;

    const current = response.data.current;
    const previous = response.data.previous;

    // Always prepare current series (Revenue and Target)
    const series: ChartSeries[] = [
      {
        name: 'Revenue',
        data: current.series.map((point) => ({ x: point.x, y: point.revenue })),
      },
      {
        name: 'Target',
        data: current.series.map((point) => ({ x: point.x, y: point.target })),
      },
    ];

    // Add previous series when compare mode is enabled
    const compareSeries: ChartSeries[] | undefined = compare
      ? [
          {
            name: 'Previous Revenue',
            data: previous.series.map((point) => ({ x: point.x, y: point.revenue })),
          },
        ]
      : undefined;

    return { series, compareSeries };
  }, [response, compare]);

  if (isLoading || !chartData) {
    return <RevenueOverviewSkeleton />;
  }

  return (
    <TrendCard
      title={t('ecommerce.widgets.revenue')}
      series={chartData.series}
      compareSeries={chartData.compareSeries}
      yFormatter={(v) => formatCurrency(v, 'USD', true)}
      type="area"
      height={310}
      dashedSeries={['Target']}
      onRefresh={() => refetch()}
      className="h-full"
    />
  );
}
