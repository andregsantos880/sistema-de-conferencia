import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { 
  ArrowLeft, 
  Clock,
  Search
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import SimpleBar from 'simplebar-react';
import { useConversations, useMessages, useSendMessage, useMarkAsRead } from '../../application/hooks/useChat';
import FieldText from '@/shared/ui/components/forms/composites/field/FieldText';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/components/ui/avatar';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { TypingIndicator, PresenceStatus, MessageBubble, ChatComposer } from '../components';
import { useClipboardPaste } from '@/shared/hooks';
import { FileUploadDropOverlay } from '@/shared/ui/components/files';
import type { Attachment } from '../../domain/models/Chat';


export const ChatLightWidget: React.FC = () => {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  
  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!selectedConvId ? (
          <ConversationListStage key="list" onSelect={setSelectedConvId} />
        ) : (
          <MessageThreadStage key="thread" convId={selectedConvId} onBack={() => setSelectedConvId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-Stages ---

const ConversationListStage: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('chat');
  const { data: conversations = [], isLoading } = useConversations();

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  }, [conversations, search]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="p-4 border-b border-sidebar-border/50">
        <FieldText 
          placeholder={t('searchContact', 'Search contact')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="size-4" />}
          className="bg-sidebar-surface/50 border-sidebar-border"
        />
      </div>

      <div className="flex-1 min-h-0">
        <SimpleBar className="h-full">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="flex flex-col gap-4 p-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="size-10 rounded-full bg-sidebar-hover" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-2 bg-sidebar-hover rounded w-1/3" />
                      <div className="h-2 bg-sidebar-hover rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {t('noConversations', 'No conversations found')}
              </div>
            ) : (
              filtered.map((conv) => (
                <button 
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className="flex gap-3 p-3 w-full rounded-xl hover:bg-sidebar-hover transition-colors text-left group"
                >
                  <div className="relative shrink-0">
                    <Avatar className="size-10 rounded-2xl border border-sidebar-border shadow-sm">
                      <AvatarImage src={conv.avatar} />
                      <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                        {conv.title[0]}
                      </AvatarFallback>
                    </Avatar>
                    {conv.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-500 rounded-full border-2 border-sidebar-background shadow-sm" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-xs font-bold truncate">{conv.title}</h4>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(conv.lastAt), { addSuffix: false })}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate leading-relaxed">
                      {conv.unread > 0 ? (
                        <span className="font-bold text-sidebar-foreground">{conv.lastMessage}</span>
                      ) : (
                        conv.lastMessage
                      )}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="shrink-0 size-4 rounded-full bg-primary flex items-center justify-center text-[8px] font-black text-white mt-1">
                      {conv.unread}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </SimpleBar>
      </div>

      <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-surface/5">
         <ActionButton 
           onClick={() => navigate('/apps/chat')}
           className="w-full rounded-pill shadow-lg"
         >
           Start New Chat
         </ActionButton>
      </div>

    </motion.div>
  );
};

const MessageThreadStage: React.FC<{ convId: string; onBack: () => void }> = ({ convId, onBack }) => {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: conversations = [] } = useConversations();
  const conversation = conversations.find(c => c.id === convId);
  
  const { data: msgData, isLoading } = useMessages(convId);
  const sendMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const [attachments, setAttachments] = useState<Attachment[]>([]);


  const allMessages = useMemo(() => msgData?.pages.flatMap(p => p.messages) || [], [msgData]);

  useEffect(() => {
    if (conversation?.unread && conversation.unread > 0) {
      markAsReadMutation.mutate(convId);
    }
  }, [convId, conversation?.unread]);

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages.length, conversation?.typing, attachments.length]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newAttachments: Attachment[] = acceptedFiles.map(file => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '#',
      name: file.name,
      size: file.size,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'text/plain': [],
    }
  });

  useClipboardPaste({
    enableFiles: true,
    onFilesPaste: onDrop
  });

  const handleSend = () => {
    if ((!message.trim() && attachments.length === 0) || sendMutation.isPending) return;
    sendMutation.mutate({ 
      convId, 
      text: message.trim(),
      attachments: attachments.length > 0 ? attachments : undefined
    });
    setMessage('');
    setAttachments([]);
  };

  return (
    <div {...getRootProps()} className="h-full relative overflow-hidden">
      <input {...getInputProps()} />
      
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex flex-col h-full bg-sidebar-background"
      >
        <FileUploadDropOverlay isDragActive={isDragActive} compact />
        <div className="flex items-center gap-2 p-3 border-b border-sidebar-border/50 bg-sidebar-surface/30">
          <button onClick={onBack} className="p-1.5 hover:bg-sidebar-hover rounded-lg transition-colors">
            <ArrowLeft className="size-4" />
          </button>
          <Avatar className="size-8 rounded-xl border border-sidebar-border">
            <AvatarImage src={conversation?.avatar} />
            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                {conversation?.title[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold truncate leading-none mb-0.5">{conversation?.title}</h4>
            <PresenceStatus 
              className="text-[9px]" 
              online={conversation?.online} 
              typing={conversation?.typing} 
            />
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <SimpleBar className="h-full" scrollableNodeProps={{ ref: scrollRef }}>
            <div className="p-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-4"><Clock className="size-4 animate-spin text-muted-foreground" /></div>
              ) : (
                allMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    avatar={conversation?.avatar}
                  />
                ))
              )}

              {conversation?.typing && <TypingIndicator className="mb-2" />}
            </div>
          </SimpleBar>
        </div>

        <ChatComposer 
          compact
          value={message}
          onValueChange={setMessage}
          onSend={handleSend}
          attachments={attachments}
          onAddAttachment={(att) => setAttachments(prev => [...prev, att])}
          onRemoveAttachment={removeAttachment}
          isLoading={sendMutation.isPending}
        />
      </motion.div>
    </div>
  );
};
