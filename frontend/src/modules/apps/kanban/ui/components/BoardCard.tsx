/**
 * BoardCard Component
 * 
 * Displays a board preview card in the board list view.
 */

import { useTranslation } from 'react-i18next';
import { Star, Columns, LayoutGrid, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { cn } from '@/shadcn/lib/utils';
import type { BoardListItem } from '../../domain/models/Kanban';

interface BoardCardProps {
  board: BoardListItem;
  onSelect: (boardId: string) => void;
  onToggleFavorite: (boardId: string) => void;
}

export function BoardCard({ board, onSelect, onToggleFavorite }: BoardCardProps) {
  const { t } = useTranslation('kanban');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group"
      onClick={() => onSelect(board.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base group-hover:text-primary transition-colors">
            {board.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(board.id);
            }}
          >
            <Star
              className={cn(
                'h-4 w-4 transition-colors',
                board.isFavorite
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-muted-foreground hover:text-amber-500'
              )}
            />
          </Button>
        </div>
        <CardDescription className="line-clamp-2">
          {board.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Columns className="h-3.5 w-3.5" />
            <span>{board.stats.columnsCount} {t('columns')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>{board.stats.cardsCount} {t('cards')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{t('updated')} {formatDate(board.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Skeleton
// ============================================================================

export function BoardCardSkeleton() {
  return (
    <Card className="cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          <div className="h-5 w-5 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-3 w-24 bg-muted animate-pulse rounded mt-3" />
      </CardContent>
    </Card>
  );
}
