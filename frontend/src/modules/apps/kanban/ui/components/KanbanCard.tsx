/**
 * KanbanCard Component
 * 
 * Displays a card within a Kanban column.
 * Supports drag and drop via @dnd-kit.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, AlertCircle, Paperclip } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import { Progress } from '@/shared/ui/shadcn/components/ui/progress';
import { cn } from '@/shadcn/lib/utils';
import type { KanbanCard as KanbanCardType, KanbanUser } from '../../domain/models/Kanban';
import { AvatarGroup, AvatarGroupTooltip, AvatarGroupTooltipArrow } from '@/shadcn/components/animate-ui/primitives/animate/avatar-group';
import { motion } from 'framer-motion';

interface KanbanCardProps {
  card: KanbanCardType;
  users: KanbanUser[];
  onClick?: () => void;
  isOverlay?: boolean;
}

const priorityConfig: Record<string, { labelKey: string; color: string }> = {
  low: { labelKey: 'priority.low', color: 'bg-slate-500' },
  medium: { labelKey: 'priority.medium', color: 'bg-blue-500' },
  high: { labelKey: 'priority.high', color: 'bg-amber-500' },
  critical: { labelKey: 'priority.critical', color: 'bg-red-500' },
};

export function KanbanCard({ card, users, onClick, isOverlay }: KanbanCardProps) {
  const { t } = useTranslation('kanban');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', card },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };


  const assignedUsers = useMemo(() => {
    const mapped = card.assigneeIds
      .map(userId => users.find(u => u.id === userId))
      .filter((user): user is KanbanUser => user !== undefined);
    return {
      displayed: mapped.slice(0, 3),
      remainingCount: Math.max(0, mapped.length - 3),
    };
  }, [card.assigneeIds, users]);

  const subtasksCount = card.subtasks?.length || 0;
  const completedSubtasksCount = card.subtasks?.filter(s => s.isCompleted).length || 0;
  const progressValue = subtasksCount > 0 ? (completedSubtasksCount / subtasksCount) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'bg-card border rounded-xl overflow-hidden cursor-pointer group flex flex-col',
        'hover:shadow-lg hover:border-primary/40 transition-all duration-300',
        isDragging && 'opacity-50 shadow-2xl ring-2 ring-primary bg-muted/40scale-105',
        isOverlay && 'shadow-2xl ring-2 ring-primary rotate-3 scale-105'
      )}
    >
      {/* Cover Image */}
      {card.coverImage && (
        <div className="relative h-36 w-full overflow-hidden border-b">
          <img 
            src={card.coverImage} 
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
            alt={card.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Labels & Meta */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {card.labels.length > 0 && card.labels.map(label => (
              <span
                key={label.id}
                className={cn('h-1.5 w-8 rounded-full shadow-sm', label.color)}
              />
            ))}
          </div>

          {(card.priority === 'critical' || card.priority === 'high') && (
            <Badge
              variant="secondary"
              className={cn(
                'text-[10px] px-1.5 py-0 h-5 font-semibold',
                card.priority === 'critical'
                  ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20'
              )}
            >
              <AlertCircle className="h-3 w-3 mr-0.5" />
              {t(priorityConfig[card.priority].labelKey)}
            </Badge>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h4 className="text-[15px] font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {card.title}
          </h4>
          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {card.description}
            </p>
          )}
        </div>

        {/* Progress Indicator */}
        {subtasksCount > 0 && (
          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex-1 mr-4">
                <Progress value={progressValue} className="h-1.5 bg-muted">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${progressValue}%` }} 
                    />
                </Progress>
              </div>
              <span className="text-muted-foreground font-medium tabular-nums">
                {completedSubtasksCount}/{subtasksCount}
              </span>
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer: User & Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <AvatarGroup className="h-7 -space-x-2" invertOverlap>
            {[
              ...assignedUsers.displayed.map(user => (
                <Avatar key={user.id} className="size-7 border-2 border-card ring-1 ring-border/50">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-[9px] font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                  <AvatarGroupTooltip className="bg-popover border border-border px-2 py-1.5 text-xs shadow-xl rounded-md">
                    <AvatarGroupTooltipArrow className="fill-border size-2.5" />
                    <motion.p layout="preserve-aspect" className="font-semibold">{user.name}</motion.p>
                  </AvatarGroupTooltip>
                </Avatar>
              )),
              ...(assignedUsers.remainingCount > 0
                ? [
                    <div
                      key="remaining"
                      className="h-7 w-7 rounded-full bg-muted border-2 border-card ring-1 ring-border/50 flex items-center justify-center text-[9px] font-bold text-muted-foreground"
                    >
                      +{assignedUsers.remainingCount}
                    </div>,
                  ]
                : []),
            ]}
          </AvatarGroup>

          <div className="flex items-center gap-3">
            {card.attachments?.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Paperclip className="h-3.5 w-3.5" />
                {card.attachments.length}
              </span>
            )}
            {card.activities.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                <MessageSquare className="h-3.5 w-3.5" />
                {card.activities.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Skeleton
// ============================================================================

export function KanbanCardSkeleton() {
  return (
    <div className="bg-card border rounded-lg p-3">
      <div className="flex gap-1 mb-2">
        <div className="h-1.5 w-8 bg-muted animate-pulse rounded-full" />
        <div className="h-1.5 w-8 bg-muted animate-pulse rounded-full" />
      </div>
      <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
      <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-2" />
      <div className="flex items-center gap-2 mb-2">
        <div className="h-5 w-16 bg-muted animate-pulse rounded" />
        <div className="h-5 w-16 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex -space-x-1.5">
          <div className="h-6 w-6 bg-muted animate-pulse rounded-full" />
          <div className="h-6 w-6 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="h-4 w-8 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
