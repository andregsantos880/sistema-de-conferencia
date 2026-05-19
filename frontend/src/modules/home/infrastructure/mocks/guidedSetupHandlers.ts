import { http, delay } from 'msw';
import { ok, fail } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import {
  getSetupState,
  updateStepStatus,
  setCurrentStep,
  completeTourSet,
  resetSetup,
} from './guidedSetupData';
import type { SetupStepId, TourSetId } from '../../domain/models';

export const guidedSetupHandlers = [
  // Get setup state
  http.get(api('/setup'), async () => {
    await delay(300);
    return ok(getSetupState());
  }),

  // Update step status
  http.patch(api('/setup/steps/:stepId'), async ({ params, request }) => {
    await delay(200);
    const stepId = String(params.stepId) as SetupStepId;
    const body = (await request.json()) as { status: 'completed' | 'skipped' };

    const step = updateStepStatus(stepId, body.status);
    if (!step) {
      return fail('STEP_NOT_FOUND', 'Setup step not found', 404);
    }

    // Return the entire updated setup state instead of just the step
    // This allows frontend to update cache without refetching
    return ok(getSetupState());
  }),

  // Set current step
  http.post(api('/setup/current-step'), async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { stepId: SetupStepId };
    return ok(setCurrentStep(body.stepId));
  }),

  // Complete a tour set
  http.post(api('/setup/tours/:tourId/complete'), async ({ params }) => {
    await delay(200);
    const tourId = String(params.tourId) as TourSetId;
    completeTourSet(tourId);
    return ok(null);
  }),

  // Reset setup
  http.post(api('/setup/reset'), async () => {
    await delay(300);
    return ok(resetSetup());
  }),
];
