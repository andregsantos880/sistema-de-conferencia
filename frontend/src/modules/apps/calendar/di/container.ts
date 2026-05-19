import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';
import type { ModuleRoute } from '@/core/router/types';
import { CALENDAR_PATHS } from '../ui/routes';
import { FullCalendarPage } from '../ui/pages/FullCalendarPage';
import { CALENDAR_SYMBOLS } from './symbols';
import type { ICalendarRepository } from '../infrastructure/repositories/CalendarRepository';
import { CalendarRepository } from '../infrastructure/repositories/CalendarRepository';

export function createCalendarModule(container: Container): AppModule {
  const routes: ModuleRoute[] = [
    {
      path: CALENDAR_PATHS.ROOT,
      component: FullCalendarPage,
      layout: 'app',
      module: 'calendar',
    },
  ];

  return {
    name: 'calendar',
    routes,
    registerBindings: () => {
      container
        .bind<ICalendarRepository>(CALENDAR_SYMBOLS.ICalendarRepository)
        .to(CalendarRepository)
        .inSingletonScope();
    },
  };
}
