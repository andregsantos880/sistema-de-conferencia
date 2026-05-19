import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  format,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import type { CalendarView } from '../domain/models/CalendarEvent';

export function getWeekRange(date: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0) {
  return {
    start: startOfWeek(date, { weekStartsOn }),
    end: endOfWeek(date, { weekStartsOn }),
  };
}

export function getMonthRange(date: Date) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getViewRange(date: Date, view: CalendarView, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0) {
  return view === 'week' ? getWeekRange(date, weekStartsOn) : getMonthRange(date);
}

export function navigateDate(date: Date, view: CalendarView, direction: 'prev' | 'next') {
  if (view === 'week') {
    return direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1);
  }
  return direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
}

export function formatDateRange(start: Date, end: Date, view: CalendarView): string {
  if (view === 'week') {
    const startMonth = format(start, 'MMMM');
    const endMonth = format(end, 'MMMM');
    const year = format(end, 'yyyy');

    if (startMonth === endMonth) {
      return `${startMonth} ${format(start, 'd')} - ${format(end, 'd')}, ${year}`;
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}, ${year}`;
  }

  return format(start, 'MMMM yyyy');
}

export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export function calculateEventDuration(startDate: string, endDate: string): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60); // hours
}

export { isSameDay, isToday, format, parseISO };
