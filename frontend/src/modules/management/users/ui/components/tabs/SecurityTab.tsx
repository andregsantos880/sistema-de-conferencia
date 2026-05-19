import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import {
  Mail,
  Key,
  CheckCircle2,
  XCircle,
  Smartphone,
  Monitor,
  LogOut,
} from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';

import type { User } from '../../../domain/models';

interface SecurityTabProps {
  user: User;
  onSendVerificationEmail: (userId: string) => void;
  onSendPasswordReset: (userId: string) => void;
  onTerminateSession: (userId: string, sessionId: string) => void;
}

export function SecurityTab({
  user,
  onSendVerificationEmail,
  onSendPasswordReset,
  onTerminateSession,
}: SecurityTabProps) {
  const { t } = useTranslation('users');

  return (
    <div className="space-y-6">
      {/* Security Status Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">{t('detail.security.status')}</h3>
        <div className="space-y-3">
          {/* Email Verification */}
          <div className="flex justify-between items-center py-3 px-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t('detail.security.emailVerified')}</p>
                <p className="text-sm text-muted-foreground">
                  {user.isEmailVerified
                    ? t('detail.security.emailVerifiedYes')
                    : t('detail.security.emailVerifiedNo')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user.isEmailVerified ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-warning" />
                  <Button size="sm" variant="outline" onClick={() => onSendVerificationEmail(user.id)}>
                    {t('detail.security.resend')}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* MFA Status */}
          <div className="flex justify-between items-center py-3 px-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t('detail.security.mfa')}</p>
                <p className="text-sm text-muted-foreground">
                  {user.isMfaEnabled ? t('detail.security.mfaEnabled') : t('detail.security.mfaDisabled')}
                </p>
              </div>
            </div>
            {user.isMfaEnabled ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Active Sessions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-foreground">{t('detail.security.activeSessions')}</h3>
          <span className="text-sm text-muted-foreground">
            {user.sessions.length} {t('detail.security.active')}
          </span>
        </div>
        {user.sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t('detail.security.noSessions')}
          </p>
        ) : (
          <div className="space-y-3">
            {user.sessions.map((session) => (
              <div
                key={session.id}
                className="flex justify-between items-center py-3 px-4 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device}</p>
                      {session.current && (
                        <Badge variant="secondary" className="text-xs">
                          {t('detail.security.current')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.browser} • {session.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('detail.security.lastUsed')}{' '}
                      {formatDistanceToNow(new Date(session.lastUsed), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onTerminateSession(user.id, session.id)}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    {t('detail.security.signOut')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Reset Action */}
      <div className="pt-4">
        <Button variant="outline" onClick={() => onSendPasswordReset(user.id)}>
          <Key className="h-4 w-4 mr-2" />
          {t('actions.sendPasswordReset')}
        </Button>
      </div>
    </div>
  );
}
