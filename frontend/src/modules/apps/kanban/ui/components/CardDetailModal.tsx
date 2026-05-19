/**
 * CardDetailModal Component
 * 
 * Modal/Dialog for viewing and editing card details.
 * Displays title, description, labels, assignees, priority, due date, and activity.
 * 
 * Uses optimistic updates for immediate UI feedback while persisting changes.
 */
import { useState, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import {
  Edit2,
  Check,
  X,
  MessageSquare,
  Clock,
  Plus,
  UserPlus,
  Paperclip,
  Image as ImageIcon,
  Trash2,
  CheckSquare,
  GripVertical,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/ui/shadcn/components/ui/dialog';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import { Progress } from '@/shared/ui/shadcn/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import { FieldDate } from '@/components/forms/composites/field';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/shadcn/components/ui/popover';
import { cn } from '@/shadcn/lib/utils';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { Textarea } from '@/shared/ui/shadcn/components/ui/textarea';
import { InlineEditable } from '@/shared/ui/components/editable/InlineEditable';
import { RepeatableSortable, SortableHandle } from '@/shared/ui/components/repeatable/plugins/RepeatableSortable';
import { AttachmentPreview } from '@/shared/ui/components/files/AttachmentPreview';
import { Timeline, type TimelineItemData } from '@/shared/ui/components/Timeline';
import type {
  KanbanCard,
  KanbanLabel,
  KanbanUser,
  CardPriority,
  UpdateCardDto,
  KanbanSubtask,
  KanbanAttachment,
} from '../../domain/models/Kanban';

interface CardDetailModalProps {
  card: KanbanCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (cardId: string, updates: UpdateCardDto) => void;
  users: KanbanUser[];
  availableLabels: KanbanLabel[];
}

const priorityOptions: { value: CardPriority; labelKey: string; color: string }[] = [
  { value: 'low', labelKey: 'priority.low', color: 'bg-slate-500' },
  { value: 'medium', labelKey: 'priority.medium', color: 'bg-blue-500' },
  { value: 'high', labelKey: 'priority.high', color: 'bg-amber-500' },
  { value: 'critical', labelKey: 'priority.critical', color: 'bg-red-500' },
];

export function CardDetailModal({
  card,
  open,
  onOpenChange,
  onSave,
  users,
  availableLabels,
}: CardDetailModalProps) {
  const { t } = useTranslation('kanban');
  
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Optimistic overrides
  const [optimisticOverrides, setOptimisticOverrides] = useState<{
    cardId: string | null;
    labels?: KanbanLabel[];
    priority?: CardPriority;
    dueDate?: string | null;
    assigneeIds?: string[];
  }>({ cardId: null });

  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);

  const getUser = useCallback((userId: string) => users.find(u => u.id === userId), [users]);

  const formatActivityTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('time.justNow');
    if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
    return format(date, 'MMM d, yyyy');
  }, [t]);

  // Derive display values
  const displayLabels = useMemo(() => {
    if (card && optimisticOverrides.cardId === card.id && optimisticOverrides.labels !== undefined) {
      return optimisticOverrides.labels;
    }
    return card?.labels ?? [];
  }, [card, optimisticOverrides]);

  const displayPriority = useMemo(() => {
    if (card && optimisticOverrides.cardId === card.id && optimisticOverrides.priority !== undefined) {
      return optimisticOverrides.priority;
    }
    return card?.priority ?? 'medium';
  }, [card, optimisticOverrides]);

  const displayDueDate = useMemo(() => {
    if (card && optimisticOverrides.cardId === card.id && optimisticOverrides.dueDate !== undefined) {
      return optimisticOverrides.dueDate;
    }
    return card?.dueDate ?? null;
  }, [card, optimisticOverrides]);

  const displayAssigneeIds = useMemo(() => {
    if (card && optimisticOverrides.cardId === card.id && optimisticOverrides.assigneeIds !== undefined) {
      return optimisticOverrides.assigneeIds;
    }
    return card?.assigneeIds ?? [];
  }, [card, optimisticOverrides]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setIsAddingSubtask(false);
      setOptimisticOverrides({ cardId: null });
    }
    onOpenChange(newOpen);
  }, [onOpenChange]);

  const timelineItems: TimelineItemData[] = useMemo(() => {
    return (card?.activities || []).map(activity => {
      const user = getUser(activity.userId);
      return {
        id: activity.id,
        icon: (
          <Avatar className="h-full w-full">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
        ),
        iconContainerClassName: 'bg-transparent shadow-sm',
        title: (
          <p className="text-sm">
            <span className="font-bold">{user?.name}</span>{' '}
            <span className="text-muted-foreground">{activity.action}</span>
          </p>
        ),
        subtitle: formatActivityTime(activity.timestamp),
      };
    });
  }, [card?.activities, getUser, formatActivityTime]);

  // Early return after ALL hooks
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  if (!card) return null;

  // Handlers
  const handlePriorityChange = (priority: CardPriority) => {
    setOptimisticOverrides(prev => ({ ...prev, cardId: card.id, priority }));
    onSave(card.id, { priority });
  };

  const handleDateChange = (value: string) => {
    const isoDate = value ? new Date(value).toISOString() : null;
    setOptimisticOverrides(prev => ({ ...prev, cardId: card.id, dueDate: isoDate }));
    onSave(card.id, { dueDate: isoDate });
  };

  const toggleLabel = (label: KanbanLabel) => {
    const hasLabel = displayLabels.some(l => l.id === label.id);
    const newLabels = hasLabel
      ? displayLabels.filter(l => l.id !== label.id)
      : [...displayLabels, label];
    setOptimisticOverrides(prev => ({ ...prev, cardId: card.id, labels: newLabels }));
    onSave(card.id, { labels: newLabels });
  };

  const toggleAssignee = (userId: string) => {
    const hasAssignee = displayAssigneeIds.includes(userId);
    const newAssigneeIds = hasAssignee
      ? displayAssigneeIds.filter(id => id !== userId)
      : [...displayAssigneeIds, userId];
    setOptimisticOverrides(prev => ({ ...prev, cardId: card.id, assigneeIds: newAssigneeIds }));
    onSave(card.id, { assigneeIds: newAssigneeIds });
  };

  const handleToggleSubtask = (subtaskId: string) => {
      const newSubtasks = card.subtasks.map(s => 
        s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
      );
      onSave(card.id, { subtasks: newSubtasks });
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: KanbanSubtask = {
        id: `st-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        isCompleted: false,
        order: card.subtasks.length,
      };
      onSave(card.id, { subtasks: [...card.subtasks, newSubtask] });
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
    }
  };

  const handleRemoveSubtask = (id: string) => {
    onSave(card.id, { subtasks: card.subtasks.filter(s => s.id !== id) });
  };

  const handleMoveSubtask = (fromIndex: number, toIndex: number) => {
    const newItems = [...card.subtasks].sort((a, b) => a.order - b.order);
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);
    
    // Update orders
    const updated = newItems.map((item, idx) => ({ ...item, order: idx }));
    onSave(card.id, { subtasks: updated });
  };

  const handleAttachmentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const mockAtt: KanbanAttachment = {
          id: `att-${Date.now()}`,
          name: file.name,
          url: reader.result as string,
          type: file.type,
          size: file.size,
          createdAt: new Date().toISOString()
        };
        onSave(card.id, { attachments: [...(card.attachments || []), mockAtt] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAttachment = () => {
    attachmentInputRef.current?.click();
  };

  const handleRemoveAttachment = (id: string) => {
    onSave(card.id, { attachments: card.attachments.filter(a => a.id !== id) });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSave(card.id, { coverImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangeCover = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveCover = () => {
    onSave(card.id, { coverImage: null });
  };

  const subtasksCount = card.subtasks?.length || 0;
  const completedSubtasksCount = card.subtasks?.filter(s => s.isCompleted).length || 0;
  const progressValue = subtasksCount > 0 ? (completedSubtasksCount / subtasksCount) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTitle className="sr-only">{t('card.cardDetails')}</DialogTitle>
      <DialogContent showCloseButton={false} className="lg:max-w-4xl max-h-[85vh] overflow-hidden p-0 rounded-2xl border-none shadow-2xl">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        <input
          type="file"
          ref={attachmentInputRef}
          className="hidden"
          onChange={handleAttachmentFileChange}
        />
        {/* Cover Image Manager */}
        <div className="cover-image relative group/cover h-48 w-full bg-muted overflow-hidden">
          {card.coverImage ? (
            <>
              <img src={card.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-105" alt="Cover" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="secondary" size="sm" onClick={handleChangeCover}>
                   <ImageIcon className="h-4 w-4 mr-2" />
                   {t('card.changeCover')}
                </Button>
                <Button variant="destructive" size="sm" onClick={handleRemoveCover}>
                   <Trash2 className="h-4 w-4 mr-2" />
                   {t('card.removeCover')}
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-3 border-2 border-dashed">
              <ImageIcon className="h-10 w-10 opacity-20" />
              <Button variant="outline" size="sm" onClick={handleChangeCover}>
                {t('card.setCover')}
              </Button>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full bg-black/20 hover:bg-black/40 text-white border-none"
            onClick={() => handleOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <SimpleBar style={{ maxHeight: 'calc(85vh - 200px)' }} className="px-8 py-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Primary content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title Section */}
              <div className="space-y-4">
                <InlineEditable
                  value={card.title}
                  onSave={(title) => onSave(card.id, { title })}
                  renderDisplay={({ value, onStartEdit }) => (
                    <h2 
                      className="text-3xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors flex items-start gap-3 group"
                      onClick={onStartEdit}
                    >
                      {value}
                      <Edit2 className="h-5 w-5 mt-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                  )}
                  renderEditor={({ value, onChange, onSave, onCancel, isSaving, inputProps }) => (
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="text-2xl font-bold h-12 rounded-xl border-2 focus:border-primary transition-all"
                        autoFocus
                        {...inputProps}
                      />
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" onClick={onSave} disabled={isSaving} className="h-12 w-12 rounded-xl">
                          <Check className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onCancel} disabled={isSaving} className="h-12 w-12 rounded-xl">
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  )}
                />

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                   <div className="flex items-center gap-2">
                      <div className={cn("h-3 w-3 rounded-full", priorityOptions.find(p => p.value === displayPriority)?.color)} />
                      <span className="font-medium">{t(priorityOptions.find(p => p.value === displayPriority)?.labelKey || '')}</span>
                   </div>
                   {displayDueDate && (
                      <div className="flex items-center gap-2">
                         <Clock className="h-4 w-4" />
                         <span>{t('card.due')} {format(new Date(displayDueDate), 'PPP')}</span>
                      </div>
                   )}
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="font-bold text-lg flex items-center gap-2">
                      <Edit2 className="h-4 w-4 text-primary" />
                      {t('card.description')}
                   </h3>
                </div>
                <InlineEditable
                  value={card.description}
                  onSave={(description) => onSave(card.id, { description })}
                  renderDisplay={({ value, onStartEdit }) => (
                    <div
                      className="p-5 bg-muted/30 rounded-2xl cursor-pointer hover:bg-muted/50 transition-all border-2 border-transparent hover:border-primary/20"
                      onClick={onStartEdit}
                    >
                      {value ? (
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{value}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          {t('card.clickToAddDescription')}
                        </p>
                      )}
                    </div>
                  )}
                  renderEditor={({ value, onChange, onSave, onCancel, isSaving, inputProps }) => (
                    <div className="space-y-3">
                      <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={t('card.descriptionPlaceholder')}
                        rows={6}
                        className="w-full rounded-xl border-2 border-input bg-background/50 p-4 text-sm focus:border-primary transition-colors outline-none"
                        autoFocus
                        {...inputProps}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
                          {t('actions.cancel')}
                        </Button>
                        <Button size="sm" onClick={onSave} disabled={isSaving}>
                          {isSaving ? t('loading') : t('actions.save')}
                        </Button>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Subtasks Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    {t('card.subtasks')}
                    <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-muted rounded-full tabular-nums">
                      {completedSubtasksCount}/{subtasksCount}
                    </span>
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingSubtask(true)} className="h-8">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('card.addSubtask')}
                  </Button>
                </div>

                {subtasksCount > 0 && (
                  <div className="space-y-4">
                    <Progress value={progressValue} className="h-2 bg-muted overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progressValue}%` }} />
                    </Progress>

                    <RepeatableSortable
                      items={[...card.subtasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))}
                      onMove={handleMoveSubtask}
                      getItemId={(item) => item.id}
                      strategy="vertical"
                      className="space-y-1"
                    >
                      {(subtask) => (
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 group/st">
                          <SortableHandle className="hover:bg-transparent -ml-1 h-8 w-6 flex items-center justify-center">
                            <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover/st:text-muted-foreground transition-colors" />
                          </SortableHandle>
                          <Checkbox 
                            checked={subtask.isCompleted} 
                            onCheckedChange={() => handleToggleSubtask(subtask.id)}
                            className="rounded-md h-5 w-5 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                          <span className={cn("text-sm flex-1", subtask.isCompleted && "text-muted-foreground line-through decoration-muted-foreground/50")}>
                              {subtask.title}
                          </span>
                          <Button 
                            variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover/st:opacity-100"
                            onClick={() => handleRemoveSubtask(subtask.id)}
                          >
                              <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </RepeatableSortable>
                  </div>
                )}

                {isAddingSubtask && (
                  <div className="flex items-center gap-2 mt-2">
                    <Input 
                      value={newSubtaskTitle}
                      onChange={e => setNewSubtaskTitle(e.target.value)}
                      placeholder="Enter subtask..."
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                    />
                    <Button size="sm" onClick={handleAddSubtask}>Add</Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsAddingSubtask(false)}>Cancel</Button>
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-primary" />
                      {t('card.attachments')}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleUploadAttachment} className="h-8">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('card.upload')}
                  </Button>
                </div>
                <AttachmentPreview
                  attachments={card.attachments || []}
                  variant="list"
                  onRemove={handleRemoveAttachment}
                />
              </div>

              {/* Activity Section */}
              <div className="space-y-4">
                 <h3 className="font-bold text-lg flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    {t('card.activity')}
                 </h3>
                 <Timeline 
                   items={timelineItems} 
                   className="pl-2" 
                   interactive 
                   gap="lg"
                 />
              </div>
            </div>

            {/* Sidebar properties */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{t('card.labels')}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {availableLabels.map(label => {
                    const isSelected = displayLabels.some(l => l.id === label.id);
                    return (
                      <Badge
                        key={label.id}
                        variant="secondary"
                        className={cn(
                          'cursor-pointer h-7 text-[11px] font-bold transition-all px-3 rounded-md border-transparent hover:border-black/10',
                          isSelected ? cn(label.color, 'text-white border-white/20') : 'bg-muted/50 hover:bg-muted opacity-60'
                        )}
                        onClick={() => toggleLabel(label)}
                      >
                        {label.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{t('card.assignees')}</h4>
                <div className="space-y-2">
                  {displayAssigneeIds.map((userId: string) => {
                    const user = getUser(userId);
                    if (!user) return null;
                    return (
                      <div key={userId} className="flex items-center gap-3 p-1.5 pr-2 rounded-xl bg-muted/30 group">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold flex-1">{user.name}</span>
                        <Button 
                          variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100"
                          onClick={() => toggleAssignee(userId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  <Popover open={isAssigneeDropdownOpen} onOpenChange={setIsAssigneeDropdownOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start border-dashed h-10 border-2 rounded-xl text-muted-foreground hover:text-primary transition-all">
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t('card.addAssignee')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 rounded-xl shadow-2xl border-none">
                      <div className="space-y-1">
                        {users.map(u => (
                          <button
                            key={u.id}
                            className={cn(
                              "flex items-center gap-3 w-full p-2 rounded-lg text-sm transition-colors",
                              displayAssigneeIds.includes(u.id) ? "bg-primary/10 text-primary" : "hover:bg-muted"
                            )}
                            onClick={() => toggleAssignee(u.id)}
                          >
                            <Avatar className="h-7 w-7"><AvatarImage src={u.avatar} /></Avatar>
                            <span className="flex-1 text-left font-medium">{u.name}</span>
                            {displayAssigneeIds.includes(u.id) && <Check className="h-4 w-4" />}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{t('card.priority')}</label>
                    <Select value={displayPriority} onValueChange={handlePriorityChange}>
                      <SelectTrigger className="rounded-xl border-2 h-11 bg-muted/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-2xl">
                        {priorityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span className={cn('h-2.5 w-2.5 rounded-full', option.color)} />
                              <span className="font-semibold">{t(option.labelKey)}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{t('card.dueDate')}</label>
                    <FieldDate
                      value={displayDueDate ? new Date(displayDueDate) : null}
                      onChange={(date) => handleDateChange(date ? date.toISOString() : '')}
                      placeholder={t('card.selectDate')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
}
