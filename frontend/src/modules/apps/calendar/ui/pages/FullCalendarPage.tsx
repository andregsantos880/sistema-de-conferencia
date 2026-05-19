import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Menu, Plus, GripVertical } from 'lucide-react';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg, EventDropArg, EventContentArg } from '@fullcalendar/core';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import PageHeader from '@/shared/ui/components/PageHeader';
import { Button } from '@/shadcn/components/ui/button';
import {
  Drawer,
  DrawerContent,
} from '@/shared/ui/shadcn/components/ui/drawer';

import { CalendarSidebar } from '../components/CalendarSidebar';
import { EventModal, type EventFormData } from '../components/EventModal';
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from '../../application/hooks/useCalendarEvents';
import type { CalendarView, CalendarEvent, CalendarEventCategory } from '../../domain/models/CalendarEvent';
import { addMinutes, format, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';

import './FullCalendar.css';

export function FullCalendarPage() {
  const { t } = useTranslation('calendar');
  const calendarRef = useRef<FullCalendar>(null);
  
  // View state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Category filter state
  const [hiddenCategories, setHiddenCategories] = useState<Set<CalendarEventCategory>>(new Set());
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [initialDate, setInitialDate] = useState<Date | undefined>();

  // Fetch range state (start with month for safety)
  const [range, setRange] = useState({
    from: startOfMonth(new Date()).toISOString(),
    to: endOfMonth(new Date()).toISOString(),
  });
  
  // Fetch events based on visible range
  const { data: events = [] } = useCalendarEvents(range);

  // Filter events based on hidden categories
  const filteredEvents = useMemo(() => {
    let result = events;
    if (hiddenCategories.size > 0) {
      result = events.filter(event => !hiddenCategories.has(event.category));
    }
    // Map to FullCalendar format
    return result.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      backgroundColor: event.color,
      borderColor: event.color,
      allDay: event.allDay,
      extendedProps: { ...event }
    }));
  }, [events, hiddenCategories]);

  // Mutations
  const createMutation = useCreateCalendarEvent();
  const updateMutation = useUpdateCalendarEvent();
  const deleteMutation = useDeleteCalendarEvent();

  // FullCalendar view mapping
  const fcView = view === 'month' ? 'dayGridMonth' : 'timeGridWeek';

  // Sync FC view with state (State -> FC)
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && calendarApi.view.type !== fcView) {
      calendarApi.changeView(fcView);
    }
  }, [fcView]);

  // Sync FC date with state (State -> FC, e.g. from Sidebar)
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const fcDate = calendarApi.getDate();
      if (fcDate.getTime() !== currentDate.getTime()) {
        calendarApi.gotoDate(currentDate);
      }
    }
  }, [currentDate]);

  // Nav
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setInitialDate(selectInfo.start);
    setSelectedEvent(null);
    setModalOpen(true);
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event.extendedProps as CalendarEvent;
    setSelectedEvent(event);
    setInitialDate(undefined);
    setModalOpen(true);
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    const event = dropInfo.event.extendedProps as CalendarEvent;
    const newStart = dropInfo.event.start;
    const newEnd = dropInfo.event.end;

    if (newStart) {
      updateMutation.mutate({
        id: event.id,
        dto: {
          startDate: newStart.toISOString(),
          endDate: newEnd ? newEnd.toISOString() : addMinutes(newStart, 60).toISOString(),
        }
      });
      toast.success(t('eventMoved', 'Event moved successfully'));
    }
  };

  const handleSaveEvent = (data: EventFormData) => {
    if (selectedEvent) {
      updateMutation.mutate({
        id: selectedEvent.id,
        dto: data,
      });
    } else {
      createMutation.mutate(data);
    }
    setModalOpen(false);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteMutation.mutate(selectedEvent.id);
      setModalOpen(false);
    }
  };

  // Sidebar handlers
  const handleToggleCategory = (category: CalendarEventCategory) => {
    setHiddenCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleToggleAllCategories = (visible: boolean) => {
    if (visible) {
      setHiddenCategories(new Set());
    } else {
      const allCategories = new Set(events.map(e => e.category));
      setHiddenCategories(allCategories);
    }
  };

  // Custom event renderer to match CalendarPage style
  const renderEventContent = (eventInfo: EventContentArg) => {
    const event = eventInfo.event.extendedProps as CalendarEvent;
    
    return (
      <div
        className="fc-custom-event-wrapper text-[10px] p-1 pr-1.5 rounded-md font-bold transition-all flex items-center gap-1 group/ev w-full overflow-hidden"
        style={{
          '--event-color': event.color,
          backgroundColor: `${event.color}18`,
          color: event.color,
          border: `1px solid ${event.color}30`
        } as React.CSSProperties}
      >
        <GripVertical className="fc-event-grip size-2.5 shrink-0 opacity-40 group-hover/ev:opacity-100 transition-opacity" />
        <div className="min-w-0 flex-1">
          <div className="truncate mb-0.5 leading-tight">{eventInfo.event.title}</div>
          {eventInfo.view.type === 'timeGridWeek' && !event.allDay && (
            <div className="opacity-70 font-medium scale-90 origin-left">
              {format(eventInfo.event.start!, 'HH:mm')}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('fullCalendarTitle', 'FullCalendar View')}
        subtitle={t('fullCalendarDesc', 'FullCalendar implementation with standard features')}
        actions={[
          <Button 
                variant="outline" 
            size="icon" 
            className="lg:hidden h-10 w-10 shrink-0 shadow-sm rounded-xl"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>,

          <Button 
            onClick={() => {
              setSelectedEvent(null);
              setInitialDate(undefined);
              setModalOpen(true);
            }}
            className="rounded-pill shadow-lg px-6 ml-auto"
          >
            <Plus className="size-4 mr-2" />
            {t('createEvent', 'Create Event')}
          </Button>
        ]}
      />

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Mobile Sidebar (Drawer) */}
        <Drawer open={sidebarOpen} onOpenChange={setSidebarOpen} direction="bottom">
          <DrawerContent className="p-0 overflow-hidden">
            <div className="h-full overflow-y-auto p-4 focus-visible:outline-none">
              <CalendarSidebar
                className="w-full sm:w-80 mx-auto"
                currentDate={currentDate}
                events={events}
                onDateSelect={(date) => {
                  setCurrentDate(date);
                  setSidebarOpen(false);
                }}
                hiddenCategories={hiddenCategories}
                onToggleCategory={handleToggleCategory}
                onToggleAllCategories={handleToggleAllCategories}
              />
            </div>
          </DrawerContent>
        </Drawer>

        {/* Left Sidebar - Desktop only */}
        <div className="hidden lg:flex lg:flex-col">
          <CalendarSidebar
            currentDate={currentDate}
            events={events}
            onDateSelect={setCurrentDate}
            hiddenCategories={hiddenCategories}
            onToggleCategory={handleToggleCategory}
            onToggleAllCategories={handleToggleAllCategories}
          />
        </div>

        {/* Main Calendar View */}
        <Card className="flex-1 flex flex-col overflow-hidden shadow-xl border-primary/5 p-2 sm:p-4">
          <div className="flex-1 min-h-[500px] h-full full-calendar-container">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={fcView}
              headerToolbar={{
                left: 'prev,today,next',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
              }}
              events={filteredEvents}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={3}
              weekends={true}
              height="100%"
              initialDate={currentDate}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventContent={renderEventContent}
              datesSet={(dateInfo) => {
                const newDate = dateInfo.view.currentStart;
                const newView = dateInfo.view.type === 'dayGridMonth' ? 'month' : 'week';
                
                // Update fetch range based on actual visible dates
                if (dateInfo.startStr !== range.from || dateInfo.endStr !== range.to) {
                  setRange({ from: dateInfo.startStr, to: dateInfo.endStr });
                }

                // Update view state
                if (newView !== view) {
                  setView(newView);
                }

                // Smarter currentDate sync to avoid snapping to 1st of month
                if (newView === 'month') {
                   // Only update if we moved to a DIFFERENT month
                   if (!isSameMonth(currentDate, newDate)) {
                     setCurrentDate(newDate);
                   }
                } else {
                   // In week view, keep currentDate in sync with the visible week
                   if (newDate.getTime() !== currentDate.getTime()) {
                     setCurrentDate(newDate);
                   }
                }
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false
              }}
            />
          </div>
        </Card>
      </div>

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
        event={selectedEvent}
        initialDate={initialDate}
      />
    </div>
  );
}
