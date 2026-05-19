import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/components/ui/select';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import type { Language } from '../../domain/models/Settings';

interface LanguageSelectorProps {
  language?: Language;
  onLanguageChange?: (language: Language) => void;
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt-BR', label: 'Português (BR)' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language = 'en-US', onLanguageChange }) => {
  const { t } = useTranslation('settings');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="language">{t('preferences.language_selector.language_label')}</Label>
        <Select value={language} onValueChange={(val) => onLanguageChange?.(val as Language)}>
          <SelectTrigger id="language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">{t('preferences.language_selector.timezone_label')}</Label>
        <Select defaultValue="America/Los_Angeles">
          <SelectTrigger id="timezone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
            <SelectItem value="Europe/London">London (GMT)</SelectItem>
            <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LanguageSelector;
  