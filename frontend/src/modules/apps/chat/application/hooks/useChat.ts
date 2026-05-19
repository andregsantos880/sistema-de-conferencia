import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useService } from '@/app/providers/useDI';
import { CHAT_SYMBOLS } from '../../di/symbols';
import type { IChatRepository } from '../../infrastructure/api/ChatRepository';
import type {
  Conversation,
  SendMessageDto,
  ConversationFilters,
} from '../../domain/models/Chat';

const QUERY_KEYS = {
  conversations: (filters?: ConversationFilters) => ['chat', 'conversations', filters] as const,
  messages: (convId: string) => ['chat', 'messages', convId] as const,
  contact: (convId: string) => ['chat', 'contact', convId] as const,
};

export function useConversations(filters?: ConversationFilters) {
  const repo = useService<IChatRepository>(CHAT_SYMBOLS.IChatRepository);

  return useQuery({
    queryKey: QUERY_KEYS.conversations(filters),
    queryFn: () => repo.getConversations(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useMessages(convId: string) {
  const repo = useService<IChatRepository>(CHAT_SYMBOLS.IChatRepository);

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.messages(convId),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      repo.getMessages({
        convId,
        cursor: pageParam,
        limit: 30,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!convId,
  });
}

export function useSendMessage() {
  const repo = useService<IChatRepository>(CHAT_SYMBOLS.IChatRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: SendMessageDto) => repo.sendMessage(dto),
    onMutate: async (dto) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.messages(dto.convId) });

      // Snapshot previous value
      interface MessagePage {
        messages: Array<Record<string, unknown>>;
      }
      const previousMessages = queryClient.getQueryData<{ pages: MessagePage[] }>(QUERY_KEYS.messages(dto.convId));

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.messages(dto.convId), (old: { pages: MessagePage[] } | undefined) => {
        if (!old) return old;

        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          convId: dto.convId,
          fromMe: true,
          text: dto.text,
          attachments: dto.attachments,
          at: new Date().toISOString(),
          status: 'sent' as const,
        };

        return {
          ...old,
          pages: old.pages.map((page, index) =>
            index === 0
              ? { ...page, messages: [...page.messages, optimisticMessage] }
              : page
          ),
        };
      });

      return { previousMessages };
    },
    onError: (_err, dto, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(QUERY_KEYS.messages(dto.convId), context.previousMessages);
      }
    },
    onSuccess: (_data, dto) => {
      const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages(dto.convId) });
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      };

      // Staggered refetch peaks to capture mock lifecycle states
      
      // Stage 1: Capture 'Delivered' status
      setTimeout(invalidate, 1000);
      
      // Stage 2: Capture 'Read' status & 'Typing: true'
      setTimeout(invalidate, 2500);
      
      // Stage 3: Capture Final Response & 'Typing: false'
      setTimeout(invalidate, 5000);
    },
  });
}

export function useContact(convId: string) {
  const repo = useService<IChatRepository>(CHAT_SYMBOLS.IChatRepository);

  return useQuery({
    queryKey: QUERY_KEYS.contact(convId),
    queryFn: () => repo.getContact(convId),
    enabled: !!convId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useMarkAsRead() {
  const repo = useService<IChatRepository>(CHAT_SYMBOLS.IChatRepository);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (convId: string) => repo.markAsRead(convId),
    onMutate: async (convId) => {
      // Optimistically update conversation
      await queryClient.cancelQueries({ queryKey: ['chat', 'conversations'] });

      queryClient.setQueriesData<Conversation[]>(
        { queryKey: ['chat', 'conversations'] },
        (old) => {
          if (!old) return old;
          return old.map((conv) =>
            conv.id === convId ? { ...conv, unread: 0 } : conv
          );
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });
}
