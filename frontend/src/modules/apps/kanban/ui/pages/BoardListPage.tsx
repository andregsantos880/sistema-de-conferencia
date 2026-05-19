/**
 * BoardListPage
 * 
 * Displays a list of all Kanban boards with favorites section.
 * Uses PageLayout for consistent async state handling.
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FolderKanban, Plus } from 'lucide-react';
import PageLayout from '@/shared/ui/components/PageLayout';
import { useBoards, useToggleFavorite } from '../../application/hooks/useKanban';
import { KANBAN_PATHS } from '../routes';
import { BoardListContent } from '../components/BoardListContent';
import { BoardListSkeleton } from '../components/BoardListSkeleton';

export function BoardListPage() {
  const { t } = useTranslation('kanban');
  const navigate = useNavigate();
  const { data: boards = [], isLoading, error } = useBoards();
  const toggleFavoriteMutation = useToggleFavorite();

  const handleSelectBoard = (boardId: string) => {
    navigate(KANBAN_PATHS.BOARD(boardId));
  };

  const handleToggleFavorite = (boardId: string) => {
    toggleFavoriteMutation.mutate(boardId);
  };

  const handleCreateBoard = () => {
    // TODO: Implement create board modal/navigation
    console.log('Create board');
  };

  return (
    <PageLayout
      title={t('title')}
      subtitle={t('description')}
      isLoading={isLoading}
      error={error}
      data={boards}
      loadingFallback={<BoardListSkeleton />}
      errorConfig={{
        title: t('errors.loadFailed'),
        description: t('errors.loadFailedDescription'),
        icon: FolderKanban,
      }}
      emptyConfig={{
        title: t('empty.title'),
        description: t('empty.description'),
        icon: FolderKanban,
        action: {
          label: t('createBoard'),
          onClick: handleCreateBoard,
          icon: Plus,
        },
      }}
    >
      {(boards) => (
        <BoardListContent
          boards={boards}
          onSelectBoard={handleSelectBoard}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </PageLayout>
  );
}
