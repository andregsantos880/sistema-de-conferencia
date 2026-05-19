import React from 'react';
import { 
  ArrowLeft, 
  Archive, 
  Trash2, 
  Star, 
  Clock, 
  Tag, 
  Mail,
  MailOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { cn } from '@/shadcn/lib/utils';
import ActionButton from '@/components/forms/buttons/ActionButton';

import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/shared/ui/shadcn/components/ui/tooltip';

interface EmailReaderToolbarProps {
  onBack?: () => void;
  onStar?: () => void;
  onArchive?: () => void;
  onTrash?: () => void;
  onMarkRead?: () => void;
  onSnooze?: () => void;
  onTag?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  isStarred?: boolean;
  isRead?: boolean;
  className?: string;
  showBack?: boolean;
  navLabel?: string;
}

const TooltipWrapper: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      {children}
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-[10px] font-bold py-1 px-2">
      {label}
    </TooltipContent>
  </Tooltip>
);

export const EmailReaderToolbar: React.FC<EmailReaderToolbarProps> = ({
  onBack,
  onStar,
  onArchive,
  onTrash,
  onMarkRead,
  onSnooze,
  onTag,
  onPrev,
  onNext,
  isStarred,
  isRead,
  className,
  showBack = true,
  navLabel
}) => {
  return (
    <TooltipProvider delayDuration={400}>
      <div className={cn("flex items-center justify-between p-2", className)}>
        <div className="flex items-center gap-1">
          {showBack && onBack && (
            <TooltipWrapper label="Back">
              <ActionButton variant="ghost" size="sm" className="size-8 p-0" onClick={onBack}>
                <ArrowLeft className="size-4" />
              </ActionButton>
            </TooltipWrapper>
          )}
          
          {(onPrev || onNext) && (
            <div className="flex items-center gap-1 ml-1 px-1">
              {onPrev && (
                <TooltipWrapper label="Older">
                  <ActionButton variant="ghost" size="sm" className="size-8 p-0" onClick={onPrev}>
                    <ChevronLeft className="size-4" />
                  </ActionButton>
                </TooltipWrapper>
              )}
              {navLabel && <span className="text-[10px] font-bold text-muted-foreground px-1">{navLabel}</span>}
              {onNext && (
                <TooltipWrapper label="Newer">
                  <ActionButton variant="ghost" size="sm" className="size-8 p-0" onClick={onNext}>
                    <ChevronRight className="size-4" />
                  </ActionButton>
                </TooltipWrapper>
              )}
            </div>
          )}

          {onStar && (
            <TooltipWrapper label={isStarred ? "Unstar" : "Star"}>
              <ActionButton 
                variant="ghost" 
                size="sm" 
                className={cn("size-8 p-0", isStarred && "text-yellow-400")} 
                onClick={onStar}
              >
                <Star className={cn("size-4", isStarred && "fill-current")} />
              </ActionButton>
            </TooltipWrapper>
          )}
        </div>


        <div className="flex items-center gap-1">
          {onArchive && (
            <TooltipWrapper label="Archive">
              <ActionButton variant="ghost" size="sm" className="size-8 p-0" onClick={onArchive}>
                <Archive className="size-4 text-muted-foreground" />
              </ActionButton>
            </TooltipWrapper>
          )}
          
          {onSnooze && (
            <TooltipWrapper label="Snooze">
              <ActionButton variant="ghost" size="sm" className="size-8 p-0" onClick={onSnooze}>
                <Clock className="size-4 text-muted-foreground" />
              </ActionButton>
            </TooltipWrapper>
          )}

          {onTrash && (
            <TooltipWrapper label="Delete">
              <ActionButton variant="ghost" size="sm" className="size-8 p-0" onClick={onTrash}>
                <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
              </ActionButton>
            </TooltipWrapper>
          )}

          {onMarkRead && (
            <TooltipWrapper label={isRead ? "Mark as unread" : "Mark as read"}>
              <ActionButton variant="ghost" size="sm" className="size-8 p-0" onClick={onMarkRead}>
                {isRead ? (
                  <Mail className="size-4 text-muted-foreground" />
                ) : (
                  <MailOpen className="size-4 text-muted-foreground" />
                )}
              </ActionButton>
            </TooltipWrapper>
          )}

          {onTag && (
            <TooltipWrapper label="Label">
              <ActionButton variant="ghost" size="sm" className="size-8 p-0" onClick={onTag}>
                <Tag className="size-4 text-muted-foreground" />
              </ActionButton>
            </TooltipWrapper>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
