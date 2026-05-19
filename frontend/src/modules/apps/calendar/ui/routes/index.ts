import type { RouteObject } from 'react-router-dom';
import { FullCalendarPage } from '../pages/FullCalendarPage';

export const CALENDAR_PATHS = {
  ROOT: '/apps/calendar',
} as const;

export const calendarRoutes: RouteObject[] = [
  {
    path: CALENDAR_PATHS.ROOT,
    Component: FullCalendarPage,
  },
];
