import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Bell } from 'lucide-react';
import type { QuietHours as QuietHoursType } from '../../domain/models/Settings';

interface QuietHoursProps {
  quietHours?: QuietHoursType;
  onUpdate?: (quietHours: QuietHoursType) => void;
}

const QuietHours: React.FC<QuietHoursProps> = ({ quietHours, onUpdate }) => {
  const { t } = useTranslation('settings');

  // Use props directly - controlled component
  const start = quietHours?.start ?? '22:00';
  const end = quietHours?.end ?? '08:00';

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    onUpdate?.({ start: newStart, end });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    onUpdate?.({ start, end: newEnd });
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-blue-900 dark:text-blue-100">{t('notifications.quiet_hours.title')}</p>
          <p className="text-sm text-blue-700 dark:text-blue-100 whitespace-normal text-wrap">{t('notifications.quiet_hours.description')}</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-3 max-w-fit">
            <Input type="time" className="w-32" value={start} onChange={handleStartChange} />
            <span className="flex items-center">{t('notifications.quiet_hours.to')}</span>
            <Input type="time" className="w-32" value={end} onChange={handleEndChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuietHours;
