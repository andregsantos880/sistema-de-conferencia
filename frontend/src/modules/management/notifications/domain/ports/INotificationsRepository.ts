import type {
  EmailTemplate,
  GlobalEmailSettings,
  UpdateTemplatePayload,
  TestEmailResult,
  ProviderTestResult,
  NotificationEvent,
  NotificationMetrics,
} from '../models';

/** List templates params */
export interface ListTemplatesParams {
  search?: string;
  featureArea?: string;
  status?: string;
}

/**
 * Notifications Repository Interface
 * 
 * Defines the contract for notification/email template data access
 */
export interface INotificationsRepository {
  // Templates
  getTemplates(params?: ListTemplatesParams): Promise<EmailTemplate[]>;
  getTemplate(id: string): Promise<EmailTemplate | null>;
  updateTemplate(id: string, data: UpdateTemplatePayload): Promise<EmailTemplate>;
  restoreTemplateDefault(id: string): Promise<EmailTemplate>;
  restoreTemplateVersion(templateId: string, versionId: string): Promise<EmailTemplate>;
  
  // Test sending
  sendTestEmail(templateId: string, recipientEmail: string): Promise<TestEmailResult>;
  
  // Global settings
  getGlobalSettings(): Promise<GlobalEmailSettings>;
  updateGlobalSettings(settings: Partial<GlobalEmailSettings>): Promise<GlobalEmailSettings>;
  testProviderConfig(): Promise<ProviderTestResult>;
  
  // Events (notification event definitions)
  getEvents(): Promise<NotificationEvent[]>;
  
  // Metrics
  getMetrics(): Promise<NotificationMetrics>;
}
