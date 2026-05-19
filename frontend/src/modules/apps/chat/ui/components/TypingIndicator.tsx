import React from 'react';
import { cn } from '@/shadcn/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

/**
 * TypingIndicator - A shared component representing the "someone is typing" state.
 * Specifically styled for chat bubbles.
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className }) => {
  return (
    <div className={cn("flex flex-col items-start max-w-[85%] animate-in fade-in slide-in-from-bottom-1 duration-300", className)}>
      <div className="px-3 py-2 rounded-2xl bg-muted/30 border border-muted flex gap-1 items-center rounded-tl-none">
        <span className="size-1 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="size-1 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="size-1 bg-muted-foreground/40 rounded-full animate-bounce" />
      </div>
    </div>
  );
};
