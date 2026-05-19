import { subDays, subMonths, startOfYear, endOfDay, startOfDay } from 'date-fns';

export type DateRangePreset = '7d' | '30d' | '90d' | 'ytd' | '12m' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
  preset?: DateRangePreset;
}

/**
 * Get date range from preset
 */
export function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
  const now = new Date();
  const to = endOfDay(now);

  switch (preset) {
    case '7d':
      return { from: startOfDay(subDays(now, 7)), to, preset };
    case '30d':
      return { from: startOfDay(subDays(now, 30)), to, preset };
    case '90d':
      return { from: startOfDay(subDays(now, 90)), to, preset };
    case 'ytd':
      return { from: startOfYear(now), to, preset };
    case '12m':
      return { from: startOfDay(subMonths(now, 12)), to, preset };
    default:
      return { from: startOfDay(subDays(now, 30)), to, preset: '30d' };
  }
}

/**
 * Calculate previous period for comparison
 */
export function getPreviousRange(range: DateRange): DateRange {
  const duration = range.to.getTime() - range.from.getTime();
  const from = new Date(range.from.getTime() - duration);
  const to = new Date(range.to.getTime() - duration);
  
  return { from, to };
}

/**
 * Format date range for display
 */
export function formatDateRange(range: DateRange): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: range.from.getFullYear() !== range.to.getFullYear() ? 'numeric' : undefined
  };
  
  const fromStr = range.from.toLocaleDateString('en-US', options);
  const toStr = range.to.toLocaleDateString('en-US', options);
  
  return `${fromStr} - ${toStr}`;
}

/**
 * Get preset label
 */
export function getPresetLabel(preset: DateRangePreset): string {
  const labels: Record<DateRangePreset, string> = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    'ytd': 'Year to date',
    '12m': 'Last 12 months',
    'custom': 'Custom range',
  };
  
  return labels[preset] || labels['30d'];
}
