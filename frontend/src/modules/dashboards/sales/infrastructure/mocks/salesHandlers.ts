/**
 * Sales MSW Handlers
 * 
 * All handlers derive responses from the shared salesDataStore.
 * Filters are applied centrally - all widgets reflect the same filtered universe.
 * 
 * Principles:
 * - Single source of truth (salesDataStore)
 * - Filters affect data; focus never does
 * - All endpoints derive from the same filtered dataset
 * - No per-endpoint fake data generation
 */

import { http } from 'msw';
import { eachDayOfInterval, format, startOfMonth } from 'date-fns';
import { ok } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import {
  applySalesFilters,
  aggregateFunnel,
  aggregateRepLeaderboard,
  aggregateTopAccounts,
  aggregateOpportunitiesAtRisk,
  aggregateSalesByLocation,
  aggregateActivitiesHeatmap,
  type SalesFiltersInput,
} from './salesDataStore';

// ─────────────────────────────────────────────────────────────────────────────
// Request Parsing
// ─────────────────────────────────────────────────────────────────────────────

function parseFilters(url: URL): SalesFiltersInput {
  const from = url.searchParams.get('from') ? new Date(url.searchParams.get('from')!) : undefined;
  const to = url.searchParams.get('to') ? new Date(url.searchParams.get('to')!) : undefined;
  const team = url.searchParams.get('team') || null;
  const region = url.searchParams.get('region') || null;
  const owner = url.searchParams.get('owner') || null;
  
  return { from, to, team, region, owner };
}

