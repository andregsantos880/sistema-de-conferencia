import React, { useMemo } from 'react';
import { Kanban, Timer, Star, Layout, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBoards } from '../../application/hooks/useKanban';
import SimpleBar from 'simplebar-react';
import { Progress } from '@/shared/ui/shadcn/components/ui/progress';
import ActionButton from '@/components/forms/buttons/ActionButton';


export const KanbanLightWidget: React.FC = () => {
  const navigate = useNavigate();
  const { data: boards = [], isLoading } = useBoards();

  const favoriteBoards = useMemo(() => {
    return boards.filter(b => b.isFavorite);
  }, [boards]);

  const recentBoards = useMemo(() => {
    return boards.slice(0, 3);
  }, [boards]);

  const displayBoards = favoriteBoards.length > 0 ? favoriteBoards : recentBoards;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 min-h-0">
        <SimpleBar className="h-full">

          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {favoriteBoards.length > 0 ? 'Favorite Boards' : 'Recent Boards'}
              </h3>
              <button 
                onClick={() => navigate('/apps/kanban')}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl bg-sidebar-hover/30 animate-pulse" />
                ))
              ) : displayBoards.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-sidebar-border rounded-2xl">
                  <Layout className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No boards found</p>
                </div>
              ) : (
                displayBoards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => navigate(`/apps/kanban/board/${board.id}`)}
                    className="flex flex-col w-full p-4 rounded-2xl bg-sidebar-surface border border-sidebar-border hover:bg-sidebar-hover transition-all group text-left space-y-4 shadow-sm"
                  >

                    <div className="flex justify-between items-start w-full">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                          <Kanban className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold truncate tracking-tight">{board.name}</h4>
                          <p className="text-[10px] text-muted-foreground truncate">{board.stats.cardsCount} tasks across {board.stats.columnsCount} columns</p>
                        </div>
                      </div>
                      {board.isFavorite && <Star className="size-3 fill-yellow-400 text-yellow-400 shrink-0" />}
                    </div>

                    <div className="space-y-2 w-full">
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        <span>Sprint Progress</span>
                        <span className="text-sidebar-foreground">65%</span>
                      </div>
                      <Progress value={65} className="h-1" />
                    </div>

                    <div className="flex items-center justify-between w-full pt-2 border-t border-sidebar-border/30">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="size-5 rounded-full border-2 border-sidebar-surface bg-sidebar-hover flex items-center justify-center text-[8px] font-bold overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" className="size-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Open Board</span>
                        <ArrowRight className="size-3" />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </SimpleBar>
      </div>

      <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-surface/10 mt-auto">
        <ActionButton 
          onClick={() => navigate('/apps/kanban')}
          className="w-full rounded-pill shadow-lg"
        >
          <Timer className="size-3" />
          Quick Task
        </ActionButton>
      </div>

    </div>
  );
};
