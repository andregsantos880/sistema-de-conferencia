/**
 * Kanban React Query Hooks
 * 
 * Provides data fetching and mutation hooks for the Kanban module.
 * Uses TanStack Query for server state management with optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useKanbanRepository } from './useKanbanRepository';
import type {
  KanbanBoard,
  BoardListItem,
  UpdateBoardDto,
  CreateCardDto,
  UpdateCardDto,
  MoveCardDto,
  CreateColumnDto,
  ReorderColumnsDto,
} from '../../domain/models/Kanban';

// ============================================================================
// Query Keys
// ============================================================================

export const KANBAN_QUERY_KEYS = {
  all: ['kanban'] as const,
  boards: () => [...KANBAN_QUERY_KEYS.all, 'boards'] as const,
  board: (id: string) => [...KANBAN_QUERY_KEYS.all, 'board', id] as const,
  card: (id: string) => [...KANBAN_QUERY_KEYS.all, 'card', id] as const,
  users: () => [...KANBAN_QUERY_KEYS.all, 'users'] as const,
  labels: () => [...KANBAN_QUERY_KEYS.all, 'labels'] as const,
};

// ============================================================================
// Board Hooks
// ============================================================================

/**
 * Fetch all boards (list view)
 */
export function useBoards() {
  const repo = useKanbanRepository();

  return useQuery({
    queryKey: KANBAN_QUERY_KEYS.boards(),
    queryFn: () => repo.getBoards(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single board with columns and cards
 */
export function useBoard(boardId: string | null) {
  const repo = useKanbanRepository();

  return useQuery({
    queryKey: KANBAN_QUERY_KEYS.board(boardId ?? ''),
    queryFn: () => repo.getBoard(boardId!),
    enabled: !!boardId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Update board details (name, description, settings)
 */
export function useUpdateBoard() {
  const repo = useKanbanRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBoardDto }) =>
      repo.updateBoard(id, dto),
    onSuccess: (updatedBoard) => {
      // Update the board in cache
      queryClient.setQueryData(
        KANBAN_QUERY_KEYS.board(updatedBoard.id),
        updatedBoard
      );
      // Invalidate boards list to reflect changes
      queryClient.invalidateQueries({ queryKey: KANBAN_QUERY_KEYS.boards() });
    },
  });
}

/**
 * Toggle board favorite status
 */
export function useToggleFavorite() {
  const repo = useKanbanRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => repo.toggleFavorite(boardId),
    onMutate: async (boardId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: KANBAN_QUERY_KEYS.boards() });
      await queryClient.cancelQueries({ queryKey: KANBAN_QUERY_KEYS.board(boardId) });

      // Snapshot previous values
      const previousBoards = queryClient.getQueryData<BoardListItem[]>(
        KANBAN_QUERY_KEYS.boards()
      );
      const previousBoard = queryClient.getQueryData<KanbanBoard>(
        KANBAN_QUERY_KEYS.board(boardId)
      );

      // Optimistically update boards list
      if (previousBoards) {
        queryClient.setQueryData<BoardListItem[]>(
          KANBAN_QUERY_KEYS.boards(),
          previousBoards.map(b =>
            b.id === boardId ? { ...b, isFavorite: !b.isFavorite } : b
          )
        );
      }

      // Optimistically update single board
      if (previousBoard) {
        queryClient.setQueryData<KanbanBoard>(
          KANBAN_QUERY_KEYS.board(boardId),
          { ...previousBoard, isFavorite: !previousBoard.isFavorite }
        );
      }

      return { previousBoards, previousBoard };
    },
    onError: (_err, boardId, context) => {
      // Rollback on error
      if (context?.previousBoards) {
        queryClient.setQueryData(KANBAN_QUERY_KEYS.boards(), context.previousBoards);
      }
      if (context?.previousBoard) {
        queryClient.setQueryData(
          KANBAN_QUERY_KEYS.board(boardId),
          context.previousBoard
        );
      }
    },
    onSettled: (_, __, boardId) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: KANBAN_QUERY_KEYS.boards() });
      queryClient.invalidateQueries({ queryKey: KANBAN_QUERY_KEYS.board(boardId) });
    },
  });
}

// ============================================================================
// Column Hooks
// ============================================================================

/**
 * Create a new column in a board
 */
