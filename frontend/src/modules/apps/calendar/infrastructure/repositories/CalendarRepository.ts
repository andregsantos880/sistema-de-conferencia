import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type {
  CalendarEvent,
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
  CalendarEventFilters,
} from '../../domain/models/CalendarEvent';

export interface ICalendarRepository {
  getEvents(filters: CalendarEventFilters): Promise<CalendarEvent[]>;
  getEvent(id: string): Promise<CalendarEvent>;
  createEvent(dto: CreateCalendarEventDto): Promise<CalendarEvent>;
  updateEvent(id: string, dto: UpdateCalendarEventDto): Promise<CalendarEvent>;
  deleteEvent(id: string): Promise<void>;
}

@injectable()
export class CalendarRepository extends BaseRepository implements ICalendarRepository {
  private readonly baseUrl = '/calendar/events';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  async getEvents(filters: CalendarEventFilters): Promise<CalendarEvent[]> {
    const query = this.buildQueryString({
      from: filters.from,
      to: filters.to,
      category: filters.category,
    });
    const url = this.appendQuery(this.baseUrl, query);
    return this.get<CalendarEvent[]>(url, 'Failed to fetch calendar events');
  }

  async getEvent(id: string): Promise<CalendarEvent> {
    return this.get<CalendarEvent>(`${this.baseUrl}/${id}`, 'Failed to fetch calendar event');
  }

  async createEvent(dto: CreateCalendarEventDto): Promise<CalendarEvent> {
    return this.post<CalendarEvent, CreateCalendarEventDto>(
      this.baseUrl,
      dto,
      'Failed to create calendar event'
    );
  }

  async updateEvent(id: string, dto: UpdateCalendarEventDto): Promise<CalendarEvent> {
    return this.patch<CalendarEvent, UpdateCalendarEventDto>(
      `${this.baseUrl}/${id}`,
      dto,
      'Failed to update calendar event'
    );
  }

  async deleteEvent(id: string): Promise<void> {
    return this.delete(`${this.baseUrl}/${id}`, 'Failed to delete calendar event');
  }
}
