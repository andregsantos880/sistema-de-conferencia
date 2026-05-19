import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useService } from '@/app/providers/useDI';
import { EMAIL_SYMBOLS } from '../../di/symbols';
import type { IEmailRepository } from '../../infrastructure/api/EmailRepository';
import type {
  MailTray,
  MailListQuery,
  ComposeDraftDto,
} from '../../domain/models/Email';

const QUERY_KEYS = {
  folders: () => ['email', 'folders'] as const,
  labels: () => ['email', 'labels'] as const,
  messages: (tray: MailTray, query?: Partial<MailListQuery>) => 
    ['email', 'messages', tray, query] as const,
  message: (id: string) => ['email', 'message', id] as const,
};

export function useMailFolders() {
  const repo = useService<IEmailRepository>(EMAIL_SYMBOLS.IEmailRepository);

  return useQuery({
    queryKey: QUERY_KEYS.folders(),
    queryFn: () => repo.getFolders(),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useMailLabels() {
  const repo = useService<IEmailRepository>(EMAIL_SYMBOLS.IEmailRepository);

  return useQuery({
    queryKey: QUERY_KEYS.labels(),
    queryFn: () => repo.getLabels(),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useMailList(tray: MailTray, query?: Partial<MailListQuery>) {
  const repo = useService<IEmailRepository>(EMAIL_SYMBOLS.IEmailRepository);

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.messages(tray, query),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      repo.getMessages({
        tray,
        q: query?.q,
        filter: query?.filter,
        cursor: pageParam,
        limit: 30,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!tray,
  });
}

export function useMailMessage(id: string) {
  const repo = useService<IEmailRepository>(EMAIL_SYMBOLS.IEmailRepository);

  return useQuery({
    queryKey: QUERY_KEYS.message(id),
    queryFn: () => repo.getMessage(id),
    enabled: !!id,
  });
}

export function useMarkAsRead() {
  const repo = useService<IEmailRepository>(EMAIL_SYMBOLS.IEmailRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) =>
      repo.updateMessage(id, { read }),
    onSuccess: (_data, variables) => {
      // Invalidate message query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.message(variables.id) });
      // Invalidate all message lists
      queryClient.invalidateQueries({ queryKey: ['email', 'messages'] });
      // Invalidate folders to update counts
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders() });
    },
  });
}

export function useToggleStar() {
  const repo = useService<IEmailRepository>(EMAIL_SYMBOLS.IEmailRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, starred }: { id: string; starred: boolean }) =>
      repo.updateMessage(id, { starred }),
    onMutate: async ({ id, starred }) => {
      // Optimistically update
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.message(id) });
      
      const previousMessage = queryClient.getQueryData<{ id: string; starred: boolean }>(QUERY_KEYS.message(id));
      
      queryClient.setQueryData(QUERY_KEYS.message(id), { ...previousMessage, starred });
      return { previousMessage };
    },
    onError: (_err, variables, context) => {
      if (context?.previousMessage) {
        queryClient.setQueryData(QUERY_KEYS.message(variables.id), context.previousMessage);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['email', 'messages'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.message(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders() });
    },
  });
}

export function useMoveTo() {
  const repo = useService<IEmailRepository>(EMAIL_SYMBOLS.IEmailRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tray }: { id: string; tray: MailTray }) =>
      repo.updateMessage(id, { tray }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.message(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['email', 'messages'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders() });
    },
  });
}

export function useSaveDraft() {
  const repo = useService<IEmailRepository>(EMAIL_SYMBOLS.IEmailRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ComposeDraftDto) => repo.saveDraft(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages('drafts') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders() });
    },
  });
}

export function useSendReply() {
  const repo = useService<IEmailRepository>(EMAIL_SYMBOLS.IEmailRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      repo.sendReply(id, { replyToId: id, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages('sent') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders() });
    },
  });
}

export function useSendEmail() {
  const repo = useService<IEmailRepository>(EMAIL_SYMBOLS.IEmailRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ComposeDraftDto) => repo.sendEmail(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages('sent') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders() });
    },
  });
}
