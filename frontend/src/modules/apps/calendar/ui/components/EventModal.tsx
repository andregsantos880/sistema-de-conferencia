import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/shared/ui/shadcn/components/ui/drawer';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import InputFieldText from '@/components/forms/inputs/InputFieldText';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/components/ui/select';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { FieldDate, FieldDateTime } from '@/components/forms/composites/field';
import type { CalendarEvent, CalendarEventCategory } from '../../domain/models/CalendarEvent';
import { useMediaQuery } from '@/shared/hooks';

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  category: CalendarEventCategory;
  color: string;
}

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: EventFormData) => void;
  onDelete?: () => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
}

const CATEGORY_OPTIONS: Array<{ value: CalendarEventCategory; label: string; color: string }> = [
  { value: 'product-design', label: 'Product Design', color: '#10b981' },
  { value: 'software-engineering', label: 'Software Engineering', color: '#3b82f6' },
  { value: 'user-research', label: 'User Research', color: '#8b5cf6' },
  { value: 'marketing', label: 'Marketing', color: '#ef4444' },
  { value: 'meeting', label: 'Meeting', color: '#a855f7' },
  { value: 'personal', label: 'Personal', color: '#6366f1' },
];

export function EventModal({ open, onClose, onSave, onDelete, event, initialDate }: EventModalProps) {
  const { t } = useTranslation('calendar');
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
    category: 'meeting',
    color: '#a855f7',
  });

  // Populate form when event prop changes (edit mode) or initialDate is provided (create mode)
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: event.startDate,
        endDate: event.endDate,
        allDay: event.allDay,
        category: event.category,
        color: event.color,
      });
    } else if (initialDate) {
      // If it's midnight (clicked in month view), maybe set to a more reasonable default time like 9:00 AM
      let start = new Date(initialDate);
      if (start.getHours() === 0 && start.getMinutes() === 0 && start.getSeconds() === 0) {
         // It's a day selection from month view
         start.setHours(9, 0, 0, 0); 
      }
      
      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
       
      setFormData(prev => ({
        ...prev,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      }));
    }
  }, [event, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) {
      toast.error(t('form.error.titleRequired', 'Title is required'));
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error(t('form.error.invalidDates', 'Please enter valid start and end dates'));
      return;
    }

    if (end <= start) {
      toast.error(t('form.error.datesInvalid', 'End date must be after start date'));
      return;
    }

    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      allDay: false,
      category: 'meeting',
      color: '#a855f7',
    });
    onClose();
  };

  const handleCategoryChange = (category: CalendarEventCategory) => {
    const option = CATEGORY_OPTIONS.find(opt => opt.value === category);
    setFormData(prev => ({
      ...prev,
      category,
      color: option?.color || prev.color,
    }));
  };

  return (
    <Drawer open={open} onOpenChange={(isOpen: boolean) => !isOpen && handleClose()} direction={isMobile ? "bottom" : "right"}>
      <DrawerContent className="sm:max-w-[500px]">
        <DrawerHeader>
          <DrawerTitle>
            {event ? t('editEvent', 'Edit Event') : t('newEvent', 'New Event')}
          </DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-4 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="title">{t('form.title', 'Title')} *</Label>
            <InputFieldText
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('form.titlePlaceholder', 'Enter event title')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('form.description', 'Description')}</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('form.descriptionPlaceholder', 'Add description...')}
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t('form.startDate', 'Start Date')} *</Label>
              {formData.allDay ? (
                <FieldDate
                  id="startDate"
                  value={formData.startDate ? new Date(formData.startDate) : null}
                  onChange={(date) => setFormData(prev => ({ ...prev, startDate: date ? date.toISOString() : '' }))}
                  placeholder={t('form.selectStartDate', 'Select start date')}
                  required
                  className='!text-[11px] !px-2'

                />
              ) : (
                <FieldDateTime
                  id="startDate"
                  value={formData.startDate ? new Date(formData.startDate) : null}
                  onChange={(date) => setFormData(prev => ({ ...prev, startDate: date ? date.toISOString() : '' }))}
                  placeholder={t('form.selectStartDate', 'Select start date')}
                  required
                  className='!text-[11px] !px-2'

                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">{t('form.endDate', 'End Date')} *</Label>
              {formData.allDay ? (
                <FieldDate
                  id="endDate"
                  value={formData.endDate ? new Date(formData.endDate) : null}
                  onChange={(date) => setFormData(prev => ({ ...prev, endDate: date ? date.toISOString() : '' }))}
                  placeholder={t('form.selectEndDate', 'Select end date')}
                  required
                  className='!text-[11px] !px-2'

                />
              ) : (
                <FieldDateTime
                  id="endDate"
                  value={formData.endDate ? new Date(formData.endDate) : null}
                  onChange={(date) => setFormData(prev => ({ ...prev, endDate: date ? date.toISOString() : '' }))}
                  placeholder={t('form.selectEndDate', 'Select end date')}
                  required
                  className='!text-[11px] !px-2'

                />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allDay"
              checked={formData.allDay}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, allDay: checked === true }))
              }
            />
            <Label htmlFor="allDay" className="cursor-pointer">
              {t('form.allDay', 'All day event')}
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t('form.category', 'Category')} *</Label>
            <Select value={formData.category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DrawerFooter className="flex justify-between sm:justify-between">
            {event && onDelete && (
              <ActionButton
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete();
                  handleClose();
                }}
              >
                {t('deleteEvent', 'Delete')}
              </ActionButton>
            )}
            <div className="flex gap-2 ml-auto">
              <ActionButton type="button" variant="outline" onClick={handleClose}>
                {t('form.cancel', 'Cancel')}
              </ActionButton>
              <ActionButton type="submit">
                {event ? t('form.save', 'Save') : t('form.create', 'Create')}
              </ActionButton>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
