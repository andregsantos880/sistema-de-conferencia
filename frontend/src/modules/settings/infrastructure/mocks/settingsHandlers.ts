import { http, delay } from 'msw';
import { ok, fail } from '../../../../mocks/utils/apiResponse';
import { api } from '../../../../mocks/utils/apiPath';
import { getDemoDate, getFormattedDemoDate, daysAgo } from '../../../../mocks/utils/demoDate';

// In-memory settings store
let userProfile = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  bio: 'Product Designer at Figma',
  location: 'San Francisco, CA',
  website: 'https://johndoe.com',
  avatar: 'https://randomuser.me/api/portraits/men/15.jpg',
};

let accountSettings = {
  emailVerified: true,
  twoFactorEnabled: true,
};

const billingInfo = {
  plan: {
    name: 'Pro Plan',
    price: 29,
    interval: 'month',
    nextPayment: getDemoDate(30).split('T')[0],  // Next payment in 30 days
    features: { projects: 'Unlimited', storage: '500 GB', teamMembers: 10 },
  },
  paymentMethods: [
    { id: '1', type: 'card', last4: '4242', expiryMonth: 12, expiryYear: new Date().getFullYear() + 2, isDefault: true },
  ],
  invoices: [
    { id: 1000, date: getFormattedDemoDate(-6), amount: '$29.00', status: 'Paid' },  // 6 days ago
    { id: 1001, date: getFormattedDemoDate(-36), amount: '$29.00', status: 'Paid' },  // ~1 month ago
    { id: 1002, date: getFormattedDemoDate(-66), amount: '$29.00', status: 'Paid' },  // ~2 months ago
  ],
};

const securitySettings = {
  sessions: [
    { id: '1', device: 'MacBook Pro • San Francisco', lastActive: 'Active now', isActive: true },
    { id: '2', device: 'iPhone 15 Pro • San Francisco', lastActive: 'Last active 2 hours ago', isActive: false },
  ],
  apiKeys: [
    { id: '1', name: 'Production API Key', keyMasked: 'sk_prod_••••••••••••••••', createdAt: daysAgo(60).split('T')[0] },  // Created 60 days ago
  ],
};

const connectedApps = [
  { id: '1', name: 'Slack', description: 'Team communication and collaboration', connected: true, icon: '💬' },
  { id: '2', name: 'GitHub', description: 'Code repository and version control', connected: true, icon: '🐙' },
  { id: '3', name: 'Google Drive', description: 'Cloud storage and file sharing', connected: false, icon: '📁' },
  { id: '4', name: 'Figma', description: 'Design and prototyping tool', connected: true, icon: '🎨' },
  { id: '5', name: 'Notion', description: 'Notes and documentation', connected: false, icon: '📝' },
  { id: '6', name: 'Linear', description: 'Issue tracking and project management', connected: true, icon: '📊' },
];

let notificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  weeklyDigest: true,
  productUpdates: true,
  marketingEmails: false,
  quietHours: { start: '22:00', end: '08:00' },
};

let userPreferences = {
  theme: 'light',
  language: 'en-US',
  timezone: 'America/Los_Angeles',
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  layoutMode: 'vertical-boxed',
};

export const settingsHandlers = [
  // Profile - GET
  http.get(api('/settings/profile'), async () => {
    await delay(400);
    return ok({ profile: userProfile });
  }),

  // Profile - PUT
  http.put(api('/settings/profile'), async ({ request }) => {
    await delay(600);
    const body = await request.json() as Record<string, unknown>;
    userProfile = { ...userProfile, ...body };
    return ok({ profile: userProfile, message: 'Profile updated successfully' });
  }),

  // Avatar Upload - POST
  http.post(api('/settings/profile/avatar'), async ({ request }) => {
    await delay(1200);
    const formData = await request.formData();
    const file = formData.get('avatar');
    
    if (!file) {
      return fail('VALIDATION_ERROR', 'Please select an image', 400);
    }

    // Simulate avatar URL
    userProfile.avatar = `https://api.example.com/avatars/${Date.now()}.jpg`;
    return ok({ avatar: userProfile.avatar, message: 'Avatar uploaded successfully' });
  }),

  // Account - GET
  http.get(api('/settings/account'), async () => {
    await delay(300);
    return ok({ account: accountSettings });
  }),

  // Account - PUT
  http.put(api('/settings/account'), async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    accountSettings = { ...accountSettings, ...body };
    return ok({ account: accountSettings, message: 'Account settings updated' });
  }),

  // Billing - GET
  http.get(api('/settings/billing'), async () => {
    await delay(500);
    return ok({ billing: billingInfo });
  }),

  // Security - GET
  http.get(api('/settings/security'), async () => {
    await delay(400);
    return ok({ security: securitySettings });
  }),

  // Security - Revoke Session
  http.delete(api('/settings/security/sessions/:sessionId'), async ({ params }) => {
    await delay(400);
    securitySettings.sessions = securitySettings.sessions.filter(s => s.id !== params.sessionId);
    return ok({ message: 'Session revoked successfully' });
  }),

  // Security - Create API Key
  http.post(api('/settings/security/api-keys'), async ({ request }) => {
    await delay(600);
    const body = await request.json() as Record<string, unknown>;
    const newKey = {
      id: String(securitySettings.apiKeys.length + 1),
      name: String(body.name || 'Unnamed Key'),
      keyMasked: `sk_prod_••••••••••••••••`,
      createdAt: new Date().toISOString().split('T')[0],
    } as const;
    securitySettings.apiKeys.push(newKey);
    return ok({ apiKey: newKey, message: 'API key created successfully' });
  }),

  // Security - Delete API Key
  http.delete(api('/settings/security/api-keys/:keyId'), async ({ params }) => {
    await delay(400);
    securitySettings.apiKeys = securitySettings.apiKeys.filter(k => k.id !== params.keyId);
    return ok({ message: 'API key deleted successfully' });
  }),

  // Apps - GET
  http.get(api('/settings/apps'), async () => {
    await delay(400);
    return ok({ apps: connectedApps });
  }),

  // Apps - Connect
  http.post(api('/settings/apps/:appId/connect'), async ({ params }) => {
    await delay(800);
    const app = connectedApps.find(a => a.id === params.appId);
    if (app) app.connected = true;
    return ok({ message: 'App connected successfully' });
  }),

  // Apps - Disconnect
  http.post(api('/settings/apps/:appId/disconnect'), async ({ params }) => {
    await delay(600);
    const app = connectedApps.find(a => a.id === params.appId);
    if (app) app.connected = false;
    return ok({ message: 'App disconnected successfully' });
  }),

  // Notifications - GET
  http.get(api('/settings/notifications'), async () => {
    await delay(300);
    return ok({ notifications: notificationPreferences });
  }),

  // Notifications - PUT
  http.put(api('/settings/notifications'), async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    notificationPreferences = { ...notificationPreferences, ...body };
    return ok({ notifications: notificationPreferences, message: 'Notification preferences updated' });
  }),

  // Preferences - GET
  http.get(api('/settings/preferences'), async () => {
    await delay(300);
    return ok({ preferences: userPreferences });
  }),

  // Preferences - PUT
  http.put(api('/settings/preferences'), async ({ request }) => {
    await delay(400);
    const body = await request.json() as Record<string, unknown>;
    userPreferences = { ...userPreferences, ...body };
    return ok({ preferences: userPreferences, message: 'Preferences updated successfully' });
  }),
];
