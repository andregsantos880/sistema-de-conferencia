import { TrendCard } from '../../../shared/components/TrendCard';
import { useRevenueVsTargetData } from '../../application/hooks/useExecutiveAnalytics';
import { formatCurrency } from '../../../shared/utils/formatters';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { computeRevenueGap } from '../../application/selectors/executiveInsights';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';

export interface RevenueVsTargetCardProps {
  range: DateRange;
  compare: boolean;
}

export function RevenueVsTargetCard({ range, compare }: RevenueVsTargetCardProps) {
  const { t } = useTranslation('dashboards');
  const { data, isLoading, refetch } = useRevenueVsTargetData(range, compare);

  // Compute gap data
  const gapData = useMemo(() => {
    if (!data) return null;
    return computeRevenueGap(data);
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="col-span-full h-[400px] rounded-lg border bg-card p-6">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  const compareSeries = compare && data.previous ? [
    { name: 'Previous Revenue', data: data.previous.revenue },
    { name: 'Previous Target', data: data.previous.target },
  ] : undefined;

  // Build gap label element
  const gapLabel = gapData ? (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Performance:</span>
      <div className={cn(
        'flex items-center gap-1 text-sm font-semibold',
        gapData.gap >= 0 ? 'text-emerald-500' : 'text-rose-500'
      )}>
        {gapData.gap >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        <span>
          {gapData.gap >= 0 ? '+' : ''}{formatCurrency(gapData.gap, 'USD', true)} ({gapData.gapPercent >= 0 ? '+' : ''}{gapData.gapPercent.toFixed(1)}%)
        </span>
        <span className="text-muted-foreground font-normal">
          {gapData.gap >= 0 ? 'above' : 'below'} target
        </span>
      </div>
    </div>
  ) : null;

  return (
    <TrendCard
      title={t('widgets.revenueVsTarget')}
      subtitle={gapLabel}
      series={data.series}
      compareSeries={compareSeries}
      yFormatter={(value) => formatCurrency(value, 'USD', true)}
      type="area"
      showLegend={true}
      showGrid={true}
      height={340}
      onRefresh={() => refetch()}
      dashedSeries={['Target']}
      className="col-span-full lg:col-span-8"
    />
  );
}

