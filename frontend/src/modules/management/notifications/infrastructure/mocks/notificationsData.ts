import type {
  EmailTemplate,
  GlobalEmailSettings,
  NotificationEvent,
  TemplateVariable,
} from '../../domain/models';
import { daysAgo } from '@/mocks/utils/demoDate';

// ============================================================================
// Variable Definitions by Event Type
// ============================================================================

const commonVariables: TemplateVariable[] = [
  { name: 'app_name', type: 'string', description: 'Application name', required: true, example: 'Katalyst' },
  { name: 'support_email', type: 'string', description: 'Support email address', required: false, example: 'support@katalyst.app' },
  { name: 'current_year', type: 'string', description: 'Current year', required: false, example: '2025' },
];

const userInviteVariables: TemplateVariable[] = [
  { name: 'user_name', type: 'string', description: 'Name of the invited user', required: true, example: 'John Doe' },
  { name: 'user_email', type: 'string', description: 'Email of the invited user', required: true, example: 'john@example.com' },
  { name: 'invited_by_name', type: 'string', description: 'Name of the person who sent the invite', required: true, example: 'Sarah Chen' },
  { name: 'workspace_name', type: 'string', description: 'Name of the workspace', required: true, example: 'Acme Workspace' },
  { name: 'invite_link', type: 'url', description: 'URL to accept the invitation', required: true, example: 'https://app.katalyst.io/invite/abc123' },
  { name: 'expires_at', type: 'date', description: 'Invitation expiration date', required: false, example: '2025-01-15' },
  ...commonVariables,
];

const passwordResetVariables: TemplateVariable[] = [
  { name: 'user_name', type: 'string', description: 'Name of the user', required: true, example: 'John Doe' },
  { name: 'reset_link', type: 'url', description: 'Password reset URL', required: true, example: 'https://app.katalyst.io/reset/xyz789' },
  { name: 'expires_in', type: 'string', description: 'Time until link expires', required: false, example: '24 hours' },
  ...commonVariables,
];

const welcomeVariables: TemplateVariable[] = [
  { name: 'user_name', type: 'string', description: 'Name of the new user', required: true, example: 'John Doe' },
  { name: 'login_link', type: 'url', description: 'Login URL', required: true, example: 'https://app.katalyst.io/login' },
  { name: 'getting_started_link', type: 'url', description: 'Getting started guide URL', required: false, example: 'https://docs.katalyst.io/start' },
  ...commonVariables,
];

const billingVariables: TemplateVariable[] = [
  { name: 'user_name', type: 'string', description: 'Name of the account holder', required: true, example: 'John Doe' },
  { name: 'plan_name', type: 'string', description: 'Subscription plan name', required: true, example: 'Pro Plan' },
  { name: 'amount', type: 'string', description: 'Billing amount', required: true, example: '$49.00' },
  { name: 'billing_date', type: 'date', description: 'Billing date', required: true, example: '2025-01-01' },
  { name: 'invoice_link', type: 'url', description: 'Link to invoice', required: false, example: 'https://app.katalyst.io/invoices/123' },
  { name: 'manage_subscription_link', type: 'url', description: 'Subscription management URL', required: false, example: 'https://app.katalyst.io/settings/billing' },
  ...commonVariables,
];

const teamVariables: TemplateVariable[] = [
  { name: 'user_name', type: 'string', description: 'Name of the user', required: true, example: 'John Doe' },
  { name: 'team_name', type: 'string', description: 'Name of the team', required: true, example: 'Engineering' },
  { name: 'invited_by_name', type: 'string', description: 'Name of the person who added them', required: true, example: 'Sarah Chen' },
  { name: 'team_link', type: 'url', description: 'Link to the team', required: false, example: 'https://app.katalyst.io/teams/eng' },
  ...commonVariables,
];

const verifyEmailVariables: TemplateVariable[] = [
  { name: 'user_name', type: 'string', description: 'Name of the user', required: true, example: 'John Doe' },
  { name: 'verification_link', type: 'url', description: 'Email verification URL', required: true, example: 'https://app.katalyst.io/verify/abc123' },
  { name: 'expires_in', type: 'string', description: 'Time until link expires', required: false, example: '48 hours' },
  ...commonVariables,
];

// ============================================================================
// Default HTML Templates
// ============================================================================

