import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFavoriteIntegrations } from '@/modules/management/integrations/application/hooks';
import { getIntegrationDetailPath } from '@/modules/management/integrations/ui/routes';
import { useLayout } from '../../app/useLayout';

const FavoriteApps: React.FC = () => {
  const { collapsed } = useLayout();
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();

  const { data: favorites = [] } = useFavoriteIntegrations();

  if (collapsed) return null;

  const items = favorites.slice(0, 6);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 text-xs font-medium text-gray-500 dark:text-gray-400">
        <span>{t('favoriteApps.title', 'Favorite Apps')}</span>
        <button className="inline-flex size-5 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-neutral-700">
          <Plus className="size-4" />
        </button>
      </div>
      <ul className="space-y-1">
        {items.length === 0 ? (
          <li className="px-2 py-1.5 text-xs text-muted-foreground">
            {t('favoriteApps.empty', { defaultValue: 'Pin apps to show them here.' })}
          </li>
        ) : (
          items.map((app) => {
            const initials = app.name
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]!.toUpperCase())
              .join('');

            const bg = app.status === 'connected'
              ? 'linear-gradient(135deg,#10B981,#34D399)'
              : app.status === 'error'
              ? 'linear-gradient(135deg,#EF4444,#F97316)'
              : 'linear-gradient(135deg,#64748B,#94A3B8)';

            return (
              <li
                key={app.id}
                className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                onClick={() => navigate(getIntegrationDetailPath(app.id))}
              >
                <span className="inline-flex size-6 items-center justify-center rounded-md" style={{ background: bg }}>
                  <span className="text-white text-xs font-semibold leading-none">{initials}</span>
                </span>
                <span className="text-sm truncate">{app.name}</span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default FavoriteApps;
