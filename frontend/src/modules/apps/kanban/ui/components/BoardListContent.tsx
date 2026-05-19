import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { BoardCard } from './BoardCard';
import type { BoardListItem } from '../../domain/models/Kanban';

interface BoardListContentProps {
  boards: BoardListItem[];
  onSelectBoard: (boardId: string) => void;
  onToggleFavorite: (boardId: string) => void;
}

export function BoardListContent({ boards, onSelectBoard, onToggleFavorite }: BoardListContentProps) {
  const { t } = useTranslation('kanban');
  
  const favoriteBoards = boards.filter((b) => b.isFavorite);
  const otherBoards = boards.filter((b) => !b.isFavorite);

  return (
    <div className="space-y-8">
      {/* Favorites Section */}
      {favoriteBoards.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <h2 className="text-lg font-semibold">{t('favorites')}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onSelect={onSelectBoard}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Boards Section */}
      <section>
        <h2 className="text-lg font-semibold mb-4">{t('allBoards')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherBoards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onSelect={onSelectBoard}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
