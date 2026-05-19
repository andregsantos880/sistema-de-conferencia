import React, { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { 
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent
} from '../../application/hooks/useCalendarEvents';
import { cn } from '@/shadcn/lib/utils';
import SimpleBar from 'simplebar-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Timeline } from '@/shared/ui/components/Timeline';
import { EventModal, type EventFormData } from '../components/EventModal';

export const CalendarLightWidget: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  
  const todayRange = useMemo(() => ({
    from: startOfDay(new Date()).toISOString(),
    to: endOfDay(new Date()).toISOString(),
  }), []);

  const { data: events = [], isLoading } = useCalendarEvents(todayRange);

  const createMutation = useCreateCalendarEvent();
  const updateMutation = useUpdateCalendarEvent();
  const deleteMutation = useDeleteCalendarEvent();

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events]);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleSaveEvent = (data: EventFormData) => {
    if (selectedEvent) {
      updateMutation.mutate({ id: selectedEvent.id, dto: data });
    } else {
      createMutation.mutate(data);
    }
    setModalOpen(false);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteMutation.mutate(selectedEvent.id);
    }
    setModalOpen(false);
  };

  const timelineItems = useMemo(() => {
    return sortedEvents.map((event) => {
      const isOngoing = new Date() >= new Date(event.startDate) && new Date() <= new Date(event.endDate);
      const startTime = format(new Date(event.startDate), 'HH:mm');

      return {
        id: event.id,
        icon: (
          <div className={cn(
            "size-3 rounded-full border-2 border-sidebar-background",
            isOngoing ? "bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "bg-muted-foreground/30"
          )} 
          style={{ backgroundColor: !isOngoing ? event.color : undefined }}
          />
        ),
        title: (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-tight",
                isOngoing ? "text-primary" : "text-muted-foreground"
              )}>
                {startTime}
              </span>
              {isOngoing && (
                <span className="px-1.5 py-0.5 text-[8px] font-black bg-primary/10 text-primary rounded-md uppercase">Live</span>
              )}
            </div>
            <h4 className="text-xs font-bold leading-tight line-clamp-2 transition-colors group-hover:text-primary">{event.title}</h4>
          </div>
        ),
        subtitle: (
          <div className="flex items-center gap-3 mt-1">
             <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <Clock className="size-3" />
                <span>{format(new Date(event.startDate), 'h:mm a')}</span>
             </div>

          </div>
        ),
        onClick: () => handleEventClick(event),
        //iconContainerClassName: "bg-transparent h-4 w-4",
      };
    });
  }, [sortedEvents]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 min-h-0">
        <SimpleBar className="h-full">
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Schedule</h3>
                <p className="text-sm font-bold mt-0.5">{format(new Date(), 'EEEE, MMMM do')}</p>
              </div>
              <button 
                onClick={() => navigate('/apps/calendar')}
                className="p-2 hover:bg-sidebar-hover rounded-xl transition-colors text-muted-foreground"
              >
                <CalendarIcon className="size-4" />
              </button>
            </div>

            <div className="relative">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-3 animate-pulse">
                      <div className="size-4 rounded-full bg-sidebar-hover shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                          <div className="h-2 bg-sidebar-hover rounded w-1/4" />
                          <div className="h-3 bg-sidebar-hover rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedEvents.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="size-12 rounded-full bg-sidebar-hover flex items-center justify-center mx-auto opacity-20">
                    <CalendarIcon className="size-5" />
                  </div>
                  <p className="text-xs text-muted-foreground">No events scheduled for today</p>
                </div>
              ) : (
                <Timeline items={timelineItems} gap="md" showLine={true} />
              )}
            </div>
          </div>
        </SimpleBar>
      </div>

      <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-surface/10 mt-auto">
        <ActionButton 
          onClick={handleAddEvent}
          className="w-full rounded-pill shadow-lg"
        >
          <Plus className="size-3" />
          Add Event
        </ActionButton>
      </div>

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
        event={selectedEvent}
        initialDate={new Date()}
      />
    </div>
  );
};

