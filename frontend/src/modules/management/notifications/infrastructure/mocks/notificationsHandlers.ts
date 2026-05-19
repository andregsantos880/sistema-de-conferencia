import { http, delay } from 'msw';
import { ok, fail } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import {
  emailTemplatesDb,
  globalEmailSettingsDb,
  notificationEventsDb,
  updateGlobalSettings,
} from './notificationsData';
import type { EmailTemplate, UpdateTemplatePayload } from '../../domain/models';

// ============================================================================
// Helper Functions
// ============================================================================

function filterTemplates(params: URLSearchParams): EmailTemplate[] {
  const search = (params.get('search') || '').toLowerCase();
  const featureArea = params.get('featureArea');
  const status = params.get('status');

  return emailTemplatesDb.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search) ||
      t.eventId.toLowerCase().includes(search);
    const matchesFeature = !featureArea || featureArea === 'all' || t.featureArea === featureArea;
    const matchesStatus = !status || status === 'all' || t.status === status;
    return matchesSearch && matchesFeature && matchesStatus;
  });
}

// ============================================================================
// MSW Handlers
// ============================================================================

export const notificationsHandlers = [
  // GET /notifications/templates - List all templates
  http.get(api('/notifications/templates'), async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const templates = filterTemplates(url.searchParams);
    return ok(templates);
  }),

  // GET /notifications/templates/:id - Get single template
  http.get(api('/notifications/templates/:id'), async ({ params }) => {
    await delay(200);
    const id = String(params.id);
    const template = emailTemplatesDb.find((t) => t.id === id);
    if (!template) {
      return fail('TEMPLATE_NOT_FOUND', 'Email template not found', 404);
    }
    return ok(template);
  }),

  // PUT /notifications/templates/:id - Update template
  http.put(api('/notifications/templates/:id'), async ({ params, request }) => {
    await delay(400);
    const id = String(params.id);
    const idx = emailTemplatesDb.findIndex((t) => t.id === id);
    if (idx === -1) {
      return fail('TEMPLATE_NOT_FOUND', 'Email template not found', 404);
    }

    const body = (await request.json()) as UpdateTemplatePayload;
    const template = emailTemplatesDb[idx];

    // Save current version to history
    if (template.isCustom || body.isCustom) {
      template.versions.unshift({
        id: `ver_${Date.now()}`,
        subject: template.subject,
        htmlBody: template.htmlBody,
        plainTextBody: template.plainTextBody,
        savedBy: 'Current User',
        savedAt: new Date().toISOString(),
      });
      // Keep only last 10 versions
      template.versions = template.versions.slice(0, 10);
    }

    // Update template
    emailTemplatesDb[idx] = {
      ...template,
      ...body,
      isCustom: true,
      lastModified: new Date().toISOString(),
      modifiedBy: 'Current User',
    };

    return ok(emailTemplatesDb[idx]);
  }),

  // POST /notifications/templates/:id/restore-default - Restore to default
  http.post(api('/notifications/templates/:id/restore-default'), async ({ params }) => {
    await delay(300);
    const id = String(params.id);
    const idx = emailTemplatesDb.findIndex((t) => t.id === id);
    if (idx === -1) {
      return fail('TEMPLATE_NOT_FOUND', 'Email template not found', 404);
    }

    const template = emailTemplatesDb[idx];
    const event = notificationEventsDb.find((e) => e.eventId === template.eventId);
    if (!event) {
      return fail('EVENT_NOT_FOUND', 'Notification event not found', 404);
    }

    // Restore to default
    emailTemplatesDb[idx] = {
      ...template,
      subject: event.defaultSubject,
      htmlBody: event.defaultHtmlBody,
      plainTextBody: event.defaultPlainTextBody,
      isCustom: false,
      status: 'Default',
      lastModified: new Date().toISOString(),
      modifiedBy: 'Current User',
    };

    return ok(emailTemplatesDb[idx]);
  }),

  // POST /notifications/templates/:id/restore-version - Restore specific version
  http.post(api('/notifications/templates/:id/restore-version'), async ({ params, request }) => {
    await delay(300);
    const id = String(params.id);
    const idx = emailTemplatesDb.findIndex((t) => t.id === id);
    if (idx === -1) {
      return fail('TEMPLATE_NOT_FOUND', 'Email template not found', 404);
    }

    const body = (await request.json()) as { versionId: string };
    const template = emailTemplatesDb[idx];
    const version = template.versions.find((v) => v.id === body.versionId);
    if (!version) {
      return fail('VERSION_NOT_FOUND', 'Template version not found', 404);
    }

    // Restore version
    emailTemplatesDb[idx] = {
      ...template,
      subject: version.subject,
      htmlBody: version.htmlBody,
      plainTextBody: version.plainTextBody,
      lastModified: new Date().toISOString(),
      modifiedBy: 'Current User',
    };

    return ok(emailTemplatesDb[idx]);
  }),

  // POST /notifications/templates/:id/test-send - Send test email
  http.post(api('/notifications/templates/:id/test-send'), async ({ params, request }) => {
    await delay(1000); // Simulate email sending
    const id = String(params.id);
    const template = emailTemplatesDb.find((t) => t.id === id);
    if (!template) {
      return fail('TEMPLATE_NOT_FOUND', 'Email template not found', 404);
    }

    const body = (await request.json()) as { recipientEmail: string };
    if (!body.recipientEmail) {
      return fail('INVALID_EMAIL', 'Recipient email is required', 400);
    }

    // Update last test email sent
    updateGlobalSettings({ lastTestEmailSent: new Date().toISOString() });

    return ok({
      success: true,
      message: `Test email sent to ${body.recipientEmail}`,
      sentAt: new Date().toISOString(),
    });
  }),

  // GET /notifications/settings/email - Get global settings
  http.get(api('/notifications/settings/email'), async () => {
    await delay(200);
    return ok(globalEmailSettingsDb);
  }),

  // PUT /notifications/settings/email - Update global settings
  http.put(api('/notifications/settings/email'), async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as Partial<typeof globalEmailSettingsDb>;
    const updated = updateGlobalSettings(body);
    return ok(updated);
  }),

  // POST /notifications/settings/email/test - Test provider configuration
  http.post(api('/notifications/settings/email/test'), async () => {
    await delay(1500); // Simulate connection test
    
    // Simulate success/failure based on provider config
    if (globalEmailSettingsDb.provider.isConfigured && globalEmailSettingsDb.provider.apiKey) {
      return ok({
        success: true,
        message: 'Connection successful',
        latencyMs: Math.floor(Math.random() * 200) + 50,
      });
    }

    return ok({
      success: false,
      message: 'Provider not configured or invalid API key',
    });
  }),

  // GET /notifications/events - List all notification events
  http.get(api('/notifications/events'), async () => {
    await delay(200);
    return ok(notificationEventsDb);
  }),

  // GET /notifications/metrics - Get notification metrics
  http.get(api('/notifications/metrics'), async () => {
    await delay(200);
    const customized = emailTemplatesDb.filter((t) => t.isCustom).length;
    const defaults = emailTemplatesDb.filter((t) => !t.isCustom).length;

    return ok({
      providerConfigured: globalEmailSettingsDb.provider.isConfigured,
      customizedTemplates: customized,
      defaultTemplates: defaults,
      lastTestEmailSent: globalEmailSettingsDb.lastTestEmailSent,
    });
  }),
];