// Seeded random for trend line variations
function seededRandom(seed: number) {
  let s = Math.abs(seed) % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function dateSeed(from?: Date, to?: Date) {
  const f = from ?? new Date();
  const t = to ?? new Date();
  return Math.abs(
    f.getFullYear() * 10000 + (f.getMonth() + 1) * 100 + f.getDate() -
    (t.getFullYear() * 10000 + (t.getMonth() + 1) * 100 + t.getDate())
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────────────────

export const salesHandlers = [
  /**
   * Pipeline Stages (Funnel)
   * - Groups filtered opportunities by stage
   * - Returns funnel shape data
   */
  http.get(api('/analytics/sales/pipeline-stages'), ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const { opportunities } = applySalesFilters(filters);
    
    const stages = aggregateFunnel(opportunities);
    
    // Generate trend line based on total pipeline value
    const totalWeighted = stages.reduce((sum, s) => sum + s.weighted, 0);
    const from = filters.from ?? new Date();
    const to = filters.to ?? new Date();
    const rand = seededRandom(dateSeed(from, to) + totalWeighted);
    
    const days = from && to ? eachDayOfInterval({ start: from, end: to }) : [];
    const trend = days.map((day) => ({
      x: format(day, 'yyyy-MM-dd'),
      y: Math.round(totalWeighted * (0.9 + rand() * 0.2)),
    }));

    return ok({ stages, trend });
  }),

  /**
   * Forecast
   * - Calculates monthly forecast based on filtered opportunities
   */
  http.get(api('/analytics/sales/forecast'), ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const { opportunities, reps } = applySalesFilters(filters);
    
    // Calculate totals from filtered data
    const totalPipeline = opportunities
      .filter(o => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost')
      .reduce((sum, o) => sum + o.amount, 0);
    
    const totalClosed = opportunities
      .filter(o => o.stage === 'Closed Won')
      .reduce((sum, o) => sum + o.amount, 0);
    
    const totalQuota = reps.reduce((sum, r) => sum + r.quota, 0);
    
    const from = filters.from ?? new Date();
    const to = filters.to ?? new Date();
    const rand = seededRandom(dateSeed(from, to));
    
    // Generate monthly series
    const months: Array<{ x: string; target: number; bestCase: number; commit: number; closedWon: number }> = [];
    const start = startOfMonth(from);
    const monthsCount = Math.max(1, (to.getFullYear() - start.getFullYear()) * 12 + (to.getMonth() - start.getMonth()) + 1);
    
    for (let i = 0; i < monthsCount; i++) {
      const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const monthFraction = 1 / monthsCount;
      
      // Distribute values across months with some variation
      const target = Math.floor(totalQuota * monthFraction * (0.9 + rand() * 0.2));
      const bestCase = Math.floor((totalPipeline + totalClosed) * monthFraction * (0.8 + rand() * 0.2));
      const commit = Math.floor(bestCase * (0.7 + rand() * 0.2));
      const closedWon = Math.floor(totalClosed * monthFraction * (0.9 + rand() * 0.2));
      
      months.push({
        x: format(date, 'yyyy-MM-01'),
        target,
        bestCase,
        commit,
        closedWon,
      });
    }

    return ok({ series: months });
  }),

  /**
   * Win Rate Trend
   * - Calculates win rate from filtered opportunities
   */
  http.get(api('/analytics/sales/win-rate'), ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const { opportunities } = applySalesFilters(filters);
    
    const closedOpps = opportunities.filter(o => 
      o.stage === 'Closed Won' || o.stage === 'Closed Lost'
    );
    const wonOpps = opportunities.filter(o => o.stage === 'Closed Won');
    const winRate = closedOpps.length > 0 ? wonOpps.length / closedOpps.length : 0;
    
    const from = filters.from ?? new Date();
    const to = filters.to ?? new Date();
    const rand = seededRandom(dateSeed(from, to));
    
    // Generate trend with variation around actual win rate
    const days = from && to ? eachDayOfInterval({ start: from, end: to }) : [];
    const data = days.map((d) => ({
      x: format(d, 'yyyy-MM-dd'),
      y: +(winRate * (0.85 + rand() * 0.3)).toFixed(3),
    }));

    return ok({
      series: data,
      current: data[data.length - 1]?.y ?? winRate,
      previous: { value: data[Math.max(0, data.length - 8)]?.y ?? winRate },
    });
  }),

  /**
   * Average Deal Size Trend
   * - Calculates from filtered won opportunities
   */
  http.get(api('/analytics/sales/deal-size'), ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const { opportunities } = applySalesFilters(filters);
    
    const wonOpps = opportunities.filter(o => o.stage === 'Closed Won');
    const avgDealSize = wonOpps.length > 0
      ? wonOpps.reduce((sum, o) => sum + o.amount, 0) / wonOpps.length
      : 10000;
    
    const from = filters.from ?? new Date();
    const to = filters.to ?? new Date();
    const rand = seededRandom(dateSeed(from, to));
    
    const days = from && to ? eachDayOfInterval({ start: from, end: to }) : [];
    const data = days.map((d) => ({
      x: format(d, 'yyyy-MM-dd'),
      y: Math.floor(avgDealSize * (0.85 + rand() * 0.3)),
    }));

    return ok({ series: data });
  }),

  /**
   * Sales Cycle Length Trend
   * - Calculates from filtered won opportunities
   */
  http.get(api('/analytics/sales/cycle-length'), ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const { opportunities } = applySalesFilters(filters);
    
    const wonOpps = opportunities.filter(o => o.stage === 'Closed Won');
    const avgCycleLength = wonOpps.length > 0
      ? wonOpps.reduce((sum, o) => {
          const days = Math.floor((o.closeDate.getTime() - o.createdDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + Math.abs(days);
        }, 0) / wonOpps.length
      : 25;
    
    const from = filters.from ?? new Date();
    const to = filters.to ?? new Date();
    const rand = seededRandom(dateSeed(from, to));
    
    const days = from && to ? eachDayOfInterval({ start: from, end: to }) : [];
    const data = days.map((d) => ({
      x: format(d, 'yyyy-MM-dd'),
      y: Math.floor(avgCycleLength * (0.85 + rand() * 0.3)),
    }));

    return ok({ series: data });
  }),

  /**
   * Rep Leaderboard
   * - Aggregates metrics per rep from filtered opportunities
   */
  http.get(api('/analytics/sales/rep-leaderboard'), ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const { opportunities, reps } = applySalesFilters(filters);
    
    const leaderboard = aggregateRepLeaderboard(opportunities, reps);

    return ok({ reps: leaderboard });
  }),

  /**
   * Activities Heatmap
   * - Generates heatmap from filtered activities
   */
  http.get(api('/analytics/sales/activities-heatmap'), ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const { activities } = applySalesFilters(filters);
    
    const matrix = aggregateActivitiesHeatmap(activities);

    return ok({ matrix });
  }),

  /**
   * Opportunities at Risk
   * - Filters opportunities first, then identifies at-risk ones
   * - Stage focus is applied client-side (not here)
   */
  http.get(api('/analytics/sales/opportunities-at-risk'), ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const { opportunities } = applySalesFilters(filters);
    
    const atRisk = aggregateOpportunitiesAtRisk(opportunities);

    return ok({ opportunities: atRisk });
  }),

  /**
   * Top Accounts
   * - Aggregates accounts from filtered opportunities
   */
  http.get(api('/analytics/sales/top-accounts'), ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);
    
    const { accounts, opportunities } = applySalesFilters(filters);
    const topAccounts = aggregateTopAccounts(accounts, opportunities, limit);

    return ok({ accounts: topAccounts });
  }),

  /**
   * Sales by Location
   * - Aggregates by country from filtered accounts and opportunities
   */
  http.get(api('/analytics/sales/locations'), ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    
    const { accounts, opportunities } = applySalesFilters(filters);
    const locations = aggregateSalesByLocation(accounts, opportunities);

    return ok({ locations });
  }),
];
