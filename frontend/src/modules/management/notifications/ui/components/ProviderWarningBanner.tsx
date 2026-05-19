import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ProviderWarningBannerProps {
  onConfigure: () => void;
}

export function ProviderWarningBanner({ onConfigure }: ProviderWarningBannerProps) {
  const { t } = useTranslation('notifications');

  return (
    <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
      <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-warning">
          {t('warnings.providerNotConfigured')}
        </p>
        <p className="text-sm text-warning/80">
          {t('warnings.providerNotConfiguredDesc')}
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={onConfigure}>
        {t('actions.configure')}
      </Button>
    </div>
  );
}

export default ProviderWarningBanner;