export function useCreateColumn() {
  const repo = useKanbanRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, dto }: { boardId: string; dto: CreateColumnDto }) =>
      repo.createColumn(boardId, dto),
    onSuccess: (updatedBoard) => {
      queryClient.setQueryData(
        KANBAN_QUERY_KEYS.board(updatedBoard.id),
        updatedBoard
      );
      queryClient.invalidateQueries({ queryKey: KANBAN_QUERY_KEYS.boards() });
    },
  });
}

/**
 * Reorder columns in a board
 */
export function useReorderColumns() {
  const repo = useKanbanRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, dto }: { boardId: string; dto: ReorderColumnsDto }) => {
      // Simulate real backend work with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return repo.reorderColumns(boardId, dto);
    },
    onMutate: ({ boardId, dto }) => {
      // Synchronous cancellation and snapshotting
      queryClient.cancelQueries({ queryKey: KANBAN_QUERY_KEYS.board(boardId) });

      const previousBoard = queryClient.getQueryData<KanbanBoard>(
        KANBAN_QUERY_KEYS.board(boardId)
      );

      // Optimistically reorder columns
      if (previousBoard) {
        const columnMap = new Map(previousBoard.columns.map(c => [c.id, c]));
        const reorderedColumns = dto.columnIds
          .map((id, index) => {
            const column = columnMap.get(id);
            return column ? { ...column, position: index } : null;
          })
          .filter((c): c is NonNullable<typeof c> => c !== null);

        queryClient.setQueryData<KanbanBoard>(
          KANBAN_QUERY_KEYS.board(boardId),
          { ...previousBoard, columns: reorderedColumns }
        );
      }

      return { previousBoard };
    },
    onError: (_err, { boardId }, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          KANBAN_QUERY_KEYS.board(boardId),
          context.previousBoard
        );
      }
    },
    onSettled: (_, __, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: KANBAN_QUERY_KEYS.board(boardId) });
    },
  });
}

// ============================================================================
// Card Hooks
// ============================================================================

/**
 * Fetch a single card (for detail view)
 */
export function useCard(cardId: string | null) {
  const repo = useKanbanRepository();

  return useQuery({
    queryKey: KANBAN_QUERY_KEYS.card(cardId ?? ''),
    queryFn: () => repo.getCard(cardId!),
    enabled: !!cardId,
  });
}

/**
 * Create a new card
 */
export function useCreateCard() {
  const repo = useKanbanRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCardDto) => repo.createCard(dto),
    onSuccess: () => {
      // Invalidate all board queries to refresh card counts
      queryClient.invalidateQueries({ queryKey: KANBAN_QUERY_KEYS.all });
    },
  });
}

/**
 * Update card details
 */
export function useUpdateCard() {
  const repo = useKanbanRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, dto }: { cardId: string; dto: UpdateCardDto }) =>
      repo.updateCard(cardId, dto),
    onSuccess: (updatedCard) => {
      // Update card in cache
      queryClient.setQueryData(
        KANBAN_QUERY_KEYS.card(updatedCard.id),
        updatedCard
      );
      // Invalidate board queries to reflect changes
      queryClient.invalidateQueries({ queryKey: KANBAN_QUERY_KEYS.boards() });
      // Note: We don't know which board this card belongs to, so we invalidate all boards
      queryClient.invalidateQueries({ 
        queryKey: KANBAN_QUERY_KEYS.all,
        predicate: (query) => query.queryKey[1] === 'board',
      });
    },
  });
}

/**
 * Move a card (within or between columns)
 */
export function useMoveCard() {
  const repo = useKanbanRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId: _boardId, cardId, dto }: { boardId: string; cardId: string; dto: MoveCardDto }) => {
      // Simulate real backend work with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return repo.moveCard(cardId, dto);
    },
    onMutate: ({ boardId, cardId, dto }) => {
      // Synchronous cancellation
      queryClient.cancelQueries({ queryKey: KANBAN_QUERY_KEYS.board(boardId) });

      // Snapshot previous value
      const previousBoard = queryClient.getQueryData<KanbanBoard>(
        KANBAN_QUERY_KEYS.board(boardId)
      );

      // Optimistically update the cache
      if (previousBoard) {
        const newBoard = optimisticMoveCard(
          previousBoard,
          cardId,
          dto.sourceColumnId,
          dto.targetColumnId,
          dto.targetPosition
        );
        
        queryClient.setQueryData<KanbanBoard>(
          KANBAN_QUERY_KEYS.board(boardId),
          newBoard
        );
      }

      return { previousBoard };
    },
    onError: (_err, { boardId }, context) => {
      // Rollback on error
      if (context?.previousBoard) {
        queryClient.setQueryData(
          KANBAN_QUERY_KEYS.board(boardId),
          context.previousBoard
        );
      }
    },
    onSettled: (_, __, { boardId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: KANBAN_QUERY_KEYS.board(boardId)
      });
    },
  });
}

