import React from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO, isAfter } from 'date-fns';
import { Calendar } from '@/shared/ui/shadcn/components/ui/calendar';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import { Clock, AlertCircle } from 'lucide-react';
import type { CalendarEvent, CalendarEventCategory, CategorySummary } from '../../domain/models/CalendarEvent';
import { calculateEventDuration } from '../../utils/dateUtils';
import { cn } from '@/shadcn/lib/utils';

interface CalendarSidebarProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  hiddenCategories: Set<CalendarEventCategory>;
  onToggleCategory: (category: CalendarEventCategory) => void;
  onToggleAllCategories: (visible: boolean) => void;
  className?: string;
}

// Priority order for sorting (high = 0, medium = 1, low = 2)
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export function CalendarSidebar({ 
  currentDate, 
  events, 
  onDateSelect,
  hiddenCategories,
  onToggleCategory,
  onToggleAllCategories,
  className,
}: CalendarSidebarProps) {
  const { t } = useTranslation('calendar');

  // Calculate category summaries
  const categorySummaries: CategorySummary[] = React.useMemo(() => {
    const summaryMap = new Map<string, CategorySummary>();

    events.forEach(event => {
      const existing = summaryMap.get(event.category);
      const hours = calculateEventDuration(event.startDate, event.endDate);

      if (existing) {
        existing.totalHours += hours;
        existing.eventCount += 1;
      } else {
        summaryMap.set(event.category, {
          category: event.category,
          color: event.color,
          totalHours: hours,
          eventCount: 1,
        });
      }
    });

    return Array.from(summaryMap.values());
  }, [events]);

  // Get upcoming events sorted by priority and date
  const upcomingEvents = React.useMemo(() => {
    const now = new Date();
    return events
      .filter(event => isAfter(parseISO(event.startDate), now))
      .sort((a, b) => {
        // First sort by priority (high first)
        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        // Then by date (closest first)
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, 3); // Show top 3 upcoming events
  }, [events]);

  // Check if all categories are visible
  const allCategoriesVisible = hiddenCategories.size === 0;

  return (
    <div className={cn("w-80 flex flex-col gap-4", className)}>
      {/* Mini Month Picker using shadcn Calendar */}
      <Card className="p-3">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={(date) => date && onDateSelect(date)}
          className="w-full"
        />
      </Card>

      {/* Categories with Toggles */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{t('categories', 'Categories')}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t('viewAll', 'View All')}
            </span>
            <Switch
              checked={allCategoriesVisible}
              onCheckedChange={onToggleAllCategories}
              className="scale-75"
            />
          </div>
        </div>
        <div className="space-y-2">
          {categorySummaries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('noCategories', 'No events scheduled')}
            </p>
          ) : (
            categorySummaries.map((summary) => {
              const isVisible = !hiddenCategories.has(summary.category);
              return (
                <div
                  key={summary.category}
                  className="flex items-center justify-between py-1.5"
                >
                  <button
                    type="button"
                    onClick={() => onToggleCategory(summary.category)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div
                      className={`w-3 h-3 rounded-full transition-opacity ${!isVisible ? 'opacity-30' : ''}`}
                      style={{ backgroundColor: summary.color }}
                    />
                    <span className={`text-sm capitalize ${!isVisible ? 'text-muted-foreground line-through' : ''}`}>
                      {summary.category.replace('-', ' ')}
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {summary.totalHours.toFixed(1)}h
                    </span>
                    <Switch
                      checked={isVisible}
                      onCheckedChange={() => onToggleCategory(summary.category)}
                      className="scale-75"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Upcoming Events */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">{t('upcomingEvents', 'Upcoming Events')}</h3>
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('noUpcomingEvents', 'No upcoming events')}
            </p>
          ) : (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div
                  className="w-1 rounded-full shrink-0"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">{event.title}</span>
                    {event.priority === 'high' && (
                      <AlertCircle className="size-3.5 text-red-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="size-3" />
                    <span>{format(parseISO(event.startDate), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
