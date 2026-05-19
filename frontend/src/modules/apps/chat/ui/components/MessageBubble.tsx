import React from 'react';
import { format } from 'date-fns';
import { FileIcon, Play, Paperclip } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';
import type { ChatMessage, Attachment } from '../../domain/models/Chat';
import { MessageStatus } from './MessageStatus';
import Linkify from 'linkify-react';

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
  avatar?: string;
  className?: string;
}

/**
 * MessageBubble - A high-fidelity, shared message bubble component.
 * Supports text, images, files, and voice messages.
 * Uses a vertical layout with status/time below the bubble.
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  showAvatar, 
  avatar,
  className 
}) => {
  const isFromMe = message.fromMe;
  const time = format(new Date(message.at), 'HH:mm');

  return (
    <div className={cn(
      "flex gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
      isFromMe ? "flex-row-reverse" : "flex-row",
      className
    )}>
      {showAvatar && !isFromMe && (
        <div className="size-8 rounded-full bg-muted overflow-hidden flex-shrink-0 mt-auto">
          {avatar ? (
            <img src={avatar} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full flex items-center justify-center text-[10px] font-bold bg-primary/10 text-primary">
              ?
            </div>
          )}
        </div>
      )}

      <div className={cn(
        "flex flex-col max-w-[75%]",
        isFromMe ? "items-end" : "items-start"
      )}>
        {/* Bubble Content */}
        <div className={cn(
          "relative px-4 py-2.5 rounded-2xl shadow-sm overflow-hidden",
          isFromMe 
            ? "bg-primary text-primary-foreground rounded-br-none" 
            : "bg-muted text-foreground rounded-bl-none border border-border/50"
        )}>
          {/* Attachments Section */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 space-y-2">
              {message.attachments.map((att) => (
                <AttachmentRenderer key={att.id} attachment={att} isFromMe={isFromMe} />
              ))}
            </div>
          )}

          {/* Text Content */}
          {message.text && (
            <div className="text-sm break-words leading-relaxed">
              <Linkify
                options={{
                  className: 'underline hover:no-underline opacity-90',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }}
              >
                {message.text}
              </Linkify>
            </div>
          )}
        </div>

        {/* Footer: Time and Status */}
        <div className={cn(
          "flex items-center gap-2 mt-1 px-1",
          isFromMe ? "flex-row" : "flex-row-reverse"
        )}>
          {isFromMe && <MessageStatus status={message.status} />}
          <span className="text-[10px] text-muted-foreground font-medium opacity-70">
            {time}
          </span>
        </div>
      </div>
    </div>
  );
};

const AttachmentRenderer: React.FC<{ attachment: Attachment; isFromMe: boolean }> = ({ attachment, isFromMe }) => {
  switch (attachment.type) {
    case 'image':
      return (
        <div className="relative group cursor-pointer overflow-hidden rounded-lg border border-black/5 dark:border-white/5">
          <img 
            src={attachment.url} 
            alt={attachment.name || 'Image'} 
            className="max-h-60 w-full object-cover transition-transform group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
      );

    case 'voice':
      return (
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl border min-w-[200px]",
          isFromMe ? "bg-white/10 border-white/20" : "bg-black/5 border-black/10 dark:bg-white/5 dark:border-white/10"
        )}>
          <button className={cn(
            "size-8 rounded-full flex items-center justify-center transition-transform active:scale-95",
            isFromMe ? "bg-white text-primary shadow-lg" : "bg-primary text-white shadow-md"
          )}>
            <Play className="size-4 fill-current ml-0.5" />
          </button>
          <div className="flex-1 space-y-1">
            <div className="h-4 flex items-center gap-0.5">
              {[...Array(20)].map((_, i) => {
                // Use a simple hash of the ID to keep the bars stable
                const seed = (attachment.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + i) * 1.5;
                const height = (Math.sin(seed) * 30 + 50); // 20% to 80%
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "w-1 rounded-full",
                      isFromMe ? "bg-white/40" : "bg-primary/30"
                    )} 
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[8px] opacity-70 font-bold tracking-tighter">
              <span>0:14</span>
              <span>VOICE MESSAGE</span>
            </div>
          </div>
        </div>
      );

    case 'file':
      return (
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer",
          isFromMe ? "hover:bg-white/10 border-white/20" : "hover:bg-black/5 border-black/10 dark:hover:bg-white/5 dark:border-white/10"
        )}>
          <div className={cn(
            "size-10 rounded-lg flex items-center justify-center",
            isFromMe ? "bg-white/20" : "bg-primary/10 text-primary"
          )}>
            <FileIcon className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate underline decoration-dotted underline-offset-4 line-clamp-1">{attachment.name}</div>
            <div className="text-[10px] opacity-60 font-medium">{attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Document'}</div>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex items-center gap-2 text-xs opacity-70 italic">
          <Paperclip className="size-4" />
          <span>Attachment</span>
        </div>
      );
  }
};
