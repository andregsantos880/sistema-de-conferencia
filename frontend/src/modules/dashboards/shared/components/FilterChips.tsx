import { X } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { cn } from '@/shadcn/lib/utils';
import type { ActiveFilterEntry } from '@/shared/hooks/useFilterEngine';

export interface FilterChipsProps {
  activeFilters: ActiveFilterEntry[];
  onClearAll?: () => void;
  className?: string;
}

/**
 * Phase 3: Active Filter Chips
 * 
 * Displays active filters as dismissible chips.
 * Allows users to see and clear individual filters or all at once.
 * Sticks to top of viewport when scrolling.
 */
export function FilterChips({ activeFilters, onClearAll, className }: FilterChipsProps) {
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div 
      className={cn(
        'flex flex-wrap items-center gap-2',
        'transition-all duration-200',
        className
      )}
    >
      <span className="text-sm font-medium text-muted-foreground">Filters:</span>
      
      {activeFilters.map((filter) => (
        <Badge
          key={String(filter.key)}
          variant="secondary"
          className="gap-1 pl-2.5 pr-1.5 py-1"
        >
          <span className="text-xs font-medium">
            {filter.label}: {String(filter.value)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={filter.reset}
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {activeFilters.length > 1 && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 text-xs"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
