import type { Integration, IntegrationCategory, IntegrationStatus } from '@/modules/management/integrations/domain/models';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** Icon URLs for integrations (using placeholder SVG icons) */
const INTEGRATION_ICONS: Record<string, string> = {
  slack: 'https://cdn.simpleicons.org/slack',
  'google-analytics': 'https://cdn.simpleicons.org/googleanalytics',
  stripe: 'https://cdn.simpleicons.org/stripe',
  s3: 'https://cdn.simpleicons.org/amazons3',
  webhooks: 'https://cdn.simpleicons.org/webhooks',
  github: 'https://cdn.simpleicons.org/github',
  figma: 'https://cdn.simpleicons.org/figma',
  notion: 'https://cdn.simpleicons.org/notion',
  jira: 'https://cdn.simpleicons.org/jira',
  zapier: 'https://cdn.simpleicons.org/zapier',
  intercom: 'https://cdn.simpleicons.org/intercom',
  mailchimp: 'https://cdn.simpleicons.org/mailchimp',
};

export const integrationsDb: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications to Slack channels and receive alerts in real time.',
    category: 'communication',
    providerType: 'third_party',
    status: 'connected',
    isFavorite: true,
    iconUrl: INTEGRATION_ICONS.slack,
    websiteUrl: 'https://slack.com',
    docsUrl: 'https://api.slack.com',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(1),
    connectedAt: daysAgo(30),
    lastSyncAt: daysAgo(0),
    errorMessage: null,
    usageCount: 42,
    config: {
      apiKey: 'sk_demo_***',
      workspaceId: 'T1234567',
      webhookUrl: 'https://hooks.slack.com/services/demo',
    },
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track events and conversion metrics with a lightweight analytics integration.',
    category: 'analytics',
    providerType: 'third_party',
    status: 'disconnected',
    isFavorite: false,
    iconUrl: INTEGRATION_ICONS['google-analytics'],
    websiteUrl: 'https://analytics.google.com',
    docsUrl: 'https://developers.google.com/analytics',
    createdAt: daysAgo(120),
    updatedAt: daysAgo(7),
    connectedAt: null,
    lastSyncAt: null,
    errorMessage: null,
    usageCount: 0,
    config: {
      apiKey: '',
      workspaceId: 'GA-XXXXXXX',
    },
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments, manage subscriptions, and view payouts inside Katalyst.',
    category: 'payments',
    providerType: 'third_party',
    status: 'error',
    isFavorite: true,
    iconUrl: INTEGRATION_ICONS.stripe,
    websiteUrl: 'https://stripe.com',
    docsUrl: 'https://stripe.com/docs',
    createdAt: daysAgo(200),
    updatedAt: daysAgo(0),
    connectedAt: daysAgo(60),
    lastSyncAt: daysAgo(2),
    errorMessage: 'API key revoked. Please reconnect to restore access.',
    usageCount: 128,
    config: {
      apiKey: 'sk_live_***',
      webhookUrl: 'https://example.com/webhooks/stripe',
    },
  },
  {
    id: 's3',
    name: 'Amazon S3',
    description: 'Store files and exports in an S3 bucket for long-term retention.',
    category: 'storage',
    providerType: 'third_party',
    status: 'disconnected',
    isFavorite: false,
    iconUrl: INTEGRATION_ICONS.s3,
    websiteUrl: 'https://aws.amazon.com/s3/',
    docsUrl: 'https://docs.aws.amazon.com/s3/',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(14),
    connectedAt: null,
    lastSyncAt: null,
    errorMessage: null,
    usageCount: 0,
    config: {
      workspaceId: 'bucket-demo',
    },
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Forward key events to your own systems using secure webhooks.',
    category: 'developer_tools',
    providerType: 'internal',
    status: 'connected',
    isFavorite: false,
    iconUrl: INTEGRATION_ICONS.webhooks,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(0),
    connectedAt: daysAgo(10),
    lastSyncAt: daysAgo(0),
    errorMessage: null,
    usageCount: 15,
    config: {
      webhookUrl: 'https://example.com/webhooks/katalyst',
    },
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect repositories, track issues, and automate workflows with GitHub.',
    category: 'developer_tools',
    providerType: 'third_party',
    status: 'connected',
    isFavorite: true,
    iconUrl: INTEGRATION_ICONS.github,
    websiteUrl: 'https://github.com',
    docsUrl: 'https://docs.github.com',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(1),
    connectedAt: daysAgo(45),
    lastSyncAt: daysAgo(0),
    errorMessage: null,
    usageCount: 89,
    config: {
      apiKey: 'ghp_demo_***',
      workspaceId: 'katalyst-org',
    },
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Sync design assets and embed Figma files directly in your workspace.',
    category: 'productivity',
    providerType: 'third_party',
    status: 'connected',
    isFavorite: false,
    iconUrl: INTEGRATION_ICONS.figma,
    websiteUrl: 'https://figma.com',
    docsUrl: 'https://www.figma.com/developers/api',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(3),
    connectedAt: daysAgo(25),
    lastSyncAt: daysAgo(1),
    errorMessage: null,
    usageCount: 23,
    config: {
      apiKey: 'figd_demo_***',
    },
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync pages and databases between Katalyst and your Notion workspace.',
    category: 'productivity',
    providerType: 'third_party',
    status: 'disconnected',
    isFavorite: false,
    iconUrl: INTEGRATION_ICONS.notion,
    websiteUrl: 'https://notion.so',
    docsUrl: 'https://developers.notion.com',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(10),
    connectedAt: null,
    lastSyncAt: null,
    errorMessage: null,
    usageCount: 0,
    config: {},
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Create and sync issues between Katalyst projects and Jira boards.',
    category: 'productivity',
    providerType: 'third_party',
    status: 'connected',
    isFavorite: false,
    iconUrl: INTEGRATION_ICONS.jira,
    websiteUrl: 'https://www.atlassian.com/software/jira',
    docsUrl: 'https://developer.atlassian.com/cloud/jira/platform/',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(2),
    connectedAt: daysAgo(80),
    lastSyncAt: daysAgo(0),
    errorMessage: null,
    usageCount: 56,
    config: {
      apiKey: 'jira_demo_***',
      workspaceId: 'katalyst-workspace',
    },
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect Katalyst to 5,000+ apps with automated workflows.',
    category: 'productivity',
    providerType: 'third_party',
    status: 'disconnected',
    isFavorite: false,
    iconUrl: INTEGRATION_ICONS.zapier,
    websiteUrl: 'https://zapier.com',
    docsUrl: 'https://zapier.com/developer',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    connectedAt: null,
    lastSyncAt: null,
    errorMessage: null,
    usageCount: 0,
    config: {},
  },
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Sync customer data and conversations with your Intercom workspace.',
    category: 'communication',
    providerType: 'third_party',
    status: 'connected',
    isFavorite: false,
    iconUrl: INTEGRATION_ICONS.intercom,
    websiteUrl: 'https://intercom.com',
    docsUrl: 'https://developers.intercom.com',
    createdAt: daysAgo(40),
    updatedAt: daysAgo(1),
    connectedAt: daysAgo(35),
    lastSyncAt: daysAgo(0),
    errorMessage: null,
    usageCount: 31,
    config: {
      apiKey: 'ic_demo_***',
    },
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Sync contacts and trigger email campaigns from Katalyst events.',
    category: 'communication',
    providerType: 'third_party',
    status: 'error',
    isFavorite: false,
    iconUrl: INTEGRATION_ICONS.mailchimp,
    websiteUrl: 'https://mailchimp.com',
    docsUrl: 'https://mailchimp.com/developer/',
    createdAt: daysAgo(100),
    updatedAt: daysAgo(0),
    connectedAt: daysAgo(90),
    lastSyncAt: daysAgo(5),
    errorMessage: 'OAuth token expired. Please reconnect your Mailchimp account.',
    usageCount: 12,
    config: {
      apiKey: 'mc_demo_***',
    },
  },
];

export function listIntegrations(params: {
  search?: string;
  category?: IntegrationCategory;
  status?: IntegrationStatus;
  favoritesOnly?: boolean;
}): Integration[] {
  const search = (params.search ?? '').toLowerCase().trim();
  return integrationsDb
    .filter((i) => {
      const matchesSearch = !search || `${i.name} ${i.description}`.toLowerCase().includes(search);
      const matchesCategory = !params.category || i.category === params.category;
      const matchesStatus = !params.status || i.status === params.status;
      const matchesFavorites = !params.favoritesOnly || i.isFavorite;
      return matchesSearch && matchesCategory && matchesStatus && matchesFavorites;
    })
    .sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function getIntegrationById(id: string): Integration | undefined {
  return integrationsDb.find((i) => i.id === id);
}

export function updateIntegration(id: string, patch: Partial<Integration>): Integration | undefined {
  const idx = integrationsDb.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  integrationsDb[idx] = {
    ...integrationsDb[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  return integrationsDb[idx];
}
