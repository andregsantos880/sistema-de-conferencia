import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type {
  Mail,
  MailFolder,
  MailLabel,
  MailListQuery,
  MailListResponse,
  UpdateMailDto,
  ComposeDraftDto,
  SendReplyDto,
} from '../../domain/models/Email';

export interface IEmailRepository {
  getFolders(): Promise<MailFolder[]>;
  getLabels(): Promise<MailLabel[]>;
  getMessages(query: MailListQuery): Promise<MailListResponse>;
  getMessage(id: string): Promise<Mail>;
  updateMessage(id: string, dto: UpdateMailDto): Promise<Mail>;
  saveDraft(dto: ComposeDraftDto): Promise<Mail>;
  sendReply(id: string, dto: SendReplyDto): Promise<Mail>;
  sendEmail(dto: ComposeDraftDto): Promise<Mail>;
}

@injectable()
export class EmailRepository extends BaseRepository implements IEmailRepository {
  private readonly baseUrl = '/mail';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  async getFolders(): Promise<MailFolder[]> {
    return this.get<MailFolder[]>(`${this.baseUrl}/folders`, 'Failed to fetch mail folders');
  }

  async getLabels(): Promise<MailLabel[]> {
    return this.get<MailLabel[]>(`${this.baseUrl}/labels`, 'Failed to fetch mail labels');
  }

  async getMessages(query: MailListQuery): Promise<MailListResponse> {
    const qs = this.buildQueryString({
      tray: query.tray,
      q: query.q,
      cursor: query.cursor,
      limit: query.limit,
      filter: query.filter,
    });
    const url = this.appendQuery(`${this.baseUrl}/messages`, qs);
    return this.get<MailListResponse>(url, 'Failed to fetch mail messages');
  }

  async getMessage(id: string): Promise<Mail> {
    return this.get<Mail>(`${this.baseUrl}/messages/${id}`, 'Failed to fetch mail message');
  }

  async updateMessage(id: string, dto: UpdateMailDto): Promise<Mail> {
    return this.patch<Mail, UpdateMailDto>(
      `${this.baseUrl}/messages/${id}`,
      dto,
      'Failed to update mail message'
    );
  }

  async saveDraft(dto: ComposeDraftDto): Promise<Mail> {
    return this.post<Mail, ComposeDraftDto>(
      `${this.baseUrl}/messages`,
      dto,
      'Failed to save draft'
    );
  }

  async sendReply(id: string, dto: SendReplyDto): Promise<Mail> {
    return this.post<Mail, SendReplyDto>(
      `${this.baseUrl}/messages/${id}/reply`,
      dto,
      'Failed to send reply'
    );
  }

  async sendEmail(dto: ComposeDraftDto): Promise<Mail> {
    return this.post<Mail, ComposeDraftDto>(
      `${this.baseUrl}/messages/send`,
      dto,
      'Failed to send email'
    );
  }
}
