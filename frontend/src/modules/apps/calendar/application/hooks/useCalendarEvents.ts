import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useService } from '@/app/providers/useDI';
import { CALENDAR_SYMBOLS } from '../../di/symbols';
import type { ICalendarRepository } from '../../infrastructure/repositories/CalendarRepository';
import type {
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
  CalendarEventFilters,
} from '../../domain/models/CalendarEvent';

const QUERY_KEYS = {
  events: (filters: CalendarEventFilters) => ['calendar', 'events', filters] as const,
  event: (id: string) => ['calendar', 'event', id] as const,
};

export function useCalendarEvents(filters: CalendarEventFilters = {}) {
  const repo = useService<ICalendarRepository>(CALENDAR_SYMBOLS.ICalendarRepository);

  return useQuery({
    queryKey: QUERY_KEYS.events(filters),
    queryFn: () => repo.getEvents(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCalendarEvent(id: string) {
  const repo = useService<ICalendarRepository>(CALENDAR_SYMBOLS.ICalendarRepository);

  return useQuery({
    queryKey: QUERY_KEYS.event(id),
    queryFn: () => repo.getEvent(id),
    enabled: !!id,
  });
}

export function useCreateCalendarEvent() {
  const repo = useService<ICalendarRepository>(CALENDAR_SYMBOLS.ICalendarRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCalendarEventDto) => repo.createEvent(dto),
    onSuccess: () => {
      // Invalidate all event queries to refetch
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
  });
}

export function useUpdateCalendarEvent() {
  const repo = useService<ICalendarRepository>(CALENDAR_SYMBOLS.ICalendarRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCalendarEventDto }) =>
      repo.updateEvent(id, dto),
    
    // Optimistic Update
    onMutate: ({ id, dto }) => {
      // Synchronously cancel outgoing refetches
      queryClient.cancelQueries({ queryKey: ['calendar', 'events'] });
      queryClient.cancelQueries({ queryKey: QUERY_KEYS.event(id) });

      // Snapshot the previous values
      const previousEventsSnapshot = queryClient.getQueriesData({ queryKey: ['calendar', 'events'] });
      
      // Optimistically update all matching event lists
      queryClient.setQueriesData({ queryKey: ['calendar', 'events'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map(event => event.id === id ? { ...event, ...dto } : event);
      });

      // Snapshot and update the specific event query
      const previousEvent = queryClient.getQueryData(QUERY_KEYS.event(id));
      queryClient.setQueryData(QUERY_KEYS.event(id), (old: any) => {
        if (!old) return old;
        return { ...old, ...dto };
      });

      return { previousEventsSnapshot, previousEvent };
    },

    onError: (_err, variables, context) => {
      // Rollback to snapshots
      if (context?.previousEventsSnapshot) {
        context.previousEventsSnapshot.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousEvent) {
        queryClient.setQueryData(QUERY_KEYS.event(variables.id), context.previousEvent);
      }
    },

    onSettled: (_, _err, variables) => {
      // Invalidate both the list and the specific event to ensure we're in sync with the server
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.event(variables.id) });
    },
  });
}

export function useDeleteCalendarEvent() {
  const repo = useService<ICalendarRepository>(CALENDAR_SYMBOLS.ICalendarRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => repo.deleteEvent(id),
    
    // Optimistic Update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['calendar', 'events'] });
      
      const previousEvents: any[] = [];
      const queries = queryClient.getQueriesData<any[]>({ queryKey: ['calendar', 'events'] });
      
      queries.forEach(([queryKey, data]) => {
        if (data) {
          previousEvents.push({ queryKey, data });
          queryClient.setQueryData(queryKey, (old: any[] | undefined) => {
            if (!old) return old;
            return old.filter(event => event.id !== id);
          });
        }
      });

      return { previousEvents };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousEvents) {
        context.previousEvents.forEach(({ queryKey, data }: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
  });
}
