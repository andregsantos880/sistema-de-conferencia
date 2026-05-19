import React from 'react';
import { cn } from '@/shadcn/lib/utils';
import type { MessageStatus as MessageStatusType } from '../../domain/models/Chat';

interface MessageStatusProps {
  status: MessageStatusType;
  className?: string;
}

/**
 * MessageStatus - Renders the standard WhatsApp-style checkmarks for message status.
 */
export const MessageStatus: React.FC<MessageStatusProps> = ({ status, className }) => {
  return (
    <span className={cn("text-[10px] select-none", className)}>
      {status === 'sent' && (
        <span className="text-muted-foreground/50 font-medium">✔</span>
      )}
      {status === 'delivered' && (
        <span className="text-muted-foreground/50 font-medium">✔✔</span>
      )}
      {status === 'read' && (
        <span className="text-blue-500 font-bold">✔✔</span>
      )}
    </span>
  );
};