// ============================================================================
// Optimistic Update Helpers
// ============================================================================

/**
 * Helper to optimistically move a card in the board state
 */
export function optimisticMoveCard(
  board: KanbanBoard,
  cardId: string,
  sourceColumnId: string,
  targetColumnId: string,
  targetPosition: number
): KanbanBoard {
  // Handle same-column reorder
  if (sourceColumnId === targetColumnId) {
    const newColumns = board.columns.map(column => {
      if (column.id !== sourceColumnId) return column;

      const card = column.cards.find(c => c.id === cardId);
      if (!card) return column;

      const otherCards = column.cards.filter(c => c.id !== cardId);
      const newCards = [...otherCards];
      newCards.splice(targetPosition, 0, card);

      return {
        ...column,
        cards: newCards.map((c, i) => ({ ...c, position: i })),
      };
    });

    return {
      ...board,
      columns: newColumns,
      updatedAt: new Date().toISOString(),
    };
  }

  // Handle cross-column move
  const newColumns = board.columns.map(column => {
    if (column.id === sourceColumnId) {
      // Remove card from source column
      return {
        ...column,
        cards: column.cards
          .filter(c => c.id !== cardId)
          .map((c, i) => ({ ...c, position: i })),
      };
    }
    if (column.id === targetColumnId) {
      // Find the card being moved
      const sourceColumn = board.columns.find(c => c.id === sourceColumnId);
      const card = sourceColumn?.cards.find(c => c.id === cardId);
      
      if (!card) return column;

      // Insert card at target position
      const newCards = [...column.cards];
      const updatedCard = {
        ...card,
        columnId: targetColumnId,
        position: targetPosition,
      };
      newCards.splice(targetPosition, 0, updatedCard);

      return {
        ...column,
        cards: newCards.map((c, i) => ({ ...c, position: i })),
      };
    }
    return column;
  });

  return {
    ...board,
    columns: newColumns,
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Reference Data Hooks
// ============================================================================

/**
 * Fetch all users for assignee selection
 */
export function useKanbanUsers() {
  const repo = useKanbanRepository();

  return useQuery({
    queryKey: KANBAN_QUERY_KEYS.users(),
    queryFn: () => repo.getUsers(),
    staleTime: 1000 * 60 * 10, // 10 minutes - users don't change often
  });
}

/**
 * Fetch all labels for label selection
 */
export function useKanbanLabels() {
  const repo = useKanbanRepository();

  return useQuery({
    queryKey: KANBAN_QUERY_KEYS.labels(),
    queryFn: () => repo.getLabels(),
    staleTime: 1000 * 60 * 10, // 10 minutes - labels don't change often
  });
}

// ============================================================================
// Optimistic Update Helpers
// ============================================================================

/**
 * Helper to optimistically reorder cards within a column
 */
export function optimisticReorderCards(
  board: KanbanBoard,
  columnId: string,
  activeCardId: string,
  overCardId: string
): KanbanBoard {
  const newColumns = board.columns.map(column => {
    if (column.id !== columnId) return column;

    const activeIndex = column.cards.findIndex(c => c.id === activeCardId);
    const overIndex = column.cards.findIndex(c => c.id === overCardId);

    if (activeIndex === -1 || overIndex === -1) return column;

    const newCards = [...column.cards];
    const [removed] = newCards.splice(activeIndex, 1);
    newCards.splice(overIndex, 0, removed);

    return {
      ...column,
      cards: newCards.map((c, i) => ({ ...c, position: i })),
    };
  });

  return {
    ...board,
    columns: newColumns,
    updatedAt: new Date().toISOString(),
  };
}
