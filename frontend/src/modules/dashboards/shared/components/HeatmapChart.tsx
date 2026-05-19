import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { WidgetHeader } from './WidgetHeader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/shadcn/components/ui/tooltip';
import { cn } from '@/shadcn/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface HeatmapDataPoint {
  /** Row index (y-axis) */
  row: number;
  /** Column index (x-axis) */
  col: number;
  /** Value for this cell */
  value: number;
  /** Optional label for tooltip */
  label?: string;
}

export interface HeatmapChartProps {
  /** Chart title */
  title: string;
  /** 2D matrix of values [rows][cols] */
  data: number[][];
  /** Labels for rows (y-axis) */
  rowLabels: string[];
  /** Labels for columns (x-axis) */
  colLabels: string[];
  /** Optional: Show only every nth column label */
  colLabelInterval?: number;
  /** Color scheme for the heatmap */
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  /** Custom color function (value, min, max) => color string */
  getColor?: (value: number, min: number, max: number) => string;
  /** Format value for display in tooltip */
  valueFormatter?: (value: number) => string;
  /** Tooltip label formatter */
  tooltipFormatter?: (row: string, col: string, value: number) => React.ReactNode;
  /** Cell click handler */
  onCellClick?: (row: number, col: number, value: number) => void;
  /** Chart height */
  height?: number;
  /** Cell size */
  cellSize?: 'sm' | 'md' | 'lg';
  /** Show legend */
  showLegend?: boolean;
  /** Legend position */
  legendPosition?: 'bottom' | 'right';
  /** Refresh callback */
  onRefresh?: () => void;
  /** Export callback */
  onExport?: () => void;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Color Schemes
// ============================================================================

const COLOR_SCHEMES = {
  blue: {
    light: { r: 219, g: 234, b: 254 },
    dark: { r: 30, g: 64, b: 175 },
  },
  green: {
    light: { r: 220, g: 252, b: 231 },
    dark: { r: 22, g: 101, b: 52 },
  },
  purple: {
    light: { r: 243, g: 232, b: 255 },
    dark: { r: 107, g: 33, b: 168 },
  },
  orange: {
    light: { r: 255, g: 237, b: 213 },
    dark: { r: 194, g: 65, b: 12 },
  },
  red: {
    light: { r: 254, g: 226, b: 226 },
    dark: { r: 185, g: 28, b: 28 },
  },
};

function interpolateColor(
  value: number,
  min: number,
  max: number,
  scheme: keyof typeof COLOR_SCHEMES
): string {
  const intensity = max === min ? 0 : Math.min((value - min) / (max - min), 1);
  const { light, dark } = COLOR_SCHEMES[scheme];
  
  const r = Math.round(light.r + intensity * (dark.r - light.r));
  const g = Math.round(light.g + intensity * (dark.g - light.g));
  const b = Math.round(light.b + intensity * (dark.b - light.b));
  
  return `rgb(${r}, ${g}, ${b})`;
}

// ============================================================================
// Cell Size Classes
// ============================================================================

const CELL_SIZES = {
  sm: 'h-6 min-w-[1.5rem]',
  md: 'h-8 min-w-[2rem]',
  lg: 'h-10 min-w-[2.5rem]',
};

const ROW_LABEL_WIDTHS = {
  sm: 'w-8',
  md: 'w-10',
  lg: 'w-12',
};

// ============================================================================
// Component
// ============================================================================

export function HeatmapChart({
  title,
  data,
  rowLabels,
  colLabels,
  colLabelInterval = 1,
  colorScheme = 'blue',
  getColor,
  valueFormatter = (v) => v.toString(),
  tooltipFormatter,
  onCellClick,
  height = 320,
  cellSize = 'md',
  showLegend = true,
  legendPosition = 'bottom',
  onRefresh,
  onExport,
  className,
}: HeatmapChartProps) {
  // Calculate min/max for color scaling
  const { minValue, maxValue } = useMemo(() => {
    const flat = data.flat();
    return {
      minValue: Math.min(...flat, 0),
      maxValue: Math.max(...flat, 1),
    };
  }, [data]);

  // Color function
  const getCellColor = useMemo(() => {
    if (getColor) return getColor;
    return (value: number, min: number, max: number) =>
      interpolateColor(value, min, max, colorScheme);
  }, [getColor, colorScheme]);

  // Default tooltip formatter
  const formatTooltip = tooltipFormatter ?? ((row, col, value) => (
    <>
      <p className="font-medium">{row} - {col}</p>
      <p className="text-muted-foreground">{valueFormatter(value)}</p>
    </>
  ));

  // Legend gradient stops
  const legendStops = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1].map((intensity) => ({
      intensity,
      color: getCellColor(minValue + intensity * (maxValue - minValue), minValue, maxValue),
    }));
  }, [getCellColor, minValue, maxValue]);

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <WidgetHeader title={title} onRefresh={onRefresh} onExport={onExport} />
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div 
            className={cn(
              'w-full overflow-auto',
              legendPosition === 'right' && 'flex gap-4'
            )}
            style={{ height }}
          >
            <div className="flex-1">
              {/* Column labels */}
              <div className={cn('flex mb-1', ROW_LABEL_WIDTHS[cellSize])}>
                <div className={ROW_LABEL_WIDTHS[cellSize]} /> {/* Spacer for row labels */}
                <div className="flex-1 flex">
                  {colLabels.map((label, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 text-xs text-muted-foreground text-center truncate',
                        CELL_SIZES[cellSize],
                        i % colLabelInterval !== 0 && 'invisible'
                      )}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Heatmap grid */}
              <div className="flex flex-col gap-[2px]">
                {data.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-[2px]">
                    {/* Row label */}
                    <div className={cn(
                      'text-xs text-muted-foreground text-right pr-2 truncate',
                      ROW_LABEL_WIDTHS[cellSize]
                    )}>
                      {rowLabels[rowIndex]}
                    </div>
                    {/* Cells */}
                    <div className="flex-1 flex gap-[2px]">
                      {row.map((value, colIndex) => (
                        <Tooltip key={colIndex}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'flex-1 rounded-sm transition-opacity',
                                CELL_SIZES[cellSize],
                                onCellClick && 'cursor-pointer hover:opacity-80'
                              )}
                              style={{ backgroundColor: getCellColor(value, minValue, maxValue) }}
                              onClick={() => onCellClick?.(rowIndex, colIndex, value)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            {formatTooltip(rowLabels[rowIndex], colLabels[colIndex], value)}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend - Bottom */}
              {showLegend && legendPosition === 'bottom' && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-xs text-muted-foreground">
                    {valueFormatter(minValue)}
                  </span>
                  <div className="flex gap-[2px]">
                    {legendStops.map(({ intensity, color }) => (
                      <div
                        key={intensity}
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {valueFormatter(maxValue)}
                  </span>
                </div>
              )}
            </div>

            {/* Legend - Right */}
            {showLegend && legendPosition === 'right' && (
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {valueFormatter(maxValue)}
                </span>
                <div className="flex flex-col gap-[2px]">
                  {[...legendStops].reverse().map(({ intensity, color }) => (
                    <div
                      key={intensity}
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {valueFormatter(minValue)}
                </span>
              </div>
            )}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Standalone Heatmap (without Card wrapper)
// ============================================================================

export interface HeatmapProps extends Omit<HeatmapChartProps, 'title' | 'onRefresh' | 'onExport' | 'className'> {
  className?: string;
}

export function Heatmap({
  data,
  rowLabels,
  colLabels,
  colLabelInterval = 1,
  colorScheme = 'blue',
  getColor,
  valueFormatter = (v) => v.toString(),
  tooltipFormatter,
  onCellClick,
  height = 320,
  cellSize = 'md',
  showLegend = true,
  legendPosition = 'bottom',
  className,
}: HeatmapProps) {
  // Calculate min/max for color scaling
  const { minValue, maxValue } = useMemo(() => {
    const flat = data.flat();
    return {
      minValue: Math.min(...flat, 0),
      maxValue: Math.max(...flat, 1),
    };
  }, [data]);

  // Color function
  const getCellColor = useMemo(() => {
    if (getColor) return getColor;
    return (value: number, min: number, max: number) =>
      interpolateColor(value, min, max, colorScheme);
  }, [getColor, colorScheme]);

  // Default tooltip formatter
  const formatTooltip = tooltipFormatter ?? ((row, col, value) => (
    <>
      <p className="font-medium">{row} - {col}</p>
      <p className="text-muted-foreground">{valueFormatter(value)}</p>
    </>
  ));

  // Legend gradient stops
  const legendStops = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1].map((intensity) => ({
      intensity,
      color: getCellColor(minValue + intensity * (maxValue - minValue), minValue, maxValue),
    }));
  }, [getCellColor, minValue, maxValue]);

  return (
    <TooltipProvider>
      <div 
        className={cn(
          'w-full overflow-auto',
          legendPosition === 'right' && 'flex gap-4',
          className
        )}
        style={{ height }}
      >
        <div className="flex-1">
          {/* Column labels */}
          <div className={cn('flex mb-1', ROW_LABEL_WIDTHS[cellSize])}>
            <div className={ROW_LABEL_WIDTHS[cellSize]} />
            <div className="flex-1 flex">
              {colLabels.map((label, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 text-xs text-muted-foreground text-center truncate',
                    CELL_SIZES[cellSize],
                    i % colLabelInterval !== 0 && 'invisible'
                  )}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap grid */}
          <div className="flex flex-col gap-[2px]">
            {data.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-[2px]">
                <div className={cn(
                  'text-xs text-muted-foreground text-right pr-2 truncate',
                  ROW_LABEL_WIDTHS[cellSize]
                )}>
                  {rowLabels[rowIndex]}
                </div>
                <div className="flex-1 flex gap-[2px]">
                  {row.map((value, colIndex) => (
                    <Tooltip key={colIndex}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'flex-1 rounded-sm transition-opacity',
                            CELL_SIZES[cellSize],
                            onCellClick && 'cursor-pointer hover:opacity-80'
                          )}
                          style={{ backgroundColor: getCellColor(value, minValue, maxValue) }}
                          onClick={() => onCellClick?.(rowIndex, colIndex, value)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {formatTooltip(rowLabels[rowIndex], colLabels[colIndex], value)}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend - Bottom */}
          {showLegend && legendPosition === 'bottom' && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-xs text-muted-foreground">
                {valueFormatter(minValue)}
              </span>
              <div className="flex gap-[2px]">
                {legendStops.map(({ intensity, color }) => (
                  <div
                    key={intensity}
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {valueFormatter(maxValue)}
              </span>
            </div>
          )}
        </div>

        {/* Legend - Right */}
        {showLegend && legendPosition === 'right' && (
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-xs text-muted-foreground">
              {valueFormatter(maxValue)}
            </span>
            <div className="flex flex-col gap-[2px]">
              {[...legendStops].reverse().map(({ intensity, color }) => (
                <div
                  key={intensity}
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {valueFormatter(minValue)}
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default HeatmapChart;
