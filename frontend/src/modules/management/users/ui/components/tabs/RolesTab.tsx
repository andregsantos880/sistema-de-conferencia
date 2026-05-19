import { useTranslation } from 'react-i18next';
import { Shield, AlertCircle } from 'lucide-react';

import type { UserRole } from '../../../domain/models';
import { ROLE_LABELS } from '../../../domain/models';

interface RolesTabProps {
  role: UserRole;
}

export function RolesTab({ role }: RolesTabProps) {
  const { t } = useTranslation('users');

  return (
    <div className="space-y-6">
      {/* Current Role Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">{t('detail.roles.currentRole')}</h3>
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold text-lg">{ROLE_LABELS[role]}</p>
              <p className="text-sm text-muted-foreground">
                {t(`detail.roles.descriptions.${role}`)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Coming Soon Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">{t('detail.roles.rbac')}</h3>
        <div className="p-4 rounded-lg border border-dashed border-border bg-muted/20">
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">{t('detail.roles.comingSoon')}</p>
              <p className="text-sm">{t('detail.roles.comingSoonDescription')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
