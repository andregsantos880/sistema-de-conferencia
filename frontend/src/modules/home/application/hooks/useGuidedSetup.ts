import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGuidedSetupRepository } from './useGuidedSetupRepository';
import type { GuidedSetupState, SetupStepId, TourSetId } from '../../domain/models';

const QUERY_KEYS = {
  setup: ['home', 'setup'] as const,
};

export function useGuidedSetupState() {
  const repository = useGuidedSetupRepository();

  return useQuery({
    queryKey: QUERY_KEYS.setup,
    queryFn: () => repository.getSetupState(),
  });
}

export function useUpdateStepStatus() {
  const repository = useGuidedSetupRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stepId, status }: { stepId: SetupStepId; status: 'completed' | 'skipped' }) =>
      repository.updateStepStatus(stepId, status),
    onSuccess: (updatedSetupState: GuidedSetupState) => {
      // Update the entire setup state in cache with the response from backend
      // This avoids refetching the setup query
      queryClient.setQueryData(QUERY_KEYS.setup, updatedSetupState);
    },
  });
}

export function useSetCurrentStep() {
  const repository = useGuidedSetupRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stepId: SetupStepId) => repository.setCurrentStep(stepId),
    onSuccess: (updatedSetupState: GuidedSetupState) => {
      //void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.setup });
      queryClient.setQueryData(QUERY_KEYS.setup, updatedSetupState);
    },
  });
}

export function useCompleteTourSet() {
  const repository = useGuidedSetupRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tourId: TourSetId) => repository.completeTourSet(tourId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.setup });
    },
  });
}

export function useResetSetup() {
  const repository = useGuidedSetupRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repository.resetSetup(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.setup });
    },
  });
}
