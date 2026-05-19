/**
 * Notification Service
 * 
 * A client-side service that provides a unified interface for sending notifications
 * across the application. Other modules (Users, Auth, Billing, Teams) can use this
 * service to trigger email notifications.
 * 
 * @example
 * // In a component or hook
 * const notificationService = useNotificationService();
 * 
 * // Send a user invitation email
 * await notificationService.sendEmail('user.invited', {
 *   user_name: 'John Doe',
 *   user_email: 'john@example.com',
 *   invited_by_name: 'Sarah Chen',
 *   workspace_name: 'Acme Corp',
 *   invite_link: 'https://app.example.com/invite/abc123',
 * });
 */

import type { INotificationsRepository } from '../../domain/ports/INotificationsRepository';
import type {
  EmailTemplate,
  GlobalEmailSettings,
  UpdateTemplatePayload,
  TestEmailResult,
  ProviderTestResult,
  NotificationEvent,
} from '../../domain/models';

export interface NotificationContext {
  [key: string]: string | number | boolean | undefined;
}

export interface SendEmailOptions {
  locale?: string;
  recipientEmail?: string;
}

/**
 * Notification Service class
 * Provides methods for sending emails and managing templates
 */
export class NotificationService {
  constructor(private readonly repository: INotificationsRepository) {}

  /**
   * Send an email using a template
   * @param eventId - The event ID (e.g., 'user.invited', 'auth.password_reset')
   * @param context - Variable values to inject into the template
   * @param options - Additional options like locale
   */
  async sendEmail(
    eventId: string,
    _context: NotificationContext,
    options?: SendEmailOptions
  ): Promise<TestEmailResult> {
    // In a real implementation, this would:
    // 1. Resolve the template by eventId and locale
    // 2. Replace variables with context values
    // 3. Send the email via the configured provider
    
    // For now, we simulate by finding the template and using test-send
    const templates = await this.repository.getTemplates();
    const template = templates.find(
      (t) => t.eventId === eventId && (options?.locale ? t.locale === options.locale : true)
    );

    if (!template) {
      return {
        success: false,
        message: `Template not found for event: ${eventId}`,
        sentAt: new Date().toISOString(),
      };
    }

    // If recipient email is provided, send test email
    if (options?.recipientEmail) {
      return this.repository.sendTestEmail(template.id, options.recipientEmail);
    }

    // Otherwise, return success (in production, this would actually send)
    return {
      success: true,
      message: `Email queued for event: ${eventId}`,
      sentAt: new Date().toISOString(),
    };
  }

  /**
   * Get all email templates
   */
  async getTemplates(): Promise<EmailTemplate[]> {
    return this.repository.getTemplates();
  }

  /**
   * Get a single template by ID
   */
  async getTemplate(id: string): Promise<EmailTemplate | null> {
    return this.repository.getTemplate(id);
  }

  /**
   * Update a template
   */
  async updateTemplate(id: string, data: UpdateTemplatePayload): Promise<EmailTemplate> {
    return this.repository.updateTemplate(id, data);
  }

  /**
   * Send a test email
   */
  async testSend(templateId: string, recipientEmail: string): Promise<TestEmailResult> {
    return this.repository.sendTestEmail(templateId, recipientEmail);
  }

  /**
   * Get global email settings
   */
  async getGlobalEmailSettings(): Promise<GlobalEmailSettings> {
    return this.repository.getGlobalSettings();
  }

  /**
   * Update global email settings
   */
  async updateGlobalEmailSettings(
    settings: Partial<GlobalEmailSettings>
  ): Promise<GlobalEmailSettings> {
    return this.repository.updateGlobalSettings(settings);
  }

  /**
   * Resolve a template by event ID and locale
   */
  async resolveTemplate(eventId: string, locale = 'en'): Promise<EmailTemplate | null> {
    const templates = await this.repository.getTemplates();
    return (
      templates.find((t) => t.eventId === eventId && t.locale === locale) ??
      templates.find((t) => t.eventId === eventId) ??
      null
    );
  }

  /**
   * Get all notification events
   */
  async getEvents(): Promise<NotificationEvent[]> {
    return this.repository.getEvents();
  }

  /**
   * Test the email provider configuration
   */
  async testProviderConfig(): Promise<ProviderTestResult> {
    return this.repository.testProviderConfig();
  }
}

export default NotificationService;
