import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/components/ui/avatar';
import type { NotificationActor } from '../../domain/models/Notification';
import { cn } from '@/shadcn/lib/utils';

interface NotificationActorInfoProps {
  actor?: NotificationActor;
  t: (key: string, defaultValue: string) => string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onAvatarClick?: (actorId: string) => void;
}

export const NotificationActorInfo: React.FC<NotificationActorInfoProps> = ({
  actor,
  t,
  className,
  size = 'md',
  onAvatarClick,
}) => {
  if (!actor) return null;

  const sizeClasses = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12', // Adjusted for header
  };

  const textClasses = {
    sm: 'text-xs',
    md: 'text-md',
    lg: 'text-lg',
  };

  const handleAvatarClick = () => {
    if (onAvatarClick) {
      onAvatarClick(actor.id);
    }
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        onClick={handleAvatarClick}
        className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
      >
        <Avatar className={cn(sizeClasses[size], "rounded-full border border-sidebar-border")}>
          <AvatarImage src={actor.avatar} alt={actor.name} />
          <AvatarFallback className={cn("bg-primary/10 text-primary", size === 'lg' ? "text-base font-black" : "text-[10px] font-bold")}>
            {actor.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </button>
      <div className="min-w-0">
        <p className={cn("font-black truncate leading-none mb-0", textClasses[size])}>{actor.name}</p>
        <p className="text-[10px] text-muted-foreground font-medium truncate">
          {t('detail.triggeredBy', 'Triggered notification')}
        </p>
      </div>
    </div>
  );
};
