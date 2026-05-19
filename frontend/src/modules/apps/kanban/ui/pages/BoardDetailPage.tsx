/**
 * BoardDetailPage
 * 
 * Displays a single Kanban board with columns and cards.
 * Supports drag and drop for cards and columns.
 */

import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, MoreHorizontal, Star } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { PageHeader } from '@/shared/ui/components/PageHeader';
import { cn } from '@/shadcn/lib/utils';
import { KanbanColumn, KanbanColumnSkeleton } from '../components/KanbanColumn';
import { KanbanCard } from '../components/KanbanCard';
import { CardDetailModal } from '../components/CardDetailModal';
import { KanbanFilters } from '../components/KanbanFilters';
import {
  useBoard,
  useToggleFavorite,
  // useUpdateBoard,
  useCreateColumn,
  useReorderColumns,
  useCreateCard,
  useUpdateCard,
  useMoveCard,
  useKanbanUsers,
  optimisticMoveCard,
  optimisticReorderCards,
} from '../../application/hooks/useKanban';
import { useFilter } from '@/shared/hooks/useFilter';
import type {
  KanbanCard as KanbanCardType,
  KanbanColumn as KanbanColumnType,
  KanbanBoard,
  CardFilters,
  KanbanLabel,
  UpdateCardDto,
} from '../../domain/models/Kanban';
import { DEFAULT_LABELS } from '../../domain/models/Kanban';
import { KANBAN_PATHS } from '../routes';

