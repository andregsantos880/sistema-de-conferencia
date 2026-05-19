import { http, delay } from 'msw';
import { subDays, subMonths, format, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { ok } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';

/**
 * Seed generator for consistent mock data based on date range
 */
function generateSeed(date: Date, metric: string): number {
  const dateStr = format(date, 'yyyy-MM-dd');
  let hash = 0;
  const str = `${dateStr}-${metric}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateValue(date: Date, metric: string, base: number, variance: number): number {
  const seed = generateSeed(date, metric);
  const random = (seed % 1000) / 1000;
  return base + (random - 0.5) * variance;
}

function generateTimeSeries(from: Date, to: Date, metric: string, base: number, variance: number, trend: number = 0) {
  const days = eachDayOfInterval({ start: from, end: to });
  return days.map((date, idx) => {
    const trendValue = (idx / days.length) * trend;
    return {
      x: date.toISOString(),
      y: Math.max(0, generateValue(date, metric, base + trendValue, variance)),
    };
  });
}

export const executiveHandlers = [
  // GET analytics/executive/mrr
  http.get(api('/analytics/executive/mrr'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const compare = url.searchParams.get('compare') === 'true';

    const fromDate = from ? new Date(from) : subDays(new Date(), 30);
    const toDate = to ? new Date(to) : new Date();

    const series = generateTimeSeries(fromDate, toDate, 'mrr', 125000, 15000, 5000);
    const current = series[series.length - 1].y;
    const previous = series[0].y;
    const delta = ((current - previous) / previous) * 100;

    let previousData = null;
    if (compare) {
      const duration = toDate.getTime() - fromDate.getTime();
      const prevFrom = new Date(fromDate.getTime() - duration);
      const prevTo = new Date(toDate.getTime() - duration);
      previousData = {
        series: generateTimeSeries(prevFrom, prevTo, 'mrr', 115000, 12000, 3000),
        value: 115000,
      };
    }

    return ok({
      current: Math.round(current),
      delta: parseFloat(delta.toFixed(2)),
      series,
      previous: previousData,
    });
  }),

  // GET dash/exec/mrr-movements
  http.get(api('/analytics/executive/mrr-movements'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const compare = url.searchParams.get('compare') === 'true';

    const fromDate = from ? new Date(from) : subDays(new Date(), 30);
    const toDate = to ? new Date(to) : new Date();

    const days = eachDayOfInterval({ start: fromDate, end: toDate });

    const buildSeries = (offset: number) =>
      days.map((date, idx) => {
        const progress = days.length > 1 ? idx / (days.length - 1) : 0;

        const newMrr = Math.max(0, generateValue(date, `mrr-new-${offset}`, 9000 + progress * 4000, 4000));
        const expansion = Math.max(0, generateValue(date, `mrr-exp-${offset}`, 3500 + progress * 2500, 2500));
        const contraction = -Math.max(0, generateValue(date, `mrr-ctr-${offset}`, 1800, 1200));
        const churn = -Math.max(0, generateValue(date, `mrr-churn-${offset}`, 2600, 1800));
        const net = Math.round(newMrr + expansion + contraction + churn);

        return {
          x: date.toISOString(),
          new: Math.round(newMrr),
          expansion: Math.round(expansion),
          contraction: Math.round(contraction),
          churn: Math.round(churn),
          net,
        };
      });

    const current = buildSeries(0);

    let previousSeries = undefined as typeof current | undefined;
    if (compare) {
      const duration = toDate.getTime() - fromDate.getTime();
      const prevFrom = new Date(fromDate.getTime() - duration);
      const prevTo = new Date(toDate.getTime() - duration);
      const prevDays = eachDayOfInterval({ start: prevFrom, end: prevTo });

      previousSeries = prevDays.map((date, idx) => {
        const progress = prevDays.length > 1 ? idx / (prevDays.length - 1) : 0;

        const newMrr = Math.max(0, generateValue(date, 'mrr-prev-new', 8000 + progress * 3000, 3500));
        const expansion = Math.max(0, generateValue(date, 'mrr-prev-exp', 3000 + progress * 2000, 2000));
        const contraction = -Math.max(0, generateValue(date, 'mrr-prev-ctr', 2000, 1400));
        const churn = -Math.max(0, generateValue(date, 'mrr-prev-churn', 3000, 2000));
        const net = Math.round(newMrr + expansion + contraction + churn);

        return {
          x: date.toISOString(),
          new: Math.round(newMrr),
          expansion: Math.round(expansion),
          contraction: Math.round(contraction),
          churn: Math.round(churn),
          net,
        };
      });
    }

    return ok({
      current,
      previous: previousSeries,
    });
  }),

  // GET dash/exec/retention
  http.get(api('/analytics/executive/retention'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const compare = url.searchParams.get('compare') === 'true';

    const fromDate = from ? new Date(from) : subDays(new Date(), 60);
    const toDate = to ? new Date(to) : new Date();

    const days = eachDayOfInterval({ start: fromDate, end: toDate });

    const buildRetentionSeries = (metricPrefix: string) => {
      return days.map((date, idx) => {
        const progress = days.length > 1 ? idx / (days.length - 1) : 0;
        const base = 88 + progress * 3;
        const value = Math.max(70, Math.min(98, generateValue(date, `${metricPrefix}-${idx}`, base, 4)));
        const retention = parseFloat(value.toFixed(1));
        const churned = Math.round((100 - retention) * 8);

        return {
          x: date.toISOString(),
          retention,
          churned,
        };
      });
    };

    const currentSeries = buildRetentionSeries('retention-current');
    const headline = currentSeries[currentSeries.length - 1]?.retention ?? 0;
    const startValue = currentSeries[0]?.retention ?? headline;
    const delta = parseFloat((headline - startValue).toFixed(1));

    let previousData = undefined as
      | {
          headline: number;
          series: { x: string; retention: number; churned: number }[];
        }
      | undefined;

    if (compare) {
      const previousSeries = buildRetentionSeries('retention-previous');
      const previousHeadline = previousSeries[previousSeries.length - 1]?.retention ?? 0;
      previousData = {
        headline: previousHeadline,
        series: previousSeries,
      };
    }

    return ok({
      headline,
      delta,
      series: currentSeries,
      previous: previousData,
    });
  }),

  // GET analytics/executive/revenue-vs-target
  http.get(api('/analytics/executive/revenue-vs-target'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const compare = url.searchParams.get('compare') === 'true';

    const fromDate = from ? new Date(from) : subDays(new Date(), 30);
    const toDate = to ? new Date(to) : new Date();

    const revenueSeries = generateTimeSeries(fromDate, toDate, 'revenue', 450000, 50000, 20000);
    const targetSeries = generateTimeSeries(fromDate, toDate, 'target', 500000, 10000, 15000);

    let previousData = null;
    if (compare) {
      const duration = toDate.getTime() - fromDate.getTime();
      const prevFrom = new Date(fromDate.getTime() - duration);
      const prevTo = new Date(toDate.getTime() - duration);
      previousData = {
        revenue: generateTimeSeries(prevFrom, prevTo, 'revenue', 420000, 45000, 15000),
        target: generateTimeSeries(prevFrom, prevTo, 'target', 480000, 10000, 12000),
      };
    }

    return ok({
      series: [
        { name: 'Revenue', data: revenueSeries },
        { name: 'Target', data: targetSeries },
      ],
      previous: previousData,
    });
  }),

  // GET analytics/executive/churn
  http.get(api('/analytics/executive/churn'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const compare = url.searchParams.get('compare') === 'true';

    const fromDate = from ? new Date(from) : subDays(new Date(), 30);
    const toDate = to ? new Date(to) : new Date();

    const series = generateTimeSeries(fromDate, toDate, 'churn', 3.5, 1.2, -0.5);
    const current = series[series.length - 1].y;
    const previous = series[0].y;
    const delta = ((current - previous) / previous) * 100;

    let previousData = null;
    if (compare) {
      const duration = toDate.getTime() - fromDate.getTime();
      const prevFrom = new Date(fromDate.getTime() - duration);
      const prevTo = new Date(toDate.getTime() - duration);
      previousData = {
        series: generateTimeSeries(prevFrom, prevTo, 'churn', 4.2, 1.0, -0.3),
        value: 4.2,
      };
    }

    return ok({
      current: parseFloat(current.toFixed(2)),
      delta: parseFloat(delta.toFixed(2)),
      series,
      previous: previousData,
    });
  }),

  // GET analytics/executive/cohort-retention
  http.get(api('/analytics/executive/cohort-retention'), async ({ request }) => {
    await delay(400);

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    const fromDate = from ? new Date(from) : subMonths(new Date(), 6);
    const toDate = to ? new Date(to) : new Date();

    const months = eachMonthOfInterval({ start: fromDate, end: toDate });

    const cohorts = months.slice(0, -1).map((month, cohortIdx) => {
      const cohortLabel = format(month, 'MMM yyyy');
      const retentionData: number[] = [];

      // Generate retention percentages for each month since signup
      for (let monthsSince = 0; monthsSince <= months.length - cohortIdx - 1; monthsSince++) {
        const baseRetention = 100 - (monthsSince * 8);
        const variance = 5;
        const seed = generateSeed(month, `retention-${monthsSince}`);
        const random = (seed % 1000) / 1000;
        const retention = Math.max(20, Math.min(100, baseRetention + (random - 0.5) * variance));
        retentionData.push(parseFloat(retention.toFixed(1)));
      }

      return {
        cohort: cohortLabel,
        data: retentionData,
      };
    });

    return ok({ cohorts });
  }),

  // GET analytics/executive/regions ({ request })
  http.get(api('/analytics/executive/regions'), async () => {
    await delay(300);

    // const url = new URL(request.url);
    // const from = url.searchParams.get('from');
    // const to = url.searchParams.get('to');

    const regions = [
      { id: 'us', name: 'United States', revenue: 1250000, orders: 3420, growth: 12.5 },
      { id: 'uk', name: 'United Kingdom', revenue: 680000, orders: 1850, growth: 8.3 },
      { id: 'de', name: 'Germany', revenue: 520000, orders: 1420, growth: 15.2 },
      { id: 'fr', name: 'France', revenue: 450000, orders: 1230, growth: 6.7 },
      { id: 'ca', name: 'Canada', revenue: 380000, orders: 1050, growth: 10.1 },
      { id: 'au', name: 'Australia', revenue: 320000, orders: 890, growth: 14.8 },
      { id: 'jp', name: 'Japan', revenue: 280000, orders: 760, growth: 9.4 },
      { id: 'es', name: 'Spain', revenue: 210000, orders: 580, growth: 7.2 },
    ];

    return ok({ regions });
  }),

  // GET analytics/executive/top-products
  http.get(api('/analytics/executive/top-products'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const products = [
      {
        id: '1',
        name: 'Enterprise Plan',
        revenue: 850000,
        orders: 142,
        grossMargin: 78.5,
        spark: [45, 52, 48, 61, 55, 67, 71, 68, 75, 82],
      },
      {
        id: '2',
        name: 'Professional Plan',
        revenue: 620000,
        orders: 487,
        grossMargin: 72.3,
        spark: [38, 42, 45, 48, 52, 55, 58, 61, 64, 68],
      },
      {
        id: '3',
        name: 'Premium Add-ons',
        revenue: 380000,
        orders: 1245,
        grossMargin: 85.2,
        spark: [22, 25, 28, 32, 35, 38, 42, 45, 48, 52],
      },
      {
        id: '4',
        name: 'Starter Plan',
        revenue: 290000,
        orders: 892,
        grossMargin: 68.7,
        spark: [18, 20, 22, 24, 26, 28, 30, 32, 34, 36],
      },
      {
        id: '5',
        name: 'Consulting Services',
        revenue: 245000,
        orders: 78,
        grossMargin: 82.1,
        spark: [15, 17, 19, 21, 23, 25, 27, 29, 31, 33],
      },
    ];

    return ok({ products: products.slice(0, limit) });
  }),

  // GET analytics/executive/pipeline-funnel ({ request })
  http.get(api('/analytics/executive/pipeline-funnel'), async () => {
    await delay(300);

    const stages = [
      { label: 'Prospect', value: 1250, conversion: 100 },
      { label: 'Qualified', value: 875, conversion: 70 },
      { label: 'Proposal', value: 438, conversion: 50 },
      { label: 'Negotiation', value: 219, conversion: 50 },
      { label: 'Won', value: 131, conversion: 60 },
    ];

    return ok({ stages });
  }),

  // GET analytics/executive/nps
  http.get(api('/analytics/executive/nps'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    const fromDate = from ? new Date(from) : subDays(new Date(), 30);
    const toDate = to ? new Date(to) : new Date();

    const series = generateTimeSeries(fromDate, toDate, 'nps', 45, 8, 3);
    const current = Math.round(series[series.length - 1].y);
    const previous = Math.round(series[0].y);
    const delta = current - previous;

    return ok({
      current,
      delta,
      series,
      distribution: {
        promoters: 58,
        passives: 29,
        detractors: 13,
      },
    });
  }),

  // GET analytics/executive/active-customers
  http.get(api('/analytics/executive/active-customers'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const compare = url.searchParams.get('compare') === 'true';

    const fromDate = from ? new Date(from) : subDays(new Date(), 30);
    const toDate = to ? new Date(to) : new Date();

    const series = generateTimeSeries(fromDate, toDate, 'customers', 3420, 180, 120);
    const current = Math.round(series[series.length - 1].y);
    const previous = Math.round(series[0].y);
    const delta = ((current - previous) / previous) * 100;

    let previousData = null;
    if (compare) {
      const duration = toDate.getTime() - fromDate.getTime();
      const prevFrom = new Date(fromDate.getTime() - duration);
      const prevTo = new Date(toDate.getTime() - duration);
      previousData = {
        series: generateTimeSeries(prevFrom, prevTo, 'customers', 3180, 150, 100),
        value: 3180,
      };
    }

    return ok({
      current,
      delta: parseFloat(delta.toFixed(2)),
      series,
      previous: previousData,
    });
  }),

  // GET analytics/executive/ltv-cac
  http.get(api('/analytics/executive/ltv-cac'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const compare = url.searchParams.get('compare') === 'true';

    const ltv = 12500;
    const cac = 3200;
    const ratio = ltv / cac;

    let previousData = null;
    if (compare) {
      previousData = {
        ltv: 11800,
        cac: 3400,
        ratio: 11800 / 3400,
      };
    }

    return ok({
      ltv,
      cac,
      ratio: parseFloat(ratio.toFixed(2)),
      previous: previousData,
    });
  }),
];
