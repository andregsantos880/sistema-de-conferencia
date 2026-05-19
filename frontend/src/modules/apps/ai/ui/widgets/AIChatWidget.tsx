import React, { useState } from 'react';
import { Sparkles, Send, Bot, User } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import { cn } from '@/shadcn/lib/utils';
import FieldText from '@/shared/ui/components/forms/composites/field/FieldText';
import ActionButton from '@/components/forms/buttons/ActionButton';


export const AIChatWidget: React.FC = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you manage your workspace today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    
    // Fake response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: "That's a great question! I'm scanning your current projects and I think we should focus on the task 'Database Migration' which is due in 2 days." }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SimpleBar className="flex-1 h-full">

        <div className="p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              "flex gap-3 max-w-[90%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}>
              <div className={cn(
                "size-8 rounded-xl flex items-center justify-center shrink-0 border",
                msg.role === 'assistant' ? "bg-primary/10 border-primary/20 text-primary" : "bg-sidebar-surface border-sidebar-border"
              )}>
                {msg.role === 'assistant' ? <Bot className="size-4" /> : <User className="size-4" />}
              </div>
              <div className={cn(
                "p-3 rounded-2xl text-xs leading-relaxed shadow-sm",
                msg.role === 'assistant' ? "bg-sidebar-surface border border-sidebar-border text-sidebar-foreground" : "bg-primary text-white"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </SimpleBar>
      
      <div className="p-4 border-t border-sidebar-border bg-sidebar-surface/10">
        <div className="flex gap-2">
          <FieldText 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything..."
            className="bg-sidebar-background"
          />
          <ActionButton 
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0 size-9 rounded-xl shadow-lg"
          >
            <Send className="size-4" />
          </ActionButton>

        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
          <Sparkles className="size-3 text-amber-500" />
          Powered by Katalyst AI
        </p>
      </div>
    </div>
  );
};
