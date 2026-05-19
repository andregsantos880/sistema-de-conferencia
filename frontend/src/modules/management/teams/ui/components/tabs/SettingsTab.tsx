import { useTranslation } from 'react-i18next';
import { Archive, ArchiveRestore, Trash2, UserCog } from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Card } from '@/shared/ui/shadcn/components/ui/card';

import type { TeamDetail } from '../../../domain/models';

interface SettingsTabProps {
  team: TeamDetail;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
  onTransferOwnership: () => void;
}

export function SettingsTab({
  team,
  onArchive,
  onUnarchive,
  onDelete,
  onTransferOwnership,
}: SettingsTabProps) {
  const { t } = useTranslation('teams');

  return (
    <div className="space-y-6">
      {/* Transfer Ownership */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-start justify-between">
          <div className="space-y-1">
            <h4 className="font-medium flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              {t('detail.settings.transferOwnership')}
            </h4>
            <p className="text-sm text-muted-foreground max-w-md">
              {t('detail.settings.transferDescription')}
            </p>
          </div>
          <Button variant="outline" onClick={onTransferOwnership}>
            {t('actions.transferOwnership')}
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <div className="space-y-4">
        <h3 className="font-semibold text-destructive">{t('detail.settings.dangerZone')}</h3>

        {/* Archive/Unarchive */}
        <Card className="p-6 border-warning/50">
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-medium flex items-center gap-2">
                {team.status === 'active' ? (
                  <>
                    <Archive className="h-4 w-4" />
                    {t('detail.settings.archiveTeam')}
                  </>
                ) : (
                  <>
                    <ArchiveRestore className="h-4 w-4" />
                    {t('detail.settings.unarchiveTeam')}
                  </>
                )}
              </h4>
              <p className="text-sm text-muted-foreground max-w-md">
                {team.status === 'active'
                  ? t('detail.settings.archiveDescription')
                  : t('detail.settings.unarchiveDescription')}
              </p>
            </div>

            {team.status === 'active' ? (
              <Button variant="outline" onClick={onArchive}>
                <Archive className="h-4 w-4 mr-2" />
                {t('actions.archive')}
              </Button>
            ) : (
              <Button variant="outline" onClick={onUnarchive}>
                <ArchiveRestore className="h-4 w-4 mr-2" />
                {t('actions.unarchive')}
              </Button>
            )}
          </div>
        </Card>

        {/* Delete */}
        <Card className="p-6 border-destructive/50">
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-medium flex items-center gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                {t('detail.settings.deleteTeam')}
              </h4>
              <p className="text-sm text-muted-foreground max-w-md">
                {t('detail.settings.deleteDescription')}
              </p>
            </div>
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t('actions.delete')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
