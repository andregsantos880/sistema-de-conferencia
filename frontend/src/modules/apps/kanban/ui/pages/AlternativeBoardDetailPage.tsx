/**
 * AlternativeBoardDetailPage
 * 
 * An optimized version of the Kanban board page that prioritizes 
 * synchronous local state updates over asynchronous cache synchronization.
 * This version eliminates the "jump-back" issue by keeping a master
 * local state that is updated instantly on drop, with background 
 * persistence and silent error rollbacks.
 */

import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, MoreHorizontal, Star } from 'lucide-react';
import './board-scroller.css';
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
import { toast } from 'sonner';

import { KanbanColumn, KanbanColumnSkeleton } from '../components/KanbanColumn';
import { KanbanCard } from '../components/KanbanCard';
import { CardDetailModal } from '../components/CardDetailModal';
import { KanbanFilters } from '../components/KanbanFilters';
import {
  useBoard,
  useToggleFavorite,
  useCreateColumn,
  useReorderColumns,
  useCreateCard,
  useUpdateCard,
  useMoveCard,
  useKanbanUsers,
  optimisticMoveCard,
  optimisticReorderCards,
} from '../../application/hooks/useKanban';
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

export function AlternativeBoardDetailPage() {
  const { t } = useTranslation('kanban');
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  // 1. DATA FETCHING (Master Source)
  const { data: serverBoard, isLoading, isFetching, error } = useBoard(boardId ?? null);
  const { data: users = [] } = useKanbanUsers();

  // 2. LOCAL STATE (Synchronous Source of Truth)
  const [board, setBoard] = useState<KanbanBoard | null>(null);

  // 3. MUTATIONS (Background persistence)
  const toggleFavoriteMutation = useToggleFavorite();
  const createColumnMutation = useCreateColumn();
  const reorderColumnsMutation = useReorderColumns();
  const createCardMutation = useCreateCard();
  const updateCardMutation = useUpdateCard();
  const moveCardMutation = useMoveCard();

  // Interaction State
  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null);
  const [activeColumn, setActiveColumn] = useState<KanbanColumnType | null>(null);
  const [originalSourceColId, setOriginalSourceColId] = useState<string | null>(null);
  
  // UI State
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [filters, setFilters] = useState<CardFilters>({});

  // Sync Logic
  const isSyncing = moveCardMutation.isPending || reorderColumnsMutation.isPending || updateCardMutation.isPending || isFetching;
  
  useEffect(() => {
    if (serverBoard && !isSyncing) {
      setBoard(serverBoard);
    }
  }, [serverBoard, isSyncing]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // Derive selected card from local board data
  const selectedCard = useMemo(() => {
    if (!selectedCardId || !board) return null;
    for (const column of board.columns) {
      const card = column.cards.find(c => c.id === selectedCardId);
      if (card) return card;
    }
    return null;
  }, [selectedCardId, board]);

  // Filter columns based on local filters
  const filteredColumns = useMemo(() => {
    if (!board) return [];
    
    const hasFilters = filters.search || (filters.labelIds && filters.labelIds.length > 0) || 
                       (filters.assigneeIds && filters.assigneeIds.length > 0) || 
                       (filters.priorities && filters.priorities.length > 0);

    if (!hasFilters) return board.columns;

    return board.columns.map(col => ({
      ...col,
      cards: col.cards.filter(card => {
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          if (!card.title.toLowerCase().includes(searchLower) && 
              !card.description.toLowerCase().includes(searchLower)) return false;
        }
        if (filters.labelIds?.length && !card.labels.some(l => filters.labelIds!.includes(l.id))) return false;
        if (filters.assigneeIds?.length && !card.assigneeIds.some(id => filters.assigneeIds!.includes(id))) return false;
        if (filters.priorities?.length && !filters.priorities.includes(card.priority)) return false;
        return true;
      }),
    }));
  }, [board, filters]);

  const columnIds = useMemo(() => filteredColumns.map(c => c.id), [filteredColumns]);

  // Handlers
  const handleToggleFavorite = () => {
    if (boardId) toggleFavoriteMutation.mutate(boardId);
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
    createCardMutation.mutate({ title, columnId });
  };

  const handleSaveCard = (cardId: string, updates: UpdateCardDto) => {
    // Optimistically update local state
    if (board) {
      const newColumns = board.columns.map(col => ({
        ...col,
        cards: col.cards.map(card => 
          card.id === cardId ? { ...card, ...updates } : card
        )
      }));
      setBoard({ ...board, columns: newColumns });
    }
    
    updateCardMutation.mutate({ cardId, dto: updates });
  };

  // ============================================================================
  // DnD HANDLERS (Synchronous Updates)
  // ============================================================================

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    if (!board) return;

    const column = board.columns.find(c => c.id === activeId);
    if (column) {
      setActiveColumn(column);
      return;
    }

    for (const col of board.columns) {
      const card = col.cards.find(c => c.id === activeId);
      if (card) {
        setActiveCard(card);
        setOriginalSourceColId(col.id);
        return;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    // 1. Handle Column Over Column (Live Reorder Preview)
    const activeColumnIndex = board.columns.findIndex(c => c.id === activeId);
    if (activeColumnIndex !== -1) {
      let overColumnIndex = board.columns.findIndex(c => c.id === overId);
      if (overColumnIndex === -1) {
        for (let i = 0; i < board.columns.length; i++) {
          if (board.columns[i].cards.some(c => c.id === overId)) {
            overColumnIndex = i;
            break;
          }
        }
      }
      if (overColumnIndex !== -1 && activeColumnIndex !== overColumnIndex) {
        const newColumns = [...board.columns];
        const [removed] = newColumns.splice(activeColumnIndex, 1);
        newColumns.splice(overColumnIndex, 0, removed);
        setBoard({ ...board, columns: newColumns.map((col, idx) => ({ ...col, position: idx })) });
      }
      return;
    }

    // 2. Handle Card Over Card/Column
    let currentActiveColId: string | null = null;
    for (const col of board.columns) {
      if (col.cards.some(c => c.id === activeId)) {
        currentActiveColId = col.id;
        break;
      }
    }
    if (!currentActiveColId) return;

    let overColId: string | null = null;
    const overCol = board.columns.find(c => c.id === overId);
    if (overCol) {
      overColId = overCol.id;
    } else {
      for (const col of board.columns) {
        if (col.cards.some(c => c.id === overId)) {
          overColId = col.id;
          break;
        }
      }
    }

    if (!overColId) return;

    // Synchronous Update for Live Preview
    if (currentActiveColId === overColId) {
      const isOverCard = board.columns.find(c => c.id === overColId)?.cards.some(c => c.id === overId);
      if (isOverCard) {
        setBoard(optimisticReorderCards(board, currentActiveColId, activeId, overId));
      }
    } else {
      setBoard(optimisticMoveCard(board, activeId, currentActiveColId, overColId, 0));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const previousState = board;
    setActiveCard(null);
    setActiveColumn(null);
    
    // Capture starting info before clearing
    const sourceColId = originalSourceColId;
    setOriginalSourceColId(null);

    if (!over || !board) return;

    const activeId = active.id as string;

    // Check if it's a column reorder
    const isColumn = board.columns.some(c => c.id === activeId);

    if (isColumn) {
      const currentIds = board.columns.map(c => c.id);
      reorderColumnsMutation.mutate(
        { boardId: boardId!, dto: { columnIds: currentIds } },
        { onError: () => {
             toast.error(t('actions.errorMove'));
             setBoard(previousState);
          }
        }
      );
      return;
    }

    // Handle card movement
    // Find where the card ended up in our local state
    let targetColId: string | null = null;
    let targetPos = 0;

    for (const col of board.columns) {
      const idx = col.cards.findIndex(c => c.id === activeId);
      if (idx !== -1) {
        targetColId = col.id;
        targetPos = idx;
        break;
      }
    }

    if (!sourceColId || !targetColId) return;

    moveCardMutation.mutate(
      {
        boardId: boardId!,
        cardId: activeId,
        dto: { 
          sourceColumnId: sourceColId, 
          targetColumnId: targetColId, 
          targetPosition: targetPos 
        },
      },
      {
        onError: () => {
          toast.error(t('actions.errorMove'));
          setBoard(previousState);
        }
      }
    );
  };

  // Rendering
  if (isLoading && !board) {
    return (
      <div className="flex-1 p-4 overflow-x-auto">
        <div className="flex gap-4 h-full">
          <KanbanColumnSkeleton />
          <KanbanColumnSkeleton />
          <KanbanColumnSkeleton />
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
        <h3 className="text-lg font-semibold mb-2">{t('board.notFound')}</h3>
        <Button onClick={() => navigate(KANBAN_PATHS.ROOT)}>{t('board.goBack')}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full p-6">
      <PageHeader
        title={board.name}
        subtitle={board.description}
        backButton={{ to: KANBAN_PATHS.ROOT }}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleToggleFavorite}>
              <Star className={cn('h-4 w-4', board.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground')} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <KanbanFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableLabels={DEFAULT_LABELS as KanbanLabel[]}
        availableUsers={users}
      />

      <div 
        className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden kanban-board"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 py-4 h-full min-w-max px-2">
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              {filteredColumns.map(column => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  users={users}
                  onCardClick={(card) => setSelectedCardId(card.id)}
                  onAddCard={handleAddCard}
                />
              ))}
            </SortableContext>

            {/* Add Column */}
            <div className="w-72 shrink-0">
              {isAddingColumn ? (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2 font-premium">
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
                    <Button size="sm" onClick={handleAddColumn}>{t('actions.add')}</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsAddingColumn(false)}>{t('actions.cancel')}</Button>
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
                <span className="font-medium">{activeColumn.name}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

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
