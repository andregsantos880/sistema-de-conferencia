import { KpiCard } from '../../../shared/components/KpiCard';
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/shadcn/components/ui/chart';
import { useForecast, useWinRate, useCycleLength, usePipelineStages } from '../../application/hooks/useSalesAnalytics';
import type { DateRange } from '../../../shared/utils/dateRange';
import type { SalesDashboardFilters } from '../../application/hooks/useSalesDashboardFilters';
import { formatCurrency } from '../../../shared/utils/formatters';
import { CHART_COLORS } from '../../../shared/utils/chartColors';
import { useTranslation } from 'react-i18next';

export interface SalesKpiRailProps {
  range: DateRange;
  filters?: Partial<SalesDashboardFilters>;
  compare: boolean;
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

export function SalesKpiRail({ range, filters, compare }: SalesKpiRailProps) {
  const { t } = useTranslation('dashboards');
  const { data: forecast } = useForecast(range, filters);
  const { data: winRate } = useWinRate(range, filters);
  const { data: cycle } = useCycleLength(range, filters);
  const { data: pipeline } = usePipelineStages(range, filters);
 
  // Build series arrays for KPI values and sparklines
  const forecastSeries = forecast?.series ?? [];
  const commitSeries = forecastSeries.map((p) => p.commit);
  const bestCaseSeries = forecastSeries.map((p) => p.bestCase);
  const closedWonSeries = forecastSeries.map((p) => p.closedWon);

  const pipelineTrend = pipeline?.trend ?? [];
  const pipelineSeries = pipelineTrend.map((p) => p.y);
  const pipelineWeighted = pipeline?.stages.reduce((acc, s) => acc + (s.weighted ?? 0), 0) ?? 0;

  const winRateSeries = winRate?.series?.map((p) => p.y) ?? [];
  const cycleSeries = cycle?.series?.map((d) => d.y) ?? [];

  // Current and previous values for KPI deltas
  const pipelineCurrent = pipelineSeries.at(-1) ?? null;
  const pipelinePrev = pipelineSeries.at(-2) ?? pipelineCurrent;

  const commitCurrent = commitSeries.at(-1) ?? null;
  const commitPrev = commitSeries.at(-2) ?? commitCurrent;

  const bestCaseCurrent = bestCaseSeries.at(-1) ?? null;
  const bestCasePrev = bestCaseSeries.at(-2) ?? bestCaseCurrent;

  const closedCurrent = closedWonSeries.at(-1) ?? null;
  const closedPrev = closedWonSeries.at(-2) ?? closedCurrent;

  const winRateCurrent = winRateSeries.at(-1) ?? 0;
  const winRatePrev = winRateSeries.at(-8) ?? winRateSeries.at(-2) ?? winRateCurrent;

  const cycleCurrent = cycleSeries.at(-1) ?? null;
  const cyclePrev = cycleSeries.at(-8) ?? cycleSeries.at(-2) ?? cycleCurrent;

  // Percent deltas vs previous values
  const pipelineDelta = percentDelta(pipelineCurrent, pipelinePrev);
  const commitDelta = percentDelta(commitCurrent, commitPrev);
  const bestCaseDelta = percentDelta(bestCaseCurrent, bestCasePrev);
  const closedDelta = percentDelta(closedCurrent, closedPrev);
  const winRateDelta = percentDelta(winRateCurrent, winRatePrev);
  const cycleDelta = percentDelta(cycleCurrent, cyclePrev);

  // Trend semantics (cycle uses inverse behavior: lower is better)
  const pipelineTrendDir = trendFromDelta(pipelineDelta);
  const commitTrendDir = trendFromDelta(commitDelta);
  const bestCaseTrendDir = trendFromDelta(bestCaseDelta);
  const closedTrendDir = trendFromDelta(closedDelta);
  const winRateTrendDir = trendFromDelta(winRateDelta);
  const cycleTrendDir = trendFromDelta(cycleDelta, true);

  const kpis: Array<{
    key: string;
    label: string;
    value: string | number;
    color: string;
    spark?: number[];
    delta?: number;
    trend: 'up' | 'down' | 'flat';
    inverseTrend?: boolean;
    formatter?: (value: number) => string;
    suffix?: string;
  }> = [
    {
      key: 'pipeline',
      label: t('sales.kpi.pipeline'),
      value: pipelineWeighted,
      formatter: (v: number) => formatCurrency(v, 'USD', true),
      color: CHART_COLORS.primary,
      spark: pipelineSeries,
      delta: pipelineDelta,
      trend: pipelineTrendDir,
    },
    {
      key: 'commit',
      label: t('sales.kpi.commit'),
      value: commitCurrent ?? 0,
      formatter: (v: number) => formatCurrency(v, 'USD', true),
      color: CHART_COLORS.secondary,
      spark: commitSeries,
      delta: commitDelta,
      trend: commitTrendDir,
    },
    {
      key: 'bestCase',
      label: t('sales.kpi.bestCase'),
      value: bestCaseCurrent ?? 0,
      formatter: (v: number) => formatCurrency(v, 'USD', true),
      color: CHART_COLORS.tertiary,
      spark: bestCaseSeries,
      delta: bestCaseDelta,
      trend: bestCaseTrendDir,
    },
    {
      key: 'closedWon',
      label: t('sales.kpi.closedWon'),
      value: closedCurrent ?? 0,
      formatter: (v: number) => formatCurrency(v, 'USD', true),
      color: CHART_COLORS.success,
      spark: closedWonSeries,
      delta: closedDelta,
      trend: closedTrendDir,
    },
    {
      key: 'winRate',
      label: t('sales.kpi.winRate'),
      value: winRateCurrent * 100,
      suffix: '%',
      formatter: (v: number) => v.toFixed(1),
      color: CHART_COLORS.quaternary,
      spark: winRateSeries,
      delta: winRateDelta,
      trend: winRateTrendDir,
    },
    {
      key: 'cycle',
      label: t('sales.kpi.cycleLength'),
      value: cycleCurrent ?? 0,
      suffix: 'd',
      color: CHART_COLORS.warning,
      spark: cycleSeries,
      delta: cycleDelta,
      trend: cycleTrendDir,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {kpis.map((k) => (
        <KpiCard
          key={k.key}
          label={k.label}
          value={k.value}
          suffix={k.suffix}
          formatter={k.formatter}
          delta={compare ? k.delta : undefined}
          deltaFormat="percent"
          trend={k.trend}
          colorToken={k.color}
          sparkData={k.spark}
          density="spacious"
        />
      ))}
    </div>
  );
}
