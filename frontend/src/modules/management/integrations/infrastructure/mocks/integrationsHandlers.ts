import { http, delay } from 'msw';
import { ok, fail } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import { getIntegrationById, listIntegrations, updateIntegration } from './integrationsData';
import type {
  Integration,
  IntegrationListItem,
  IntegrationCategory,
  IntegrationStatus,
  UpdateIntegrationConfigPayload,
} from '../../domain/models';

function toListItem(i: Integration): IntegrationListItem {
  return {
    id: i.id,
    name: i.name,
    description: i.description,
    category: i.category,
    providerType: i.providerType,
    status: i.status,
    isFavorite: i.isFavorite,
    lastSyncAt: i.lastSyncAt ?? null,
    errorMessage: i.errorMessage ?? null,
  };
}

export const integrationsHandlers = [
  // GET /integrations
  http.get(api('/integrations'), async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);

    const search = url.searchParams.get('search') ?? '';
    const category = (url.searchParams.get('category') ?? undefined) as IntegrationCategory | undefined;
    const status = (url.searchParams.get('status') ?? undefined) as IntegrationStatus | undefined;
    const favoritesOnly = url.searchParams.get('favoritesOnly') === 'true';

    const items = listIntegrations({ search, category, status, favoritesOnly }).map(toListItem);
    return ok(items);
  }),

  // GET /integrations/:id
  http.get(api('/integrations/:id'), async ({ params }) => {
    await delay(200);
    const id = String(params.id);
    const integration = getIntegrationById(id);
    if (!integration) return fail('INTEGRATION_NOT_FOUND', 'Integration not found', 404);
    return ok(integration);
  }),

  // PUT /integrations/:id/favorite
  http.put(api('/integrations/:id/favorite'), async ({ params }) => {
    await delay(150);
    const id = String(params.id);
    const integration = getIntegrationById(id);
    if (!integration) return fail('INTEGRATION_NOT_FOUND', 'Integration not found', 404);

    const updated = updateIntegration(id, { isFavorite: !integration.isFavorite });
    return ok(toListItem(updated!));
  }),

  // POST /integrations/:id/connect
  http.post(api('/integrations/:id/connect'), async ({ params }) => {
    await delay(500);
    const id = String(params.id);
    const integration = getIntegrationById(id);
    if (!integration) return fail('INTEGRATION_NOT_FOUND', 'Integration not found', 404);

    // Simulate a realistic connect flow: sometimes resolves error
    const updated = updateIntegration(id, {
      status: 'connected',
      connectedAt: new Date().toISOString(),
      lastSyncAt: new Date().toISOString(),
      errorMessage: null,
    });

    return ok(updated!);
  }),

  // POST /integrations/:id/disconnect
  http.post(api('/integrations/:id/disconnect'), async ({ params }) => {
    await delay(350);
    const id = String(params.id);
    const integration = getIntegrationById(id);
    if (!integration) return fail('INTEGRATION_NOT_FOUND', 'Integration not found', 404);

    const updated = updateIntegration(id, {
      status: 'disconnected',
      connectedAt: null,
      lastSyncAt: null,
      errorMessage: null,
    });

    return ok(updated!);
  }),

  // PUT /integrations/:id/config
  http.put(api('/integrations/:id/config'), async ({ params, request }) => {
    await delay(300);
    const id = String(params.id);
    const integration = getIntegrationById(id);
    if (!integration) return fail('INTEGRATION_NOT_FOUND', 'Integration not found', 404);

    const payload = (await request.json()) as UpdateIntegrationConfigPayload;

    const updated = updateIntegration(id, {
      config: {
        ...integration.config,
        ...payload,
      },
    });

    return ok(updated!);
  }),
];
