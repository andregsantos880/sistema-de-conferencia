import { KpiCard } from '../../../shared/components/KpiCard';
import { useEcomKpis } from '../../application/hooks/useEcommerceAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import { formatCurrency } from '../../../shared/utils/formatters';
import { CHART_COLORS } from '../../../shared/utils/chartColors';
import { useTranslation } from 'react-i18next';
import { SkeletonKpiCard } from '@/shared/ui/components/Skeleton';
import type { DashboardFilters } from '../../application/hooks/useDashboardFilters';

export interface EcomKpiRailProps {
  range: DateRange;
  compare: boolean;
  filters?: Partial<DashboardFilters>;
}

function percentDelta(current?: number | null, previous?: number | null): number | undefined {
  if (current == null || previous == null || previous === 0) return undefined;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function trendFromDelta(delta: number | undefined, inverse = false): 'up' | 'down' | 'flat' {
  if (delta == null || Math.abs(delta) < 0.01) return 'flat';
  const isPositive = delta > 0;
  const upIsGood = !inverse;
  const goodDirection = upIsGood ? isPositive : !isPositive;
  return goodDirection ? 'up' : 'down';
}

export function EcomKpiRail({ range, compare, filters }: EcomKpiRailProps) {
  const { t } = useTranslation('dashboards');
  const { data: response, isLoading } = useEcomKpis(range, filters);

  if (isLoading || !response) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>
    );
  }

  // Extract current and previous data from comparative response
  const current = response?.data.current;
  const previous = response?.data.previous;

  // Extract series for sparklines (current period only)
  const revenueSeries = current?.revenueTrend?.map((p) => p.y) ?? [];
  const ordersSeries = current?.ordersTrend?.map((p) => p.y) ?? [];
  const aovSeries = current?.aovTrend?.map((p) => p.y) ?? [];
  const conversionSeries = current?.conversionTrend?.map((p) => p.y) ?? [];
  const refundSeries = current?.refundTrend?.map((p) => p.y) ?? [];

  // Current values
  const revenueCurrent = current?.revenueTotal ?? 0;
  const ordersCurrent = current?.ordersTotal ?? 0;
  const aovCurrent = current?.averageOrderValue ?? 0;
  const conversionCurrent = current?.conversionRate ?? 0;
  const refundCurrent = current?.refundRate ?? 0;

  // Previous values
  const revenuePrev = previous?.revenueTotal ?? revenueCurrent;
  const ordersPrev = previous?.ordersTotal ?? ordersCurrent;
  const aovPrev = previous?.averageOrderValue ?? aovCurrent;
  const conversionPrev = previous?.conversionRate ?? conversionCurrent;
  const refundPrev = previous?.refundRate ?? refundCurrent;

  // Deltas - only calculate when compare mode is enabled
  const revenueDelta = compare ? percentDelta(revenueCurrent, revenuePrev) : undefined;
  const ordersDelta = compare ? percentDelta(ordersCurrent, ordersPrev) : undefined;
  const aovDelta = compare ? percentDelta(aovCurrent, aovPrev) : undefined;
  const conversionDelta = compare ? percentDelta(conversionCurrent, conversionPrev) : undefined;
  const refundDelta = compare ? percentDelta(refundCurrent, refundPrev) : undefined;

  // Trends (refund is inverse - lower is better)
  const revenueTrend = trendFromDelta(revenueDelta);
  const ordersTrend = trendFromDelta(ordersDelta);
  const aovTrend = trendFromDelta(aovDelta);
  const conversionTrend = trendFromDelta(conversionDelta);
  const refundTrend = trendFromDelta(refundDelta, true);

  // Build tooltip text when compare is enabled
  const buildTooltip = (
    currentValue: number,
    previousValue: number,
    formatter: (v: number) => string,
    suffix?: string
  ) => {
    if (!compare) return undefined;
    
    const delta = percentDelta(currentValue, previousValue);
    const deltaText = delta !== undefined ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%` : 'N/A';
    
    return `Current: ${formatter(currentValue)}${suffix || ''}\nPrevious: ${formatter(previousValue)}${suffix || ''}\nChange: ${deltaText}`;
  };

  const kpiCards = [
    {
      key: 'revenue',
      label: t('ecommerce.kpi.revenue'),
      value: revenueCurrent,
      formatter: (v: number) => formatCurrency(v, 'USD', true),
      color: CHART_COLORS.primary,
      spark: revenueSeries,
      delta: revenueDelta,
      trend: revenueTrend,
      tooltip: buildTooltip(
        revenueCurrent,
        revenuePrev,
        (v) => formatCurrency(v, 'USD', false)
      ),
    },
    {
      key: 'orders',
      label: t('ecommerce.kpi.orders'),
      value: ordersCurrent,
      formatter: (v: number) => v.toLocaleString(),
      color: CHART_COLORS.secondary,
      spark: ordersSeries,
      delta: ordersDelta,
      trend: ordersTrend,
      tooltip: buildTooltip(
        ordersCurrent,
        ordersPrev,
        (v) => v.toLocaleString()
      ),
    },
    {
      key: 'aov',
      label: t('ecommerce.kpi.aov'),
      value: aovCurrent,
      formatter: (v: number) => formatCurrency(v, 'USD', true),
      color: CHART_COLORS.tertiary,
      spark: aovSeries,
      delta: aovDelta,
      trend: aovTrend,
      tooltip: buildTooltip(
        aovCurrent,
        aovPrev,
        (v) => formatCurrency(v, 'USD', false)
      ),
    },
    {
      key: 'conversion',
      label: t('ecommerce.kpi.conversion'),
      value: conversionCurrent,
      suffix: '%',
      formatter: (v: number) => v.toFixed(2),
      color: CHART_COLORS.quaternary,
      spark: conversionSeries,
      delta: conversionDelta,
      trend: conversionTrend,
      tooltip: buildTooltip(
        conversionCurrent,
        conversionPrev,
        (v) => v.toFixed(2),
        '%'
      ),
    },
    {
      key: 'refunds',
      label: t('ecommerce.kpi.refunds'),
      value: refundCurrent,
      suffix: '%',
      formatter: (v: number) => v.toFixed(2),
      color: CHART_COLORS.warning,
      spark: refundSeries,
      delta: refundDelta,
      trend: refundTrend,
      inverseTrend: true,
      tooltip: buildTooltip(
        refundCurrent,
        refundPrev,
        (v) => v.toFixed(2),
        '%'
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {kpiCards.map((k) => (
        <KpiCard
          key={k.key}
          label={k.label}
          value={k.value}
          suffix={k.suffix}
          formatter={k.formatter}
          delta={k.delta}
          deltaFormat="percent"
          trend={k.trend}
          inverseTrend={k.inverseTrend}
          colorToken={k.color}
          sparkData={k.spark}
          density="spacious"
          tooltip={k.tooltip}
        />
      ))}
    </div>
  );
}