const createDefaultHtmlTemplate = (title: string, content: string, buttonText?: string, buttonVar?: string) => `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(to right, #4F46E5, #7C3AED); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; }
    .content { background: white; padding: 40px 20px; }
    .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${content}
      ${buttonText && buttonVar ? `<p style="text-align: center;"><a href="{{${buttonVar}}}" class="button">${buttonText}</a></p>` : ''}
    </div>
    <div class="footer">
      <p>© {{current_year}} {{app_name}}. All rights reserved.</p>
      <p>If you have any questions, contact us at {{support_email}}</p>
    </div>
  </div>
</body>
</html>`;

// ============================================================================
// Notification Events
// ============================================================================

export const notificationEventsDb: NotificationEvent[] = [
  // Users
  {
    id: 'evt_user_invited',
    eventId: 'user.invited',
    name: 'User Invitation',
    description: 'Sent when a user is invited to join the workspace',
    featureArea: 'Users',
    variables: userInviteVariables,
    defaultSubject: "You're invited to join {{workspace_name}}",
    defaultHtmlBody: createDefaultHtmlTemplate(
      "You're Invited!",
      `<p>Hi {{user_name}},</p>
      <p><strong>{{invited_by_name}}</strong> has invited you to join <strong>{{workspace_name}}</strong> on {{app_name}}.</p>
      <p>Click the button below to accept your invitation and get started:</p>`,
      'Accept Invitation',
      'invite_link'
    ),
    defaultPlainTextBody: `Hi {{user_name}},

{{invited_by_name}} has invited you to join {{workspace_name}} on {{app_name}}.

Click the link below to accept your invitation:
{{invite_link}}

Best regards,
The {{app_name}} Team`,
  },
  {
    id: 'evt_user_welcome',
    eventId: 'user.welcome',
    name: 'Welcome Email',
    description: 'Sent when a new user completes registration',
    featureArea: 'Users',
    variables: welcomeVariables,
    defaultSubject: 'Welcome to {{app_name}}!',
    defaultHtmlBody: createDefaultHtmlTemplate(
      'Welcome!',
      `<p>Hi {{user_name}},</p>
      <p>Welcome to {{app_name}}! We're excited to have you on board.</p>
      <p>Get started by exploring our features and setting up your workspace.</p>`,
      'Get Started',
      'login_link'
    ),
    defaultPlainTextBody: `Hi {{user_name}},

Welcome to {{app_name}}! We're excited to have you on board.

Get started by logging in:
{{login_link}}

Best regards,
The {{app_name}} Team`,
  },
  // Auth
  {
    id: 'evt_auth_password_reset',
    eventId: 'auth.password_reset',
    name: 'Password Reset',
    description: 'Sent when a user requests a password reset',
    featureArea: 'Auth',
    variables: passwordResetVariables,
    defaultSubject: 'Reset your {{app_name}} password',
    defaultHtmlBody: createDefaultHtmlTemplate(
      'Password Reset',
      `<p>Hi {{user_name}},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <p><small>This link will expire in {{expires_in}}.</small></p>`,
      'Reset Password',
      'reset_link'
    ),
    defaultPlainTextBody: `Hi {{user_name}},

We received a request to reset your password.

Click the link below to create a new password:
{{reset_link}}

This link will expire in {{expires_in}}.

If you didn't request this, you can safely ignore this email.

Best regards,
The {{app_name}} Team`,
  },
  {
    id: 'evt_auth_verify_email',
    eventId: 'auth.verify_email',
    name: 'Verify Email',
    description: 'Sent to verify a user email address',
    featureArea: 'Auth',
    variables: verifyEmailVariables,
    defaultSubject: 'Verify your email address',
    defaultHtmlBody: createDefaultHtmlTemplate(
      'Verify Your Email',
      `<p>Hi {{user_name}},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <p><small>This link will expire in {{expires_in}}.</small></p>`,
      'Verify Email',
      'verification_link'
    ),
    defaultPlainTextBody: `Hi {{user_name}},

Please verify your email address by clicking the link below:
{{verification_link}}

This link will expire in {{expires_in}}.

Best regards,
The {{app_name}} Team`,
  },
  {
    id: 'evt_auth_mfa_enabled',
    eventId: 'auth.mfa_enabled',
    name: 'MFA Enabled',
    description: 'Sent when two-factor authentication is enabled',
    featureArea: 'Auth',
    variables: [...commonVariables, { name: 'user_name', type: 'string', description: 'Name of the user', required: true, example: 'John Doe' }],
    defaultSubject: 'Two-factor authentication enabled',
    defaultHtmlBody: createDefaultHtmlTemplate(
      'Security Update',
      `<p>Hi {{user_name}},</p>
      <p>Two-factor authentication has been successfully enabled on your account.</p>
      <p>Your account is now more secure. If you didn't make this change, please contact support immediately.</p>`,
    ),
    defaultPlainTextBody: `Hi {{user_name}},

Two-factor authentication has been successfully enabled on your account.

If you didn't make this change, please contact support immediately at {{support_email}}.

Best regards,
The {{app_name}} Team`,
  },
  // Billing
  {
    id: 'evt_billing_invoice',
    eventId: 'billing.invoice',
    name: 'Invoice',
    description: 'Sent when a new invoice is generated',
    featureArea: 'Billing',
    variables: billingVariables,
    defaultSubject: 'Your {{app_name}} invoice for {{billing_date}}',
    defaultHtmlBody: createDefaultHtmlTemplate(
      'Invoice',
      `<p>Hi {{user_name}},</p>
      <p>Your invoice for <strong>{{plan_name}}</strong> is ready.</p>
      <p><strong>Amount:</strong> {{amount}}<br><strong>Date:</strong> {{billing_date}}</p>`,
      'View Invoice',
      'invoice_link'
    ),
    defaultPlainTextBody: `Hi {{user_name}},

Your invoice for {{plan_name}} is ready.

Amount: {{amount}}
Date: {{billing_date}}

View your invoice: {{invoice_link}}

Best regards,
The {{app_name}} Team`,
  },
  {
    id: 'evt_billing_payment_failed',
    eventId: 'billing.payment_failed',
    name: 'Payment Failed',
    description: 'Sent when a payment fails',
    featureArea: 'Billing',
    variables: billingVariables,
    defaultSubject: 'Payment failed for your {{app_name}} subscription',
    defaultHtmlBody: createDefaultHtmlTemplate(
      'Payment Failed',
      `<p>Hi {{user_name}},</p>
      <p>We were unable to process your payment of <strong>{{amount}}</strong> for your <strong>{{plan_name}}</strong> subscription.</p>
      <p>Please update your payment method to avoid service interruption.</p>`,
      'Update Payment Method',
      'manage_subscription_link'
    ),
    defaultPlainTextBody: `Hi {{user_name}},

We were unable to process your payment of {{amount}} for your {{plan_name}} subscription.

Please update your payment method: {{manage_subscription_link}}

Best regards,
The {{app_name}} Team`,
  },
  {
    id: 'evt_billing_subscription_cancelled',
    eventId: 'billing.subscription_cancelled',
    name: 'Subscription Cancelled',
    description: 'Sent when a subscription is cancelled',
    featureArea: 'Billing',
    variables: billingVariables,
    defaultSubject: 'Your {{app_name}} subscription has been cancelled',
    defaultHtmlBody: createDefaultHtmlTemplate(
      'Subscription Cancelled',
      `<p>Hi {{user_name}},</p>
      <p>Your <strong>{{plan_name}}</strong> subscription has been cancelled.</p>
      <p>We're sorry to see you go. If you change your mind, you can resubscribe at any time.</p>`,
      'Resubscribe',
      'manage_subscription_link'
    ),
    defaultPlainTextBody: `Hi {{user_name}},

Your {{plan_name}} subscription has been cancelled.

We're sorry to see you go. If you change your mind, you can resubscribe at any time:
{{manage_subscription_link}}

Best regards,
The {{app_name}} Team`,
  },
  // Teams
  {
    id: 'evt_team_member_added',
    eventId: 'team.member_added',
    name: 'Added to Team',
    description: 'Sent when a user is added to a team',
    featureArea: 'Teams',
    variables: teamVariables,
    defaultSubject: "You've been added to {{team_name}}",
    defaultHtmlBody: createDefaultHtmlTemplate(
      'Welcome to the Team!',
      `<p>Hi {{user_name}},</p>
      <p><strong>{{invited_by_name}}</strong> has added you to the <strong>{{team_name}}</strong> team.</p>
      <p>You can now collaborate with your team members and access shared resources.</p>`,
      'View Team',
      'team_link'
    ),
    defaultPlainTextBody: `Hi {{user_name}},

{{invited_by_name}} has added you to the {{team_name}} team.

View your team: {{team_link}}

Best regards,
The {{app_name}} Team`,
  },
  {
    id: 'evt_team_member_removed',
    eventId: 'team.member_removed',
    name: 'Removed from Team',
    description: 'Sent when a user is removed from a team',
    featureArea: 'Teams',
    variables: teamVariables,
    defaultSubject: "You've been removed from {{team_name}}",
    defaultHtmlBody: createDefaultHtmlTemplate(
      'Team Update',
      `<p>Hi {{user_name}},</p>
      <p>You have been removed from the <strong>{{team_name}}</strong> team.</p>
      <p>If you believe this was a mistake, please contact your team administrator.</p>`,
    ),
    defaultPlainTextBody: `Hi {{user_name}},

You have been removed from the {{team_name}} team.

If you believe this was a mistake, please contact your team administrator.

Best regards,
The {{app_name}} Team`,
  },
];

