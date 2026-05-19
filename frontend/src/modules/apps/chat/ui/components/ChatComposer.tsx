import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Paperclip, Mic, Smile } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';
import ActionButton from '@/components/forms/buttons/ActionButton';
import FieldText from '@/shared/ui/components/forms/composites/field/FieldText';
import { AttachmentPreview } from '@/shared/ui/components/files';
import { FloatingFeaturePills } from '@/shared/ui/components/feedback';
import type { Attachment } from '../../domain/models/Chat';

interface ChatComposerProps {
  value: string;
  onValueChange: (value: string) => void;
  onSend: () => void;
  attachments: Attachment[];
  onAddAttachment: (attachment: Attachment) => void;
  onRemoveAttachment: (id: string) => void;
  isLoading?: boolean;
  compact?: boolean;
  className?: string;
  placeholder?: string;
}

/**
 * ChatComposer - A shared component for the chat message input area.
 */
export const ChatComposer: React.FC<ChatComposerProps> = ({
  value,
  onValueChange,
  onSend,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  isLoading = false,
  compact = false,
  className,
  placeholder,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '#',
      name: file.name,
      size: file.size,
    };
    onAddAttachment(newAtt);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      onAddAttachment({
        id: `att-${Date.now()}-voice`,
        type: 'voice',
        url: '#',
        name: 'Voice message',
      });
      setIsRecording(false);
    } else {
      setIsRecording(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !compact) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={cn(
      "flex-shrink-0 bg-background relative",
      compact ? "p-3 border-t border-sidebar-border/50 bg-sidebar-surface/10" : "p-4 border-t",
      className
    )}>
      <FloatingFeaturePills compact={compact} featureId="chat:media-features" />
      <AttachmentPreview
        attachments={attachments} 
        onRemove={onRemoveAttachment} 
        compact={compact}
        className="mb-2"
      />

      <div className="flex items-center gap-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload} 
        />
        
        {!compact && (
          <ActionButton variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary">
            <Smile className="size-5" />
          </ActionButton>
        )}

        <ActionButton 
          variant="ghost" 
          size="icon" 
          className="shrink-0 text-muted-foreground hover:text-primary"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className={cn(compact ? "size-4" : "size-5")} />
        </ActionButton>

        <div className="flex-1 relative">
          {compact ? (
             <FieldText 
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder={isRecording ? 'Recording...' : (placeholder || t('typeMessage', 'Type message'))}
                disabled={isRecording || isLoading}
                className="bg-sidebar-background border-none ring-0 focus-visible:ring-1 focus-visible:ring-primary/20"
             />
          ) : (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? 'Recording voice...' : (placeholder || t('typeMessage', 'Type a message'))}
              disabled={isRecording || isLoading}
              className="w-full resize-none rounded-2xl border border-input bg-muted/50 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-h-[120px]"
              rows={1}
            />
          )}
        </div>

        <ActionButton 
          variant={isRecording ? "destructive" : "ghost"} 
          size="icon" 
          className={cn(
            "shrink-0 transition-all",
            isRecording && "animate-pulse"
          )}
          onClick={handleVoiceRecord}
        >
          <Mic className={cn(compact ? "size-4" : "size-5", isRecording ? "text-white" : "text-muted-foreground")} />
        </ActionButton>

        <button 
          onClick={onSend}
          disabled={(!value.trim() && attachments.length === 0) || isLoading}
          className={cn(
            "shrink-0 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50",
            compact ? "size-9" : "size-10"
          )}
        >
          <Send className={cn(compact ? "size-4" : "size-5")} />
        </button>
      </div>
    </div>
  );
};
