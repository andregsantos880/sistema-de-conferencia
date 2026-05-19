/**
 * Formatting utilities for dashboard widgets
 */

/**
 * Format currency values with compact notation
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  compact: boolean = false
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 2,
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercent(
  value: number,
  decimals: number = 1,
  includeSign: boolean = false
): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);

  if (includeSign && value > 0) {
    return `+${formatted}`;
  }

  return formatted;
}

/**
 * Format numbers with compact notation (K, M, B)
 */
export function formatCompact(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format numbers with thousand separators
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format delta values with sign and color semantics
 */
export function formatDelta(
  value: number,
  format: 'percent' | 'currency' | 'number' = 'percent',
  currency?: string
): { formatted: string; trend: 'up' | 'down' | 'flat' } {
  let formatted: string;
  
  if (format === 'percent') {
    formatted = formatPercent(value, 1, true);
  } else if (format === 'currency') {
    formatted = formatCurrency(value, currency, true);
    if (value > 0) formatted = `+${formatted}`;
  } else {
    formatted = formatCompact(value);
    if (value > 0) formatted = `+${formatted}`;
  }

  const trend = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';

  return { formatted, trend };
}

/**
 * Format ratio values (e.g., LTV:CAC)
 */
export function formatRatio(numerator: number, denominator: number): string {
  if (denominator === 0) return 'N/A';
  const ratio = numerator / denominator;
  return `${ratio.toFixed(1)}:1`;
}

export const cleanString = (title: string) =>
  title?.replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, '-');