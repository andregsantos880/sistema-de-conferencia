import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppWindow, Star, RefreshCcw } from 'lucide-react';
import PageLayout from '@/shared/ui/components/PageLayout';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/components/ui/select';
import { Toggle } from '@/shared/ui/shadcn/components/ui/toggle';
import { IntegrationCard, IntegrationCardSkeleton } from '../components';
import { useIntegrations, useToggleIntegrationFavorite } from '../../application/hooks';
import { getIntegrationDetailPath } from '../routes';
import type { IntegrationCategory, IntegrationStatus } from '../../domain/models';

function IntegrationsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <IntegrationCardSkeleton />
      <IntegrationCardSkeleton />
      <IntegrationCardSkeleton />
      <IntegrationCardSkeleton />
      <IntegrationCardSkeleton />
      <IntegrationCardSkeleton />
    </div>
  );
}

export default function IntegrationsPage() {
  const { t } = useTranslation('integrations');
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<IntegrationCategory | 'all'>('all');
  const [status, setStatus] = useState<IntegrationStatus | 'all'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const params = useMemo(() => ({ search, category, status, favoritesOnly }), [search, category, status, favoritesOnly]);

  const { data: items = [], isLoading, error, refetch } = useIntegrations(params);
  const toggleFavorite = useToggleIntegrationFavorite();

  const handleSelect = (id: string) => {
    navigate(getIntegrationDetailPath(id));
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite.mutate(id);
  };

  const allCategories: Array<{ value: IntegrationCategory | 'all'; label: string }> = [
    { value: 'all', label: t('filters.all', 'All') },
    { value: 'communication', label: t('categories.communication') },
    { value: 'productivity', label: t('categories.productivity') },
    { value: 'payments', label: t('categories.payments') },
    { value: 'analytics', label: t('categories.analytics') },
    { value: 'developer_tools', label: t('categories.developer_tools') },
    { value: 'storage', label: t('categories.storage') },
    { value: 'security', label: t('categories.security') },
    { value: 'other', label: t('categories.other') },
  ];

  const allStatuses: Array<{ value: IntegrationStatus | 'all'; label: string }> = [
    { value: 'all', label: t('filters.all', 'All') },
    { value: 'connected', label: t('status.connected') },
    { value: 'disconnected', label: t('status.disconnected') },
    { value: 'error', label: t('status.error') },
  ];

  return (
    <PageLayout
      title={t('title')}
      subtitle={t('description')}
      isLoading={isLoading}
      error={error}
      data={items}
      loadingFallback={<IntegrationsSkeleton />}
      errorConfig={{
        title: t('errors.loadFailed'),
        description: t('errors.loadFailedDescription'),
        icon: AppWindow,
        onRetry: () => refetch(),
      }}
      emptyConfig={{
        title: favoritesOnly ? t('empty.noFavoritesTitle') : t('empty.title'),
        description: favoritesOnly ? t('empty.noFavoritesDescription') : t('empty.description'),
        icon: favoritesOnly ? Star : AppWindow,
      }}
      actions={
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
          <RefreshCcw className="h-4 w-4" />
          {t('actions.retry', 'Retry')}
        </Button>
      }
    >
      {(items) => (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('filters.searchPlaceholder')}
                aria-label={t('filters.searchPlaceholder')}
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Select value={category} onValueChange={(v) => setCategory(v as IntegrationCategory | 'all')}>
                <SelectTrigger className="w-46" aria-label={t('filters.category')}> 
                  <SelectValue placeholder={t('filters.category')} />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={(v) => setStatus(v as IntegrationStatus | 'all')}>
                <SelectTrigger className='w-46' aria-label={t('filters.status')}>
                  <SelectValue placeholder={t('filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  {allStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Toggle
                pressed={favoritesOnly}
                onPressedChange={setFavoritesOnly}
                aria-label={t('filters.favoritesOnly')}
                className="justify-start gap-2"
              >
                <Star className={favoritesOnly ? 'h-4 w-4 fill-amber-500 text-amber-500' : 'h-4 w-4'} />
                {t('filters.favoritesOnly')}
              </Toggle>
            </div>
          </div>

          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <IntegrationCard
                key={item.id}
                item={item}
                onSelect={handleSelect}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
