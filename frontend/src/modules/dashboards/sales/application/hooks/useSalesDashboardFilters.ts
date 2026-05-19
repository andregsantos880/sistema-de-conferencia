/**
 * Sales Dashboard Filter Definitions
 * 
 * FILTERS define the universe of data. They:
 * - Are intentional and destructive (remove data)
 * - Trigger backend/MSW refetches
 * - Affect ALL widgets
 * 
 * For UI-only exploration within the dataset, see SalesDashboardFocus.
 */

import { defineFilters } from '@/shared/hooks/useFilterEngine';

/**
 * Sales dashboard GLOBAL FILTERS (data-affecting)
 * 
 * These filters are sent to MSW/backend and trigger refetches.
 */
export const salesDashboardFilterDefinitions = defineFilters({
  // Team filter
  team: {
    defaultValue: null as string | null,
    isActive: (v) => v !== null,
    label: 'Team',
  },
  
  // Region filter
  region: {
    defaultValue: null as string | null,
    isActive: (v) => v !== null,
    label: 'Region',
  },
  
  // Owner/Rep filter (from Rep Leaderboard clicks)
  // This IS a filter because clicking a rep should refetch the entire dashboard
  owner: {
    defaultValue: null as string | null,
    isActive: (v) => v !== null,
    label: 'Rep',
  },
});

/**
 * Type inference for filter values
 */
export type SalesDashboardFilters = {
  team: string | null;
  region: string | null;
  owner: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// FOCUS STATES (UI-only, non-destructive)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sales Dashboard FOCUS state
 * 
 * Focus defines attention WITHIN the dataset. It:
 * - Is non-destructive (does NOT remove data)
 * - Is UI-only (NOT sent to MSW)
 * - Does NOT trigger refetches
 * - Is scoped (not all widgets react)
 * 
 * Focus answers: "What am I currently looking at?"
 */
export type SalesDashboardFocus = {
  /** Pipeline stage focus from Funnel clicks - affects OpportunitiesAtRisk only */
  stage?: string | null;
  
  /** Selected opportunity row - for row highlighting/expansion */
  opportunityId?: string | null;
  
  /** Selected account from Top Accounts - for row focus/expansion (local only) */
  accountId?: string | null;
  
  /** Selected country from Sales by Location - for map/table highlighting (local only) */
  country?: string | null;
};
