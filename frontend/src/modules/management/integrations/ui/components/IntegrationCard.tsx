import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ExternalLink, AlertTriangle, CheckCircle2, PlugZap, Plug, Activity, AppWindow } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { cn } from '@/shadcn/lib/utils';
import type { IntegrationListItem } from '../../domain/models';

interface IntegrationCardProps {
  item: IntegrationListItem;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

function IntegrationIcon({ iconUrl, name, status }: { iconUrl?: string; name: string; status: string }) {
  const [imgError, setImgError] = useState(false);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

  const bgGradient = status === 'connected'
    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
    : status === 'error'
    ? 'bg-gradient-to-br from-red-500 to-orange-500'
    : 'bg-gradient-to-br from-slate-400 to-slate-500';

  if (iconUrl && !imgError) {
    return (
      <div className="relative flex-shrink-0">
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center bg-muted overflow-hidden')}>
          <img
            src={iconUrl}
            alt={name}
            className="h-6 w-6 object-contain"
            onError={() => setImgError(true)}
          />
        </div>
        <div className={cn(
          'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background',
          status === 'connected' ? 'bg-emerald-500' : status === 'error' ? 'bg-red-500' : 'bg-slate-400'
        )} />
      </div>
    );
  }

  return (
    <div className="relative flex-shrink-0">
      <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm', bgGradient)}>
        {initials || <AppWindow className="h-5 w-5" />}
      </div>
    </div>
  );
}

export function IntegrationCard({ item, onSelect, onToggleFavorite }: IntegrationCardProps) {
  const { t } = useTranslation('integrations');

  const statusMeta = useMemo(() => {
    if (item.status === 'connected') {
      return { icon: CheckCircle2, badgeClassName: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    }
    if (item.status === 'error') {
      return { icon: AlertTriangle, badgeClassName: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
    }
    return { icon: Plug, badgeClassName: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' };
  }, [item.status]);

  const StatusIcon = statusMeta.icon;

  return (
    <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer" onClick={() => onSelect(item.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <IntegrationIcon iconUrl={item.iconUrl} name={item.name} status={item.status} />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-semibold truncate">{item.name}</h3>
                {item.providerType === 'third_party' && (
                  <ExternalLink className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
                aria-label={t('actions.toggleFavorite', 'Toggle favorite')}
              >
                <Star
                  className={cn('h-4 w-4', item.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground hover:text-amber-500')}
                />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={statusMeta.badgeClassName}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {t(`status.${item.status}` as const)}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            {t(`categories.${item.category}` as const)}
          </Badge>
          {item.isFavorite && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              {t('actions.pinned')}
            </Badge>
          )}
        </div>

        {item.status === 'error' && item.errorMessage && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{item.errorMessage}</span>
          </div>
        )}

        <div className="flex items-center flex-wrap gap-2 justify-between pt-2 border-t">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {item.usageCount && item.usageCount > 0 ? (
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {t('usage.count', { count: item.usageCount, defaultValue: 'Used {{count}} times' })}
              </span>
            ) : item.lastSyncAt ? (
              <span>{t('detail.lastSync')}: {new Date(item.lastSyncAt).toLocaleDateString()}</span>
            ) : (
              <span className="text-muted-foreground/60">{t('status.notConnected', 'Not connected')}</span>
            )}
          </div>

          <Button
            variant={item.status === 'connected' ? 'secondary' : 'default'}
            size="sm"
            className="gap-1.5 h-8"
            onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
          >
            {item.status === 'connected' ? <PlugZap className="h-3.5 w-3.5" /> : <Plug className="h-3.5 w-3.5" />}
            {item.status === 'connected' ? t('actions.configure') : t('actions.connect')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function IntegrationCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 bg-muted animate-pulse rounded" />
            <div className="h-3 w-full bg-muted animate-pulse rounded" />
            <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 bg-muted animate-pulse rounded" />
          <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-9 w-full bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}