// ============================================================================
// Email Templates Database
// ============================================================================

export const emailTemplatesDb: EmailTemplate[] = notificationEventsDb.map((event, index) => ({
  id: `tpl_${index + 1}`,
  name: event.name,
  eventId: event.eventId,
  featureArea: event.featureArea,
  status: index < 3 ? 'Active' : index < 5 ? 'Draft' : 'Default',
  locale: 'en',
  subject: event.defaultSubject,
  htmlBody: event.defaultHtmlBody,
  plainTextBody: event.defaultPlainTextBody,
  isCustom: index < 3,
  variables: event.variables,
  versions: index < 3 ? [
    {
      id: `ver_${index}_1`,
      subject: event.defaultSubject,
      htmlBody: event.defaultHtmlBody,
      plainTextBody: event.defaultPlainTextBody,
      savedBy: 'Sarah Chen',
      savedAt: daysAgo(7),
    },
    {
      id: `ver_${index}_2`,
      subject: `[OLD] ${event.defaultSubject}`,
      htmlBody: event.defaultHtmlBody,
      plainTextBody: event.defaultPlainTextBody,
      savedBy: 'John Doe',
      savedAt: daysAgo(14),
    },
  ] : [],
  lastModified: daysAgo(index * 2),
  modifiedBy: index % 2 === 0 ? 'Sarah Chen' : 'John Doe',
  createdAt: daysAgo(30 + index * 5),
}));

