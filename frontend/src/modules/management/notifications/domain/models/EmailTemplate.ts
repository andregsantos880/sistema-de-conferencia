/**
 * Email Template Domain Models
 * 
 * Defines the core types for email templates and notification events
 */

/** Feature areas that templates can belong to */
export type FeatureArea = 'Users' | 'Auth' | 'Billing' | 'Teams';

/** Template status */
export type TemplateStatus = 'Active' | 'Draft' | 'Default';

/** Variable types for template placeholders */
export type VariableType = 'string' | 'url' | 'date' | 'boolean' | 'number';

/** Template variable definition */
export interface TemplateVariable {
  name: string;
  type: VariableType;
  description: string;
  required: boolean;
  example?: string;
}

/** Template version for history tracking */
export interface TemplateVersion {
  id: string;
  subject: string;
  htmlBody: string;
  plainTextBody: string;
  savedBy: string;
  savedAt: string;
}

/** Email template entity */
export interface EmailTemplate {
  id: string;
  name: string;
  eventId: string;
  featureArea: FeatureArea;
  status: TemplateStatus;
  locale: string;
  subject: string;
  htmlBody: string;
  plainTextBody: string;
  isCustom: boolean;
  variables: TemplateVariable[];
  versions: TemplateVersion[];
  lastModified: string;
  modifiedBy: string;
  createdAt: string;
}

/** Notification event definition */
export interface NotificationEvent {
  id: string;
  eventId: string;
  name: string;
  description: string;
  featureArea: FeatureArea;
  variables: TemplateVariable[];
  defaultSubject: string;
  defaultHtmlBody: string;
  defaultPlainTextBody: string;
}

/** Email provider types */
export type EmailProviderType = 'Sendgrid' | 'Mailgun' | 'SES' | 'Custom' | '';

/** Email provider configuration */
export interface EmailProvider {
  name: EmailProviderType;
  apiKey: string;
  region: string;
  isConfigured: boolean;
}

/** Global email settings */
export interface GlobalEmailSettings {
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  defaultFooter: string;
  provider: EmailProvider;
  lastTestEmailSent: string | null;
}

/** Update template payload */
export interface UpdateTemplatePayload {
  subject?: string;
  htmlBody?: string;
  plainTextBody?: string;
  locale?: string;
  status?: TemplateStatus;
  isCustom?: boolean;
}

/** Test email payload */
export interface TestEmailPayload {
  templateId: string;
  recipientEmail: string;
}

/** Test email result */
export interface TestEmailResult {
  success: boolean;
  message: string;
  sentAt: string;
}

/** Provider test result */
export interface ProviderTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

/** Email notification metrics */
export interface NotificationMetrics {
  providerConfigured: boolean;
  customizedTemplates: number;
  defaultTemplates: number;
  lastTestEmailSent: string | null;
}
