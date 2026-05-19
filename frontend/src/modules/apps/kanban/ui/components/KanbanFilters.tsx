/**
 * KanbanFilters Component
 * 
 * Filter bar for the Kanban board view.
 * Supports filtering by search, labels, assignees, and priority.
 */

import { useTranslation } from 'react-i18next';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/shadcn/components/ui/popover';
import { cn } from '@/shadcn/lib/utils';
import type { KanbanLabel, KanbanUser, CardPriority, CardFilters } from '../../domain/models/Kanban';

interface KanbanFiltersProps {
  filters: CardFilters;
  onFiltersChange: (filters: CardFilters) => void;
  availableLabels: KanbanLabel[];
  availableUsers: KanbanUser[];
}

const priorityOptions: { value: CardPriority; labelKey: string; color: string }[] = [
  { value: 'low', labelKey: 'priority.low', color: 'bg-slate-500' },
  { value: 'medium', labelKey: 'priority.medium', color: 'bg-blue-500' },
  { value: 'high', labelKey: 'priority.high', color: 'bg-amber-500' },
  { value: 'critical', labelKey: 'priority.critical', color: 'bg-red-500' },
];

export function KanbanFilters({
  filters,
  onFiltersChange,
  availableLabels,
  availableUsers,
}: KanbanFiltersProps) {
  const { t } = useTranslation('kanban');
  const hasActiveFilters =
    (filters.search && filters.search.length > 0) ||
    (filters.labelIds && filters.labelIds.length > 0) ||
    (filters.assigneeIds && filters.assigneeIds.length > 0) ||
    (filters.priorities && filters.priorities.length > 0);

  const activeFilterCount =
    (filters.labelIds?.length ?? 0) +
    (filters.assigneeIds?.length ?? 0) +
    (filters.priorities?.length ?? 0);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const toggleLabel = (labelId: string) => {
    const current = filters.labelIds ?? [];
    const updated = current.includes(labelId)
      ? current.filter(id => id !== labelId)
      : [...current, labelId];
    onFiltersChange({ ...filters, labelIds: updated.length > 0 ? updated : undefined });
  };

  const toggleAssignee = (userId: string) => {
    const current = filters.assigneeIds ?? [];
    const updated = current.includes(userId)
      ? current.filter(id => id !== userId)
      : [...current, userId];
    onFiltersChange({ ...filters, assigneeIds: updated.length > 0 ? updated : undefined });
  };

  const togglePriority = (priority: CardPriority) => {
    const current = filters.priorities ?? [];
    const updated = current.includes(priority)
      ? current.filter(p => p !== priority)
      : [...current, priority];
    onFiltersChange({ ...filters, priorities: updated.length > 0 ? updated : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('filters.search')}
          value={filters.search ?? ''}
          onChange={e => handleSearchChange(e.target.value)}
          className="pl-8 h-8"
        />
        {filters.search && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2">
            <Filter className="h-3.5 w-3.5" />
            {t('filters.filters')}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            {/* Labels */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t('filters.labels')}</h4>
              <div className="flex flex-wrap gap-1.5">
                {availableLabels.map(label => {
                  const isSelected = filters.labelIds?.includes(label.id);
                  return (
                    <Badge
                      key={label.id}
                      variant="secondary"
                      className={cn(
                        'cursor-pointer transition-all text-xs',
                        isSelected
                          ? cn(label.color, 'text-white')
                          : 'bg-muted hover:bg-muted/80'
                      )}
                      onClick={() => toggleLabel(label.id)}
                    >
                      {label.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Assignees */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t('filters.assignees')}</h4>
              <div className="flex flex-wrap gap-1.5">
                {availableUsers.map(user => {
                  const isSelected = filters.assigneeIds?.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => toggleAssignee(user.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-[8px]">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {user.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t('filters.priority')}</h4>
              <div className="flex flex-wrap gap-1.5">
                {priorityOptions.map(option => {
                  const isSelected = filters.priorities?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => togglePriority(option.value)}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      <span className={cn('h-2 w-2 rounded-full', option.color)} />
                      {t(option.labelKey)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground hover:text-foreground"
          onClick={clearFilters}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          {t('filters.clear')}
        </Button>
      )}
    </div>
  );
}
