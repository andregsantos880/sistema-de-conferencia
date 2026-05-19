import { http, delay } from 'msw';
import { ok, fail } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import { getDemoDateTime, daysAgo } from '@/mocks/utils/demoDate';
import type { CalendarEvent, CreateCalendarEventDto, UpdateCalendarEventDto } from '../../domain/models/CalendarEvent';

// In-memory event storage with relative dates
// Events are distributed around "today" to always show relevant data
const events: CalendarEvent[] = [
  // Past events (yesterday and before)
  {
    id: '1',
    title: 'Product Design Course',
    description: 'Weekly design review session',
    startDate: getDemoDateTime(-2, 9, 30),  // 2 days ago at 9:30 AM
    endDate: getDemoDateTime(-2, 12, 0),    // 2 days ago at 12:00 PM
    allDay: false,
    category: 'product-design',
    color: '#10b981',
    priority: 'medium',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(3),
  },
  {
    id: '2',
    title: 'Usability Testing',
    description: 'User testing session for new features',
    startDate: getDemoDateTime(-1, 9, 0),   // Yesterday at 9:00 AM
    endDate: getDemoDateTime(-1, 11, 0),    // Yesterday at 11:00 AM
    allDay: false,
    category: 'user-research',
    color: '#8b5cf6',
    priority: 'low',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(2),
  },
  // Today's events
  {
    id: '3',
    title: 'Frontend Development',
    description: 'Sprint planning and development',
    startDate: getDemoDateTime(0, 10, 0),   // Today at 10:00 AM
    endDate: getDemoDateTime(0, 13, 0),     // Today at 1:00 PM
    allDay: false,
    category: 'software-engineering',
    color: '#3b82f6',
    priority: 'high',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
  },
  {
    id: '4',
    title: 'Conversational Interview',
    description: 'Interview with potential candidate',
    startDate: getDemoDateTime(0, 13, 30),  // Today at 1:30 PM
    endDate: getDemoDateTime(0, 14, 0),     // Today at 2:00 PM
    allDay: false,
    category: 'meeting',
    color: '#a855f7',
    priority: 'high',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
  },
  // Tomorrow's events
  {
    id: '5',
    title: 'App Design',
    description: 'Mobile app design session',
    startDate: getDemoDateTime(1, 13, 0),   // Tomorrow at 1:00 PM
    endDate: getDemoDateTime(1, 15, 30),    // Tomorrow at 3:30 PM
    allDay: false,
    category: 'product-design',
    color: '#10b981',
    priority: 'medium',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(1),
  },
  // Upcoming events (next few days)
  {
    id: '6',
    title: 'Team Standup',
    description: 'Daily team sync meeting',
    startDate: getDemoDateTime(2, 9, 0),    // 2 days from now at 9:00 AM
    endDate: getDemoDateTime(2, 9, 30),     // 2 days from now at 9:30 AM
    allDay: false,
    category: 'meeting',
    color: '#a855f7',
    priority: 'low',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
  {
    id: '7',
    title: 'Code Review Session',
    description: 'Review PRs and discuss architecture',
    startDate: getDemoDateTime(3, 14, 0),   // 3 days from now at 2:00 PM
    endDate: getDemoDateTime(3, 16, 0),     // 3 days from now at 4:00 PM
    allDay: false,
    category: 'software-engineering',
    color: '#3b82f6',
    priority: 'medium',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(2),
  },
  {
    id: '8',
    title: 'Client Presentation',
    description: 'Present Q4 roadmap to stakeholders',
    startDate: getDemoDateTime(5, 10, 0),   // 5 days from now at 10:00 AM
    endDate: getDemoDateTime(5, 12, 0),     // 5 days from now at 12:00 PM
    allDay: false,
    category: 'meeting',
    color: '#a855f7',
    priority: 'high',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(3),
  },
  {
    id: '9',
    title: 'Design System Workshop',
    description: 'All-day workshop on design system updates',
    startDate: getDemoDateTime(7, 9, 0),    // 7 days from now at 9:00 AM
    endDate: getDemoDateTime(7, 17, 0),     // 7 days from now at 5:00 PM
    allDay: true,
    category: 'product-design',
    color: '#10b981',
    priority: 'high',
    createdAt: daysAgo(14),
    updatedAt: daysAgo(5),
  },
  {
    id: '10',
    title: 'Sprint Retrospective',
    description: 'End of sprint review and retrospective',
    startDate: getDemoDateTime(10, 15, 0),  // 10 days from now at 3:00 PM
    endDate: getDemoDateTime(10, 16, 30),   // 10 days from now at 4:30 PM
    allDay: false,
    category: 'meeting',
    color: '#a855f7',
    priority: 'medium',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(2),
  },
];

export const calendarHandlers = [
  // GET calendar/events
  http.get(api('/calendar/events'), async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const category = url.searchParams.get('category');

    let filtered = [...events];

    // Filter by date range
    if (from) {
      filtered = filtered.filter(e => new Date(e.startDate) >= new Date(from));
    }
    if (to) {
      filtered = filtered.filter(e => new Date(e.endDate) <= new Date(to));
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter(e => e.category === category);
    }

    return ok(filtered);
  }),

  // GET calendar/events/:id
  http.get(api('/calendar/events/:id'), async ({ params }) => {
    await delay(200);

    const { id } = params;
    const event = events.find(e => e.id === id);

    if (!event) {
      return fail('CALENDAR_EVENT_NOT_FOUND', 'Event not found', 404);
    }

    return ok(event);
  }),

  // POST calendar/events
  http.post(api('/calendar/events'), async ({ request }) => {
    await delay(300);

    const dto = await request.json() as CreateCalendarEventDto;
    
    const newEvent: CalendarEvent = {
      id: String(Date.now()),
      ...dto,
      priority: dto.priority ?? 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    events.push(newEvent);

    return ok(newEvent, 201);
  }),

  // PATCH calendar/events/:id
  http.patch(api('/calendar/events/:id'), async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const dto = await request.json() as UpdateCalendarEventDto;
    
    const index = events.findIndex(e => e.id === id);

    if (index === -1) {
      return fail('CALENDAR_EVENT_NOT_FOUND', 'Event not found', 404);
    }

    const updatedEvent: CalendarEvent = {
      ...events[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    events[index] = updatedEvent;

    return ok(updatedEvent);
  }),

  // DELETE calendar/events/:id
  http.delete(api('/calendar/events/:id'), async ({ params }) => {
    await delay(200);

    const { id } = params;
    const index = events.findIndex(e => e.id === id);

    if (index === -1) {
      return fail('CALENDAR_EVENT_NOT_FOUND', 'Event not found', 404);
    }

    events.splice(index, 1);

    return ok(null, 204);
  }),
];
