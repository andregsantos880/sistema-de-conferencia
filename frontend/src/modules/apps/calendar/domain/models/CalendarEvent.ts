export type CalendarEventCategory = 
  | 'product-design'
  | 'software-engineering'
  | 'user-research'
  | 'marketing'
  | 'meeting'
  | 'personal';

export type CalendarEventPriority = 'low' | 'medium' | 'high';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  allDay: boolean;
  category: CalendarEventCategory;
  color: string; // hex color
  priority: CalendarEventPriority;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  category: CalendarEventCategory;
  color: string;
  priority?: CalendarEventPriority;
}

export interface UpdateCalendarEventDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  category?: CalendarEventCategory;
  color?: string;
  priority?: CalendarEventPriority;
}

export interface CalendarEventFilters {
  from?: string; // ISO date
  to?: string; // ISO date
  category?: CalendarEventCategory;
}

export type CalendarView = 'week' | 'month';

export interface CategorySummary {
  category: CalendarEventCategory;
  color: string;
  totalHours: number;
  eventCount: number;
}
