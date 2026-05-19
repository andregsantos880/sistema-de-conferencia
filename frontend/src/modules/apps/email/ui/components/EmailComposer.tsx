import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Paperclip, Save, Trash2, ArrowLeft } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { AttachmentPreview } from '@/shared/ui/components/files';
import { FloatingFeaturePills } from '@/shared/ui/components/feedback';
import { MarkdownEditor } from '@/shared/ui/components/forms/inputs/MarkdownEditor';
import type { Attachment } from '../../domain/models/Email';

interface EmailComposerProps {
  to: string;
  onToChange: (val: string) => void;
  subject: string;
  onSubjectChange: (val: string) => void;
  body: string;
  onBodyChange: (val: string) => void;
  attachments: Attachment[];
  onAddAttachment: (att: Attachment) => void;
  onRemoveAttachment: (id: string) => void;
  onSend: () => void;
  onSaveDraft?: () => void;
  onDiscard?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  compact?: boolean;
  className?: string;
  showCcBcc?: boolean;
  onToggleCcBcc?: () => void;
  isReply?: boolean;
}

import { 
  Tooltip as TooltipRoot, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/shared/ui/shadcn/components/ui/tooltip';

const TooltipWrapper: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <TooltipRoot>
    <TooltipTrigger asChild>
      {children}
    </TooltipTrigger>
    <TooltipContent side="top" className="text-[10px] font-bold py-1 px-2">
      {label}
    </TooltipContent>
  </TooltipRoot>
);

export const EmailComposer: React.FC<EmailComposerProps> = ({
  to,
  onToChange,
  subject,
  onSubjectChange,
  body,
  onBodyChange,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  onSend,
  onSaveDraft,
  onDiscard,
  onCancel,
  isLoading = false,
  compact = false,
  className,
  showCcBcc = false,
  onToggleCcBcc,
  isReply = false,
}) => {
  const { t } = useTranslation('email');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const newAtt: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: file.type,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        name: file.name,
        sizeBytes: file.size,
      };
      onAddAttachment(newAtt);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <TooltipProvider delayDuration={400}>
      <div className={cn(
        "flex flex-col h-full bg-background relative",
        !compact && "max-h-[80vh]",
        className
      )}>
        <FloatingFeaturePills compact={compact} featureId="email:composition-tips" />
        
        <div className={cn(
          "flex-1 min-h-0 flex flex-col",
          compact ? "p-3 space-y-3" : "p-6 space-y-4"
        )}>
          {!isReply && (
            <>
              {/* Recipient Field */}
              <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                <span className="text-xs font-bold text-muted-foreground w-12 shrink-0">{t('compose.to', 'To')}</span>
                <input 
                  value={to}
                  onChange={(e) => onToChange(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none font-medium"
                />
                {!compact && onToggleCcBcc && (
                  <button 
                    onClick={onToggleCcBcc}
                    className="text-[10px] font-bold text-primary hover:underline px-2"
                  >
                    {showCcBcc ? 'Bcc/Cc' : 'Cc/Bcc'}
                  </button>
                )}
              </div>

              {/* Subject Field */}
              <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                <span className="text-xs font-bold text-muted-foreground w-12 shrink-0">{t('compose.subject', 'Subject')}</span>
                <input 
                  value={subject}
                  onChange={(e) => onSubjectChange(e.target.value)}
                  placeholder="Email subject"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none font-medium"
                />
              </div>
            </>
          )}

        {/* Attachments Area */}
        <AttachmentPreview 
          attachments={attachments} 
          onRemove={onRemoveAttachment} 
          compact={compact}
          className="mb-0 mt-0"
        />

        {/* Markdown Editor Area */}
        <div className="flex-1 min-h-0">
          <MarkdownEditor
            markdown={body}
            onChange={onBodyChange}
            placeholder={t('compose.bodyPlaceholder', 'Write your message here...')}
            className={cn(compact && "compact")}
            minHeight={compact ? "100px" : "150px"}
            renderExtraToolbarContent={() => (
              <ActionButton 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="size-4" />
              </ActionButton>
            )}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className={cn(
        "flex items-center justify-between border-t border-border/50",
        compact ? "p-3 bg-sidebar-surface/50 backdrop-blur-md" : "p-4"
      )}>
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple
            onChange={handleFileUpload} 
          />
          
          {onDiscard && (
            <TooltipWrapper label={t('compose.discard', 'Discard')}>
              <ActionButton 
                variant="ghost" 
                size="sm" 
                onClick={onDiscard}
                className={cn(
                  "text-muted-foreground hover:bg-red-500/10 hover:text-red-500 font-bold text-[10px] tracking-wider gap-2 h-8",
                  compact ? "px-2" : "px-3"
                )}
              >
                <Trash2 className="size-4" />
              </ActionButton>
            </TooltipWrapper>
          )}

          {onSaveDraft && (
            <TooltipWrapper label={t('compose.saveDraft', 'Save Draft')}>
              <ActionButton 
                variant="ghost" 
                size="sm" 
                onClick={onSaveDraft}
                className={cn(
                  "text-muted-foreground hover:bg-primary/10 hover:text-primary font-bold text-[10px] tracking-wider gap-2 h-8",
                  compact ? "px-2" : "px-3"
                )}
              >
                <Save className="size-4" />
              </ActionButton>
            </TooltipWrapper>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <TooltipWrapper label={t('compose.cancel', 'Cancel')}>
              <ActionButton variant="outline" size="sm" onClick={onCancel} disabled={isLoading} className={cn("text-[10px] font-bold tracking-wider h-8", compact ? "px-2" : "px-3")}>
                <ArrowLeft className={cn("size-3.5", !compact && "mr-1")} />
                {!compact && t('compose.cancel', 'Cancel')}
              </ActionButton>
            </TooltipWrapper>
          )}
          <TooltipWrapper label={isLoading ? t('compose.sending', 'Sending...') : (isReply ? t('compose.reply', 'Send Reply') : t('compose.send', 'Send'))}>
            <ActionButton 
              onClick={onSend} 
              size="sm" 
              disabled={isLoading || (!to.trim() && !subject.trim())} 
              className={cn(
                "rounded-xl shadow-lg shadow-primary/20 ap-2 transition-all",
                compact ? "px-3 min-w-[40px]" : "px-4 min-w-[120px]"
              )}
            >
              <Send className="size-4" />
              {!compact && <span>{isLoading ? t('compose.sending', 'Sending...') : (isReply ? t('compose.reply', 'Send Reply') : t('compose.send', 'Send'))}</span>}
            </ActionButton>
          </TooltipWrapper>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
};
