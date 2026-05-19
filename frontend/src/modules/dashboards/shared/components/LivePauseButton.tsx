import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';

export interface LivePauseButtonProps {
  isPaused: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Phase 3: Enhanced pause button for live data streams
 * 
 * Features:
 * - Toggle between play/pause states
 * - Animated icon transitions
 * - Visual feedback (color changes)
 * - Accessible with proper labels
 */
export function LivePauseButton({ isPaused, onToggle, className }: LivePauseButtonProps) {
  return (
    <Button
      variant={isPaused ? 'default' : 'ghost'}
      size="sm"
      onClick={onToggle}
      className={cn(
        'h-8 gap-1.5 transition-all duration-200',
        isPaused && 'bg-primary text-primary-foreground hover:bg-primary/90',
        className
      )}
      title={isPaused ? 'Resume updates' : 'Pause updates'}
      aria-label={isPaused ? 'Resume live updates' : 'Pause live updates'}
    >
      {isPaused ? (
        <>
          <Play className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Resume</span>
        </>
      ) : (
        <>
          <Pause className="h-3.5 w-3.5" />
          <span className="text-xs font-medium hidden sm:inline">Pause</span>
        </>
      )}
    </Button>
  );
}
