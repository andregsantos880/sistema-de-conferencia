import { Search, X, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/shadcn/components/ui/popover';
import { cn } from '@/shadcn/lib/utils';
import type { ReactNode } from 'react';

export interface FilterOption {
  value: string;
  label: string;
  color?: string; // Optional color class (bg-blue-500, etc)
  icon?: ReactNode;
}

export interface FilterGroupConfig {
  key: string;
  label: string; // Display label (e.g. "Team")
  options: FilterOption[];
  multiSelect?: boolean; // Default true
}

export interface FilterBarProps {
  /** Current search string */
  search?: string;
  /** Callback for search change */
  onSearchChange?: (value: string) => void;
  
  /** Configuration for filter groups */
  config: FilterGroupConfig[];
  
  /** Current active filters: key -> array of selected values */
  activeFilters: Record<string, string[]>;
  
  /** Callback when filters change */
  onFiltersChange: (filters: Record<string, string[]>) => void;
  
  /** Callback to clear all */
  onClear?: () => void;
  
  className?: string;
}

export function FilterBar({
  search,
  onSearchChange,
  config,
  activeFilters,
  onFiltersChange,
  onClear,
  className,
}: FilterBarProps) {
  const { t } = useTranslation('dashboards');

  // Count active non-search filters
  const activeCount = Object.values(activeFilters).reduce((acc, curr) => acc + curr.length, 0);

  const toggleFilter = (groupKey: string, value: string, multi: boolean) => {
    const current = activeFilters[groupKey] || [];
    let updated: string[];

    if (multi) {
      updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
    } else {
      updated = current.includes(value) ? [] : [value];
    }

    onFiltersChange({
      ...activeFilters,
      [groupKey]: updated,
    });
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onFiltersChange({});
      if (onSearchChange) onSearchChange('');
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3 py-2", className)}>
      {/* Search */}
      {onSearchChange && (
        <div className="relative flex-1 max-w-xs min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search', 'Search...')}
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 bg-background/50 backdrop-blur-sm border-border/60 focus-visible:bg-background transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Filter Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2 bg-background/50 backdrop-blur-sm border-border/60 hover:bg-background/80">
            <Filter className="h-3.5 w-3.5" />
            {t('common.filter', 'Filters')}
            {activeCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20">
                {activeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-5">
            {config.map((group) => (
              <div key={group.key} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">{group.label}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {group.options.map((option) => {
                    const isSelected = activeFilters[group.key]?.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => toggleFilter(group.key, option.value, group.multiSelect ?? true)}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 border',
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                        )}
                      >
                         {option.color && (
                          <span className={cn('h-2 w-2 rounded-full', option.color)} />
                        )} 
                        {option.icon}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Button */}
      {(activeCount > 0 || (search && search.length > 0)) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground hover:text-destructive transition-colors"
          onClick={handleClear}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          {t('common.clear', 'Clear')}
        </Button>
      )}

      {/* Active Filter Pills (optional display outside of popover) */}
      <div className="hidden lg:flex flex-wrap gap-2 ml-2">
         {config.flatMap(group => 
            (activeFilters[group.key] || []).map(val => {
               const opt = group.options.find(o => o.value === val);
               if (!opt) return null;
               return (
                 <Badge key={`${group.key}-${val}`} variant="secondary" className="h-7 pl-2 pr-1 gap-1 text-xs font-normal border-border/40 bg-background/40 backdrop-blur-sm">
                   <span className="opacity-70 mr-1">{group.label}:</span>
                   <span className="font-medium">{opt.label}</span>
                   <button 
                    onClick={() => toggleFilter(group.key, val, group.multiSelect ?? true)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                   >
                     <X className="h-3 w-3" />
                   </button>
                 </Badge>
               )
            })
         )}
      </div>
    </div>
  );
}
