import { injectable, inject } from 'inversify';
import { CORE_SYMBOLS } from '@/core/di/symbols';
import type { IHttpClient } from '@/shared/infrastructure/http/HttpClient';
import { BaseRepository } from '@/shared/infrastructure/repositories';
import type { INotificationsRepository, ListTemplatesParams } from '../../domain/ports/INotificationsRepository';
import type {
  EmailTemplate,
  GlobalEmailSettings,
  UpdateTemplatePayload,
  TestEmailResult,
  ProviderTestResult,
  NotificationEvent,
  NotificationMetrics,
} from '../../domain/models';

@injectable()
export class HttpNotificationsRepository extends BaseRepository implements INotificationsRepository {
  private readonly baseUrl = '/notifications';

  constructor(@inject(CORE_SYMBOLS.IHttpClient) http: IHttpClient) {
    super(http);
  }

  async getTemplates(params?: ListTemplatesParams): Promise<EmailTemplate[]> {
    const queryString = this.buildQueryString({
      search: params?.search ?? '',
      featureArea: params?.featureArea,
      status: params?.status,
    });

    return this.get<EmailTemplate[]>(
      this.appendQuery(`${this.baseUrl}/templates`, queryString),
      'Failed to fetch email templates'
    );
  }

  async getTemplate(id: string): Promise<EmailTemplate | null> {
    try {
      return await this.get<EmailTemplate>(
        `${this.baseUrl}/templates/${id}`,
        'Failed to fetch email template'
      );
    } catch {
      return null;
    }
  }

  async updateTemplate(id: string, data: UpdateTemplatePayload): Promise<EmailTemplate> {
    return this.put<EmailTemplate, UpdateTemplatePayload>(
      `${this.baseUrl}/templates/${id}`,
      data,
      'Failed to update email template'
    );
  }

  async restoreTemplateDefault(id: string): Promise<EmailTemplate> {
    return this.post<EmailTemplate, Record<string, never>>(
      `${this.baseUrl}/templates/${id}/restore-default`,
      {},
      'Failed to restore template to default'
    );
  }

  async restoreTemplateVersion(templateId: string, versionId: string): Promise<EmailTemplate> {
    return this.post<EmailTemplate, { versionId: string }>(
      `${this.baseUrl}/templates/${templateId}/restore-version`,
      { versionId },
      'Failed to restore template version'
    );
  }

  async sendTestEmail(templateId: string, recipientEmail: string): Promise<TestEmailResult> {
    return this.post<TestEmailResult, { recipientEmail: string }>(
      `${this.baseUrl}/templates/${templateId}/test-send`,
      { recipientEmail },
      'Failed to send test email'
    );
  }

  async getGlobalSettings(): Promise<GlobalEmailSettings> {
    return this.get<GlobalEmailSettings>(
      `${this.baseUrl}/settings/email`,
      'Failed to fetch global email settings'
    );
  }

  async updateGlobalSettings(settings: Partial<GlobalEmailSettings>): Promise<GlobalEmailSettings> {
    return this.put<GlobalEmailSettings, Partial<GlobalEmailSettings>>(
      `${this.baseUrl}/settings/email`,
      settings,
      'Failed to update global email settings'
    );
  }

  async testProviderConfig(): Promise<ProviderTestResult> {
    return this.post<ProviderTestResult, Record<string, never>>(
      `${this.baseUrl}/settings/email/test`,
      {},
      'Failed to test email provider configuration'
    );
  }

  async getEvents(): Promise<NotificationEvent[]> {
    return this.get<NotificationEvent[]>(
      `${this.baseUrl}/events`,
      'Failed to fetch notification events'
    );
  }

  async getMetrics(): Promise<NotificationMetrics> {
    return this.get<NotificationMetrics>(
      `${this.baseUrl}/metrics`,
      'Failed to fetch notification metrics'
    );
  }
}
