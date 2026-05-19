import { X } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { cn } from '@/shadcn/lib/utils';
import type { ActiveFilterEntry } from '@/shared/hooks/useFilterEngine';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface InteractionToken {
  type: 'filter' | 'focus';
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export interface InteractionContextBarProps {
  /** Active filter entries from useFilterEngine */
  filterEntries?: ActiveFilterEntry[];
  
  /** Focus state object - keys with non-null values are shown */
  focusEntries?: Array<{
    key: string;
    label: string;
    value: string | null | undefined;
    onRemove: () => void;
  }>;
  
  /** Callback to clear all filters */
  onClearFilters?: () => void;
  
  /** Callback to clear all focus states */
  onClearFocus?: () => void;
  
  /** Additional className */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Token Component
// ─────────────────────────────────────────────────────────────────────────────

function Token({ 
  type, 
  label, 
  value, 
  onRemove 
}: InteractionToken) {
  const isFilter = type === 'filter';
  
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium',
        'border transition-all duration-200',
        isFilter
          ? 'bg-card border-border/60 text-foreground hover:border-border'
          : 'bg-muted/40 border-border/40 text-muted-foreground hover:border-border/60'
      )}
    >
      {/* Type prefix with semantic color */}
      <span 
        className={cn(
          'text-xs font-semibold',
          isFilter ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {isFilter ? 'Filter' : label}
      </span>
      
      {/* Separator dot */}
      <span className="text-muted-foreground/50">·</span>
      
      {/* Label and Value */}
      <span className="text-foreground/90">
        {label}: {value}
      </span>
      
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          'ml-0.5 rounded-full p-0.5 transition-colors',
          'hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring',
          'text-muted-foreground hover:text-foreground'
        )}
        aria-label={`Remove ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * InteractionContextBar
 * 
 * A unified display for both Filters (data-affecting) and Focus states (UI-only).
 * 
 * - Filters: Trigger refetches, shown with "Filter" prefix
 * - Focus: UI-only exploration, shown with category label prefix (e.g. "Stage")
 * 
 * Visual layout matches the reference design:
 * - Filters row: "Filters:" label + filter tokens + "Clear all"
 * - Inspecting row: "Inspecting:" label + focus tokens
 * 
 * This is a presentation-only component that does not modify state logic.
 */
export function InteractionContextBar({
  filterEntries = [],
  focusEntries = [],
  onClearFilters,
  onClearFocus,
  className,
}: InteractionContextBarProps) {
  // Filter out focus entries with null/undefined values
  const activeFocusEntries = focusEntries.filter(
    (entry) => entry.value !== null && entry.value !== undefined
  );
  
  const hasFilters = filterEntries.length > 0;
  const hasFocus = activeFocusEntries.length > 0;
  const hasAny = hasFilters || hasFocus;
  
  if (!hasAny) {
    return null;
  }
  
  const handleClearAll = () => {
    onClearFilters?.();
    onClearFocus?.();
  };
  
  return (
    <div 
      className={cn(
        'flex flex-col gap-3 rounded-xl p-4',
        'bg-background/80 backdrop-blur-xl',
        'border border-border/50 shadow-xl',
        className
      )}
    >
      {/* Filters Row */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground w-[90px] shrink-0">
            Filters:
          </span>
          
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {filterEntries.map((entry) => (
              <Token
                key={String(entry.key)}
                type="filter"
                label={entry.label ?? String(entry.key)}
                value={String(entry.value)}
                onRemove={entry.reset}
              />
            ))}
          </div>
          
          {/* Clear all button - show only when no focus row */}
          {!hasFocus && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-sm text-muted-foreground hover:text-foreground ml-auto"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
      
      {/* Inspecting Row */}
      {hasFocus && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground w-[90px] shrink-0">
            Inspecting:
          </span>
          
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {activeFocusEntries.map((entry) => (
              <Token
                key={entry.key}
                type="focus"
                label={entry.label}
                value={entry.value!}
                onRemove={entry.onRemove}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Clear All - Show when we have both filters and focus, or multiple items */}
      {hasFilters && hasFocus && (
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
