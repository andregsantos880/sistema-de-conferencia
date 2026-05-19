import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export interface UseLiveQueryOptions<TData, TError = Error> 
  extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  queryKey: unknown[];
  queryFn: () => Promise<TData>;
  /**
   * Enable live polling (default: false)
   */
  live?: boolean;
  /**
   * Polling interval in milliseconds (default: 30000 = 30s)
   */
  pollingInterval?: number;
}

/**
 * Hook for queries with optional live polling
 */
export function useLiveQuery<TData, TError = Error>(
  options: UseLiveQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const {
    queryKey,
    queryFn,
    live = false,
    pollingInterval = 30000,
    ...queryOptions
  } = options;

  const query = useQuery<TData, TError>({
    queryKey,
    queryFn,
    staleTime: live ? pollingInterval : 5 * 60 * 1000, // 5 minutes default
    refetchInterval: live ? pollingInterval : false,
    refetchIntervalInBackground: false,
    ...queryOptions,
  });

  // Track if component is visible for smart polling
  const isVisible = useRef(true);

  useEffect(() => {
    if (!live) return;

    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden;
      
      // Refetch when becoming visible
      if (isVisible.current && query.isStale) {
        query.refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [live, query]);

  return query;
}
