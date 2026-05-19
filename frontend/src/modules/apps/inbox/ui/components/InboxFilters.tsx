import { useTranslation } from 'react-i18next';
import { Filter, X } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/shadcn/components/ui/popover';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import type { NotificationType, NotificationPriority } from '../../domain/models/Notification';
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
} from '../../domain/models/Notification';

interface InboxFiltersProps {
  selectedTypes: NotificationType[];
  selectedPriorities: NotificationPriority[];
  onTypesChange: (types: NotificationType[]) => void;
  onPrioritiesChange: (priorities: NotificationPriority[]) => void;
  onClearFilters: () => void;
}

const ALL_TYPES: NotificationType[] = ['system', 'task', 'comment', 'social', 'security'];
const ALL_PRIORITIES: NotificationPriority[] = ['low', 'normal', 'high', 'critical'];

export function InboxFilters({
  selectedTypes,
  selectedPriorities,
  onTypesChange,
  onPrioritiesChange,
  onClearFilters,
}: InboxFiltersProps) {
  const { t } = useTranslation('inbox');

  const hasActiveFilters = selectedTypes.length > 0 || selectedPriorities.length > 0;

  const toggleType = (type: NotificationType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const togglePriority = (priority: NotificationPriority) => {
    if (selectedPriorities.includes(priority)) {
      onPrioritiesChange(selectedPriorities.filter((p) => p !== priority));
    } else {
      onPrioritiesChange([...selectedPriorities, priority]);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Type Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            {t('filters.type')}
            {selectedTypes.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                {selectedTypes.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" align="start">
          <div className="space-y-2">
            {ALL_TYPES.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                />
                <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                  {NOTIFICATION_TYPE_LABELS[type]}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Priority Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            {t('filters.priority')}
            {selectedPriorities.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                {selectedPriorities.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" align="start">
          <div className="space-y-2">
            {ALL_PRIORITIES.map((priority) => (
              <div key={priority} className="flex items-center gap-2">
                <Checkbox
                  id={`priority-${priority}`}
                  checked={selectedPriorities.includes(priority)}
                  onCheckedChange={() => togglePriority(priority)}
                />
                <Label htmlFor={`priority-${priority}`} className="text-sm cursor-pointer">
                  {NOTIFICATION_PRIORITY_LABELS[priority]}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground"
          onClick={onClearFilters}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          {t('filters.clear')}
        </Button>
      )}
    </div>
  );
}