// ============================================================================
// Global Settings Database
// ============================================================================

export let globalEmailSettingsDb: GlobalEmailSettings = {
  fromName: 'Katalyst',
  fromEmail: 'noreply@katalyst.app',
  replyToEmail: 'support@katalyst.app',
  defaultFooter: '<p style="text-align: center; color: #666; font-size: 12px;">© 2025 Katalyst. All rights reserved.<br>123 Tech Street, San Francisco, CA 94105</p>',
  provider: {
    name: 'Sendgrid',
    apiKey: 'SG.xxxxxxxxxxxxxxxxxxxx',
    region: 'us-east-1',
    isConfigured: true,
  },
  lastTestEmailSent: daysAgo(3),
};

// ============================================================================
// Sample Variable Values for Preview
// ============================================================================

export const sampleVariableValues: Record<string, string> = {
  app_name: 'Katalyst',
  support_email: 'support@katalyst.app',
  current_year: '2025',
  user_name: 'John Doe',
  user_email: 'john@example.com',
  invited_by_name: 'Sarah Chen',
  workspace_name: 'Acme Workspace',
  invite_link: 'https://app.katalyst.io/invite/abc123',
  expires_at: '2025-01-15',
  reset_link: 'https://app.katalyst.io/reset/xyz789',
  expires_in: '24 hours',
  login_link: 'https://app.katalyst.io/login',
  getting_started_link: 'https://docs.katalyst.io/start',
  plan_name: 'Pro Plan',
  amount: '$49.00',
  billing_date: 'January 1, 2025',
  invoice_link: 'https://app.katalyst.io/invoices/123',
  manage_subscription_link: 'https://app.katalyst.io/settings/billing',
  team_name: 'Engineering',
  team_link: 'https://app.katalyst.io/teams/eng',
  verification_link: 'https://app.katalyst.io/verify/abc123',
};

// Helper to update global settings
export function updateGlobalSettings(settings: Partial<GlobalEmailSettings>): GlobalEmailSettings {
  globalEmailSettingsDb = { ...globalEmailSettingsDb, ...settings };
  return globalEmailSettingsDb;
}
