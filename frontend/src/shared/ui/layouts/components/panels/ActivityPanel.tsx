import React, { useMemo } from 'react';
import { X, Sparkles, Calendar, MessageCircle, Mail, Bell, Kanban, FileText, CheckSquare, StickyNote, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shadcn/lib/utils';
import { useLayout } from '../../app';
import { DailyPlanWidget } from '@/modules/apps/planner/ui/widgets/DailyPlanWidget';
import { AIChatWidget } from '@/modules/apps/ai/ui/widgets/AIChatWidget';
import { TaskPreviewWidget } from '@/modules/apps/todo/ui/widgets/TaskPreviewWidget';
import { NotesWidget } from '@/modules/apps/notes/ui/widgets/NotesWidget';
import { RecentFilesWidget } from '@/modules/apps/explorer/ui/widgets/RecentFilesWidget';
import { CalendarLightWidget } from '@/modules/apps/calendar/ui/widgets/CalendarLightWidget';
import { ChatLightWidget } from '@/modules/apps/chat/ui/widgets/ChatLightWidget';
import { EmailLightWidget } from '@/modules/apps/email/ui/widgets/EmailLightWidget';
import { InboxLightWidget } from '@/modules/apps/inbox/ui/widgets/InboxLightWidget';
import { KanbanLightWidget } from '@/modules/apps/kanban/ui/widgets/KanbanLightWidget';
import { InvoicesLightWidget } from '@/modules/apps/invoicing/ui/widgets/InvoicesLightWidget';

interface ActivityPanelProps {
  onClose?: () => void;
}

export const ActivityPanel: React.FC<ActivityPanelProps> = ({ onClose }) => {
  const { activeRightPanelTab, setActiveRightPanelTab } = useLayout();

  const activeWidget = useMemo(() => {
    switch (activeRightPanelTab) {
      case 'daily-plan':
        return { title: 'Daily Plan', icon: Calendar, component: <DailyPlanWidget /> };
      case 'ai-assistant':
        return { title: 'AI Assistant', icon: Sparkles, component: <AIChatWidget /> };
      case 'tasks':
        return { title: 'Tasks', icon: CheckSquare, component: <TaskPreviewWidget /> };
      case 'notes':
        return { title: 'Quick Notes', icon: StickyNote, component: <NotesWidget /> };
      case 'files':
        return { title: 'Explorer', icon: FolderOpen, component: <RecentFilesWidget /> };
      case 'calendar':
        return { title: 'Events', icon: Calendar, component: <CalendarLightWidget /> };
      case 'chat':
        return { title: 'Messenger', icon: MessageCircle, component: <ChatLightWidget /> };
      case 'email':
        return { title: 'Mailbox', icon: Mail, component: <EmailLightWidget /> };
      case 'inbox':
        return { title: 'Notifications', icon: Bell, component: <InboxLightWidget /> };
      case 'kanban':
        return { title: 'Board', icon: Kanban, component: <KanbanLightWidget /> };
      case 'invoices':
        return { title: 'Invoicing', icon: FileText, component: <InvoicesLightWidget /> };
      default:
        return { title: 'Activity', icon: Calendar, component: <DailyPlanWidget /> };
    }
  }, [activeRightPanelTab]);

  const handleClose = () => {
    if (onClose) onClose();
    setActiveRightPanelTab(null);
  };

  if (!activeRightPanelTab) return null;

  return (
    <motion.aside 
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={cn(
        "hidden xl:flex flex-col shrink-0 border-l border-sidebar-border bg-sidebar-background sticky top-0 h-dvh z-30",
        "w-[340px]"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border bg-sidebar-surface/50">
        <div className="flex items-center gap-2">
          <activeWidget.icon className="size-5 text-primary" />
          <h2 className="font-bold text-xs uppercase tracking-widest text-sidebar-muted">{activeWidget.title}</h2>
        </div>
        <button onClick={handleClose} className="p-1 hover:bg-sidebar-hover rounded-lg transition-colors">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRightPanelTab}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {activeWidget.component}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};
