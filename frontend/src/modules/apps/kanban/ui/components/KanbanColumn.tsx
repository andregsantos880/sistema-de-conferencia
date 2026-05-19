/**
 * KanbanColumn Component
 * 
 * Displays a column (lane) in the Kanban board.
 * Supports drag and drop for both the column itself and cards within it.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { cn } from '@/shadcn/lib/utils';
import { KanbanCard, KanbanCardSkeleton } from './KanbanCard';
import { ScrollFadeContainer } from '@/shared/ui/components/scroll';
import type { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType, KanbanUser } from '../../domain/models/Kanban';

interface KanbanColumnProps {
  column: KanbanColumnType;
  users: KanbanUser[];
  onCardClick: (card: KanbanCardType) => void;
  onAddCard: (columnId: string, title: string) => void;
}

export function KanbanColumn({ column, users, onCardClick, onAddCard }: KanbanColumnProps) {
  const { t } = useTranslation('kanban');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: 'column', column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(column.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const cardIds = column.cards.map(c => c.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'w-72 shrink-0 flex flex-col max-h-full rounded-lg transition-all duration-200',
        isDragging && 'opacity-50 ring-2 ring-primary/50 bg-muted/30'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 p-2 bg-muted/60 rounded-xl border border-border/50 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-background/80 transition-colors"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/70" />
          </button>
          <div className="flex flex-col">
             <h3 className="font-bold text-[14px] text-foreground tracking-tight">{column.name}</h3>
             {/* <span className="text-[10px] text-muted-foreground/80 font-medium uppercase tracking-wider">
               {column.cards.length} {t('board.tasks')}
             </span> */}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-background/80"
            onClick={() => setIsAddingCard(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards Container with SimpleBar */}
      <div className="flex-1 min-h-0 relative">
        <ScrollFadeContainer className="h-full">
          <SimpleBar className="h-full">
            <div className="space-y-2 pb-2 pr-1">
              <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                {column.cards.map(card => (
                  <KanbanCard
                    key={card.id}
                    card={card}
                    users={users}
                    onClick={() => onCardClick(card)}
                  />
                ))}
              </SortableContext>

              {/* Add Card Form */}
              {isAddingCard && (
                <div className="bg-card border rounded-lg p-3 space-y-2 shadow-sm">
                  <Input
                    placeholder="Enter card title..."
                    value={newCardTitle}
                    onChange={e => setNewCardTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddCard();
                      if (e.key === 'Escape') setIsAddingCard(false);
                    }}
                    autoFocus
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddCard} className="h-7 text-xs">
                      {t('actions.add')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsAddingCard(false)}
                      className="h-7 text-xs"
                    >
                      {t('actions.cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SimpleBar>
        </ScrollFadeContainer>
      </div>

      {/* Add Card Button */}
      {!isAddingCard && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground mt-1"
          onClick={() => setIsAddingCard(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('addCard')}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Skeleton
// ============================================================================

export function KanbanColumnSkeleton() {
  return (
    <div className="w-72 shrink-0 flex flex-col max-h-full">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-5 w-6 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-6 w-6 bg-muted animate-pulse rounded" />
          <div className="h-6 w-6 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="flex-1 space-y-2">
        <KanbanCardSkeleton />
        <KanbanCardSkeleton />
        <KanbanCardSkeleton />
      </div>
    </div>
  );
}
