import { BoardCardSkeleton } from './BoardCard';

export function BoardListSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BoardCardSkeleton />
          <BoardCardSkeleton />
        </div>
      </div>
      <div>
        <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BoardCardSkeleton />
          <BoardCardSkeleton />
          <BoardCardSkeleton />
        </div>
      </div>
    </div>
  );
}
