import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';

export interface TooltipItemType {
  payload: { fill?: string };
  color?: string;
  name?: string;
  value?: ValueType;
}

export function TooltipValueFormatter(item: TooltipItemType, yFormatter?: (value: ValueType) => string) {
  const indicatorColor = item.payload.fill || item.color
  
  return <div className="flex w-full flex-wrap items-center gap-1">
    <div
      className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
      style={
        {
          "--color-bg": indicatorColor,
        } as React.CSSProperties
      }
    />

    <div className={"flex flex-1 justify-between leading-none"}>
      <div className="grid gap-1.5">
        <span className="text-muted-foreground">{item.name}</span>
      </div>

      {item.value && (
        <span className="text-foreground font-mono font-medium tabular-nums ml-3">
          {yFormatter && typeof item.value === 'number' ? yFormatter(item.value) : item.value}
        </span>
      )}
    </div>
  </div>
}