export function BoardDetailPage() {
  const { t } = useTranslation('kanban');
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  // Data fetching
  const { data: board, isLoading, error } = useBoard(boardId ?? null);
  const { data: users = [] } = useKanbanUsers();

  // Mutations
  const toggleFavoriteMutation = useToggleFavorite();
  // const _updateBoardMutation = useUpdateBoard(); // Available for board rename feature
  const createColumnMutation = useCreateColumn();
  const reorderColumnsMutation = useReorderColumns();
  const createCardMutation = useCreateCard();
  const updateCardMutation = useUpdateCard();
  const moveCardMutation = useMoveCard();

  // Local state
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null);
  const [activeColumn, setActiveColumn] = useState<KanbanColumnType | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [filters, setFilters] = useState<CardFilters>({});
  const [optimisticBoard, setOptimisticBoard] = useState<KanbanBoard | null>(null);

  // Use optimistic board if available, otherwise use fetched board
  const displayBoard = optimisticBoard ?? board;

  // Derive selected card from board data to keep it in sync
  const selectedCard = useMemo(() => {
    if (!selectedCardId || !displayBoard) return null;
    for (const column of displayBoard.columns) {
      const card = column.cards.find(c => c.id === selectedCardId);
      if (card) return card;
    }
    return null;
  }, [selectedCardId, displayBoard]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Get all cards for filtering
  const allCards = useMemo(() => {
    if (!displayBoard) return [];
    return displayBoard.columns.flatMap(col => col.cards);
  }, [displayBoard]);

  // Filter cards
  const { filteredItems: filteredCards } = useFilter({
    items: allCards,
    searchFields: ['title', 'description'],
    initialSearch: filters.search,
    customFilter: (card, _filters, search) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          card.title.toLowerCase().includes(searchLower) ||
          card.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Label filter
      if (filters.labelIds && filters.labelIds.length > 0) {
        const hasMatchingLabel = card.labels.some(l =>
          filters.labelIds!.includes(l.id)
        );
        if (!hasMatchingLabel) return false;
      }

      // Assignee filter
      if (filters.assigneeIds && filters.assigneeIds.length > 0) {
        const hasMatchingAssignee = card.assigneeIds.some(id =>
          filters.assigneeIds!.includes(id)
        );
        if (!hasMatchingAssignee) return false;
      }

      // Priority filter
      if (filters.priorities && filters.priorities.length > 0) {
        if (!filters.priorities.includes(card.priority)) return false;
      }

      return true;
    },
  });

  // Create a set of filtered card IDs for quick lookup
  const filteredCardIds = useMemo(
    () => new Set(filteredCards.map(c => c.id)),
    [filteredCards]
  );

  // Filter columns to only show filtered cards
  const filteredColumns = useMemo(() => {
    if (!displayBoard) return [];
    const hasFilters =
      filters.search ||
      (filters.labelIds && filters.labelIds.length > 0) ||
      (filters.assigneeIds && filters.assigneeIds.length > 0) ||
      (filters.priorities && filters.priorities.length > 0);

    if (!hasFilters) return displayBoard.columns;

    return displayBoard.columns.map(col => ({
      ...col,
      cards: col.cards.filter(card => filteredCardIds.has(card.id)),
    }));
  }, [displayBoard, filters, filteredCardIds]);

  // Handlers
  const handleBack = () => {
    navigate(KANBAN_PATHS.ROOT);
  };

  const handleToggleFavorite = () => {
    if (boardId) {
      toggleFavoriteMutation.mutate(boardId);
    }
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim() && boardId) {
      createColumnMutation.mutate({
        boardId,
        dto: { name: newColumnTitle.trim() },
      });
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const handleAddCard = (columnId: string, title: string) => {
    createCardMutation.mutate({
      title,
      columnId,
    });
  };

  const handleCardClick = (card: KanbanCardType) => {
    setSelectedCardId(card.id);
  };

  const handleSaveCard = (cardId: string, updates: UpdateCardDto) => {
    updateCardMutation.mutate({ cardId, dto: updates });
  };

  // DnD handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeId = active.id as string;

      if (!displayBoard) return;

      // Check if it's a column
      const column = displayBoard.columns.find(c => c.id === activeId);
      if (column) {
        setActiveColumn(column);
        return;
      }

      // Check if it's a card
      for (const col of displayBoard.columns) {
        const card = col.cards.find(c => c.id === activeId);
        if (card) {
          setActiveCard(card);
          return;
        }
      }
    },
    [displayBoard]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !displayBoard) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return;

      // Check if we're dragging a column
      const activeColumnIndex = displayBoard.columns.findIndex(c => c.id === activeId);
      const isActiveColumn = activeColumnIndex !== -1;

      if (isActiveColumn) {
        // We're dragging a column - find the target column
        // First check if over is a column directly
        let overColumnIndex = displayBoard.columns.findIndex(c => c.id === overId);
        
        // If not, check if over is a card and find its parent column
        if (overColumnIndex === -1) {
          for (let i = 0; i < displayBoard.columns.length; i++) {
            const col = displayBoard.columns[i];
            if (col.cards.some(c => c.id === overId)) {
              overColumnIndex = i;
              break;
            }
          }
        }

        if (overColumnIndex !== -1 && activeColumnIndex !== overColumnIndex) {
          // Dragging a column over another column - reorder optimistically
          const newColumns = [...displayBoard.columns];
          const [removed] = newColumns.splice(activeColumnIndex, 1);
          newColumns.splice(overColumnIndex, 0, removed);
          
          // Update positions
          const reorderedColumns = newColumns.map((col, idx) => ({ ...col, position: idx }));
          
          setOptimisticBoard({
            ...displayBoard,
            columns: reorderedColumns,
            updatedAt: new Date().toISOString(),
          });
        }
        return;
      }

      // Find if active is a card
      let activeCardData: KanbanCardType | null = null;
      let activeColumnId: string | null = null;

      for (const col of displayBoard.columns) {
        const card = col.cards.find(c => c.id === activeId);
        if (card) {
          activeCardData = card;
          activeColumnId = col.id;
          break;
        }
      }

      if (!activeCardData || !activeColumnId) return;

      // Find over column
      let overColumnId: string | null = null;
      const overColumn = displayBoard.columns.find(c => c.id === overId);

      if (overColumn) {
        overColumnId = overColumn.id;
      } else {
        // Check if over is a card
        for (const col of displayBoard.columns) {
          const card = col.cards.find(c => c.id === overId);
          if (card) {
            overColumnId = col.id;
            break;
          }
        }
      }

      if (!overColumnId) return;

      if (activeColumnId === overColumnId) {
        // Handle same-column reordering for live preview
        // Check if over is a card (not the column itself)
        const isOverCard = displayBoard.columns.find(c => c.id === overColumnId)?.cards.some(c => c.id === overId);
        if (isOverCard && activeId !== overId) {
          const newBoard = optimisticReorderCards(displayBoard, activeColumnId, activeId, overId);
          setOptimisticBoard(newBoard);
        }
        return;
      }

      // Move between columns
      const overCards = displayBoard.columns.find(c => c.id === overColumnId)?.cards ?? [];
      const newBoard = optimisticMoveCard(
        displayBoard,
        activeId,
        activeColumnId,
        overColumnId,
        overCards.length
      );
      setOptimisticBoard(newBoard);
    },
    [displayBoard]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveCard(null);
      setActiveColumn(null);

      if (!over || !displayBoard) {
        setOptimisticBoard(null);
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if it's a column reorder
      const activeColumnIndex = displayBoard.columns.findIndex(c => c.id === activeId);
      const isActiveColumn = activeColumnIndex !== -1;

      if (isActiveColumn) {
        // We're dropping a column - find the target column
        let overColumnIndex = displayBoard.columns.findIndex(c => c.id === overId);
        
        // If not found, check if over is a card and find its parent column
        if (overColumnIndex === -1) {
          for (let i = 0; i < displayBoard.columns.length; i++) {
            const col = displayBoard.columns[i];
            if (col.cards.some(c => c.id === overId)) {
              overColumnIndex = i;
              break;
            }
          }
        }

        if (overColumnIndex !== -1 && activeColumnIndex !== overColumnIndex) {
          // Reorder columns - use the optimistic board's column order
          const currentColumns = optimisticBoard?.columns ?? displayBoard.columns;
          const newColumnIds = currentColumns.map(c => c.id);

        reorderColumnsMutation.mutate({
          boardId: boardId!,
          dto: { columnIds: newColumnIds },
        });
      }
      
      setOptimisticBoard(null);
      return;
    }

    // Handle card movement
    let sourceColumnId: string | null = null;
    let targetColumnId: string | null = null;
    let targetPosition = 0;

    // Find source column
    for (const col of displayBoard.columns) {
      if (col.cards.some(c => c.id === activeId)) {
        sourceColumnId = col.id;
        break;
      }
    }

    // Find target column and position
    const overColumn = displayBoard.columns.find(c => c.id === overId);
    if (overColumn) {
      targetColumnId = overColumn.id;
      targetPosition = overColumn.cards.length;
    } else {
      // Over is a card
      for (const col of displayBoard.columns) {
        const cardIndex = col.cards.findIndex(c => c.id === overId);
        if (cardIndex !== -1) {
          targetColumnId = col.id;
          targetPosition = cardIndex;
          break;
        }
      }
    }

    if (!sourceColumnId || !targetColumnId) {
      setOptimisticBoard(null);
      return;
    }

    if (sourceColumnId === targetColumnId) {
      // Reorder within same column
      const newBoard = optimisticReorderCards(displayBoard, sourceColumnId, activeId, overId);
      
      // Find the new position
      const column = newBoard.columns.find(c => c.id === sourceColumnId);
      const newPosition = column?.cards.findIndex(c => c.id === activeId) ?? 0;

      moveCardMutation.mutate({
        boardId: boardId!,
        cardId: activeId,
        dto: {
          sourceColumnId,
          targetColumnId,
          targetPosition: newPosition,
        },
      });
    } else {
      // Move between columns - already handled in dragOver
      moveCardMutation.mutate({
        boardId: boardId!,
        cardId: activeId,
        dto: {
          sourceColumnId,
          targetColumnId,
          targetPosition,
        },
      });
    }

    // Clear optimistic board immediately after starting mutation
    // The cache is now updated optimistically in the hook
    setOptimisticBoard(null);
    },
    [displayBoard, boardId, reorderColumnsMutation, moveCardMutation, optimisticBoard]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="flex-1 p-4 overflow-x-auto">
          <div className="flex gap-4 h-full">
            <KanbanColumnSkeleton />
            <KanbanColumnSkeleton />
            <KanbanColumnSkeleton />
            <KanbanColumnSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !displayBoard) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
        <h3 className="text-lg font-semibold mb-2">{t('board.notFound')}</h3>
        <p className="text-muted-foreground text-sm max-w-sm mb-6">
          {t('board.notFoundDescription')}
        </p>
        <Button onClick={handleBack}>{t('board.goBack')}</Button>
      </div>
    );
  }

  const columnIds = filteredColumns.map(c => c.id);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Board Header */}
      <PageHeader
        title={displayBoard.name}
        subtitle={displayBoard.description}
        backButton={{ to: KANBAN_PATHS.ROOT }}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleToggleFavorite}
            >
              <Star
                className={cn(
                  'h-4 w-4',
                  displayBoard.isFavorite
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-muted-foreground'
                )}
              />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <KanbanFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableLabels={DEFAULT_LABELS as KanbanLabel[]}
        availableUsers={users}
      />

      {/* Board Content */}
      {filteredColumns.length === 0 && displayBoard.columns.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center min-h-0">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('noColumnsYet')}</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            {t('noColumnsDescription')}
          </p>
          <Button onClick={() => setIsAddingColumn(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addColumn')}
          </Button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 py-4 h-full">
              <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {filteredColumns.map(column => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    users={users}
                    onCardClick={handleCardClick}
                    onAddCard={handleAddCard}
                  />
                ))}
              </SortableContext>

              {/* Add Column */}
              <div className="w-72 shrink-0">
                {isAddingColumn ? (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <Input
                      placeholder="Enter column title..."
                      value={newColumnTitle}
                      onChange={e => setNewColumnTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddColumn();
                        if (e.key === 'Escape') setIsAddingColumn(false);
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddColumn}>
                        {t('actions.add')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsAddingColumn(false)}
                      >
                        {t('actions.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    onClick={() => setIsAddingColumn(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addColumn')}
                  </Button>
                )}
              </div>
            </div>

            <DragOverlay>
              {activeCard ? (
                <KanbanCard card={activeCard} users={users} isOverlay />
              ) : activeColumn ? (
                <div className="w-72 bg-card border-2 border-primary/50 rounded-lg p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted rounded" />
                    <span className="font-medium">{activeColumn.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full ml-auto">
                      {activeColumn.cards.length}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Card Detail Modal */}
      <CardDetailModal
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={open => !open && setSelectedCardId(null)}
        onSave={handleSaveCard}
        users={users}
        availableLabels={DEFAULT_LABELS as KanbanLabel[]}
      />
    </div>
  );
}
