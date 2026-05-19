/**
 * Chart color utilities and theme token management
 */

export const CHART_COLORS = {
  primary: 'var(--chart-1)',
  secondary: 'var(--chart-2)',
  tertiary: 'var(--chart-3)',
  quaternary: 'var(--chart-4)',
  quinary: 'var(--chart-5)',
  senary: 'var(--chart-6)',
  septenary: 'var(--chart-7)',
  octonary: 'var(--chart-8)',
  muted: 'var(--muted-foreground)',
  accent: 'var(--accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  destructive: 'var(--destructive)',
} as const;

export const CHART_COLOR_ARRAY = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.quaternary,
  CHART_COLORS.quinary,
  CHART_COLORS.senary,
  CHART_COLORS.septenary,
  CHART_COLORS.octonary,
];

/**
 * Get color for a specific index (cycles through available colors)
 */
export function getChartColor(index: number): string {
  return CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length];
}

/**
 * Get semantic color based on trend
 */
export function getTrendColor(trend: 'up' | 'down' | 'flat', inverse: boolean = false): string {
  if (trend === 'flat') return CHART_COLORS.muted;
  
  const isPositive = trend === 'up';
  const shouldBeGreen = inverse ? !isPositive : isPositive;
  
  return shouldBeGreen ? CHART_COLORS.success : CHART_COLORS.destructive;
}

/**
 * Convert HSL color to RGB for libraries that need RGB format
 */
export function hslToRgb(hsl: string): string {
  // Extract h, s, l values from hsl(h, s%, l%) format
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hsl;

  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}
