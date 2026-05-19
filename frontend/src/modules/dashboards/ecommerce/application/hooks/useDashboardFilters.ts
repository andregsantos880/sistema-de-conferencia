/**
 * Phase 3: Global Dashboard Filter Definitions
 * 
 * Centralized filter state for cross-widget exploration.
 * All widgets read from this shared filter state.
 */

import { defineFilters } from '@/shared/hooks/useFilterEngine';

/**
 * Dashboard-wide filter definitions
 */
export const dashboardFilterDefinitions = defineFilters({
  // Date range is managed separately via useDateRange
  // but we track individual date selection for drill-downs
  selectedDate: {
    defaultValue: null as string | null,
    isActive: (v) => v !== null,
    label: 'Date',
  },
  
  // Channel filter (from Sales by Channel donut)
  channel: {
    defaultValue: 'all',
    isActive: (v) => v !== 'all',
    label: 'Channel',
  },
  
  // Product filter (from Top Products table)
  productId: {
    defaultValue: null as string | null,
    isActive: (v) => v !== null,
    label: 'Product',
  },
  
  // Country filter (from Live Orders)
  country: {
    defaultValue: null as string | null,
    isActive: (v) => v !== null,
    label: 'Country',
  },
  
  // Funnel stage filter (from Conversion Funnel)
  funnelStage: {
    defaultValue: null as string | null,
    isActive: (v) => v !== null,
    label: 'Funnel Stage',
  },
});

/**
 * Type inference for filter values
 */
export type DashboardFilters = {
  selectedDate: string | null;
  channel: string;
  productId: string | null;
  country: string | null;
  funnelStage: string | null;
};
