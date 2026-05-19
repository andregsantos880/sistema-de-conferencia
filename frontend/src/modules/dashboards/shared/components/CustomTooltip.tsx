import { ChartTooltip } from '@/shared/ui/shadcn/components/ui/chart';
import { cn } from '@/shadcn/lib/utils';
import React from 'react';

// Define strict types for Tooltip payload items
export interface TooltipItem {
  name: string;
  value: number | string;
  unit?: string;
  color?: string;
  fill?: string;
  stroke?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CustomTooltipContentProps {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string;
  className?: string;
  itemClassName?: string;
  labelClassName?: string;
  formatter?: (
    value: number | string,
    name: string,
    item: TooltipItem,
    index: number,
    payload: TooltipItem[]
  ) => [React.ReactNode, React.ReactNode] | React.ReactNode;
  labelFormatter?: (label: string | number, payload: TooltipItem[]) => React.ReactNode;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: 'line' | 'dot' | 'dashed';
}

function itemConfigFromPayload(item: TooltipItem): { color?: string; label?: string } | null {
  // Check if item has payload and if that payload has fill color (common in customized charts)
  if (item.payload && typeof item.payload === 'object' && 'fill' in item.payload) {
      return { color: item.payload.fill as string };
  }
  return null;
}

export function CustomTooltipContent({ 
  active, 
  payload, 
  label, 
  className, 
  formatter,
  labelFormatter,
  hideLabel,
  hideIndicator = false,
  // indicator,
}: CustomTooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const formattedLabel = labelFormatter && label ? labelFormatter(label, payload) : label;

  return (
    <div className={cn(
      "rounded-lg border bg-background/95 p-3 shadow-xl backdrop-blur-md min-w-[180px]",
      "animate-in fade-in-0 zoom-in-95", // Simplified animations
      className
    )}>
      {!hideLabel && (
        <div className="mb-2 border-b border-border/50 pb-2">
          <p className="text-sm font-semibold text-foreground">{formattedLabel}</p>
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const config = itemConfigFromPayload(item);
          const color = config?.color || item.fill || item.stroke || item.color;
          
          let itemLabel = config?.label || item.name;
          let itemValue = item.value;

          if (formatter) {
             const formatted = formatter(itemValue, itemLabel, item, index, payload);
             if (Array.isArray(formatted)) {
                [itemValue, itemLabel] = formatted as [number | string, string];
             } else {
                itemValue = formatted as number | string;
             }
          }

          return (
            <div key={index} className="flex w-full items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                {!hideIndicator && (
                   <div 
                     className="h-2 w-2 rounded-full ring-2 ring-transparent" 
                     style={{ backgroundColor: color }}
                   />
                )}
                <span className="text-muted-foreground font-medium">{itemLabel}</span>
              </div>
              <span className="font-mono font-bold text-foreground">
                {itemValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to define use in charts
export function CustomChartTooltip(props: React.ComponentProps<typeof ChartTooltip>) {
    return (
        <ChartTooltip 
            animationDuration={200}
            cursor={false} // Often provides cleaner look for custom tooltips
            {...props}
        />
    )
}
