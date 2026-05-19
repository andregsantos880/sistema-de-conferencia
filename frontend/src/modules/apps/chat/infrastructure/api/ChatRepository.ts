import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type {
  Conversation,
  ChatMessage,
  Contact,
  SendMessageDto,
  ConversationFilters,
  MessagesQuery,
  MessagesResponse,
} from '../../domain/models/Chat';

export interface IChatRepository {
  getConversations(filters?: ConversationFilters): Promise<Conversation[]>;
  getMessages(query: MessagesQuery): Promise<MessagesResponse>;
  sendMessage(dto: SendMessageDto): Promise<ChatMessage>;
  getContact(convId: string): Promise<Contact>;
  markAsRead(convId: string): Promise<void>;
}

@injectable()
export class ChatRepository extends BaseRepository implements IChatRepository {
  private readonly baseUrl = '/chat';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  async getConversations(filters?: ConversationFilters): Promise<Conversation[]> {
    const query = this.buildQueryString({
      q: filters?.q,
      filter: filters?.filter !== 'all' ? filters?.filter : undefined,
    });
    const url = this.appendQuery(`${this.baseUrl}/conversations`, query);
    return this.get<Conversation[]>(url, 'Failed to fetch conversations');
  }

  async getMessages(query: MessagesQuery): Promise<MessagesResponse> {
    const qs = this.buildQueryString({
      convId: query.convId,
      cursor: query.cursor,
      limit: query.limit,
    });
    const url = this.appendQuery(`${this.baseUrl}/messages`, qs);
    return this.get<MessagesResponse>(url, 'Failed to fetch messages');
  }

  async sendMessage(dto: SendMessageDto): Promise<ChatMessage> {
    return this.post<ChatMessage, SendMessageDto>(
      `${this.baseUrl}/messages`,
      dto,
      'Failed to send message'
    );
  }

  async getContact(convId: string): Promise<Contact> {
    const query = this.buildQueryString({ convId });
    const url = this.appendQuery(`${this.baseUrl}/contact`, query);
    return this.get<Contact>(url, 'Failed to fetch contact');
  }

  async markAsRead(convId: string): Promise<void> {
    return this.post<void, { convId: string }>(
      `${this.baseUrl}/mark-read`,
      { convId },
      'Failed to mark as read'
    );
  }
}
