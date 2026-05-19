import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  FileText,
  Check,
  AlertTriangle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Download,
  CheckCircle2,
  X,
} from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/shadcn/components/ui/dialog';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';

import type { UserRole, ImportUserItem } from '../../domain/models';
import { ROLE_LABELS } from '../../domain/models';

interface ImportUsersWizardProps {
  open: boolean;
  onClose: () => void;
  onImport: (users: ImportUserItem[], sendInvites: boolean) => Promise<void>;
  isLoading: boolean;
}

interface ParsedUser {
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  valid: boolean;
  errors: string[];
}

type ColumnMapping = {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

const STEPS = ['Upload', 'Map Columns', 'Validate', 'Import'];

export function ImportUsersWizard({ open, onClose, onImport, isLoading }: ImportUsersWizardProps) {
  const { t } = useTranslation('users');

  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
  });
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([]);
  const [sendInvites, setSendInvites] = useState(true);
  const [success, setSuccess] = useState(false);

  const resetWizard = () => {
    setStep(0);
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setMapping({ email: '', firstName: '', lastName: '', role: '' });
    setParsedUsers([]);
    setSendInvites(true);
    setSuccess(false);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map((row) => row.split(',').map((cell) => cell.trim()));

      if (rows.length > 0) {
        setHeaders(rows[0]);
        setRawData(rows.slice(1).filter((row) => row.some((cell) => cell)));

        // Auto-detect mapping
        const lowerHeaders = rows[0].map((h) => h.toLowerCase());
        setMapping({
          email: rows[0][lowerHeaders.findIndex((h) => h.includes('email'))] || '',
          firstName: rows[0][lowerHeaders.findIndex((h) => h.includes('first') || h.includes('fname'))] || '',
          lastName: rows[0][lowerHeaders.findIndex((h) => h.includes('last') || h.includes('lname'))] || '',
          role: rows[0][lowerHeaders.findIndex((h) => h.includes('role'))] || '',
        });
      }
    };
    reader.readAsText(uploadedFile);
  }, []);

  const validateUsers = useCallback(() => {
    const emailIndex = headers.indexOf(mapping.email);
    const firstNameIndex = headers.indexOf(mapping.firstName);
    const lastNameIndex = headers.indexOf(mapping.lastName);
    const roleIndex = headers.indexOf(mapping.role);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRoles = Object.keys(ROLE_LABELS);

    const parsed: ParsedUser[] = rawData.map((row) => {
      const email = emailIndex >= 0 ? row[emailIndex] : '';
      const firstName = firstNameIndex >= 0 ? row[firstNameIndex] : '';
      const lastName = lastNameIndex >= 0 ? row[lastNameIndex] : '';
      const role = roleIndex >= 0 ? row[roleIndex]?.toLowerCase() : '';

      const errors: string[] = [];
      if (!email) errors.push(t('import.errors.emailRequired'));
      else if (!emailRegex.test(email)) errors.push(t('import.errors.invalidEmail'));
      if (role && !validRoles.includes(role)) errors.push(t('import.errors.invalidRole', { role }));

      return {
        email,
        firstName,
        lastName,
        role: validRoles.includes(role) ? role : undefined,
        valid: errors.length === 0,
        errors,
      };
    });

    setParsedUsers(parsed);
  }, [headers, mapping, rawData, t]);

  const handleNext = () => {
    if (step === 1) {
      validateUsers();
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleImport = async () => {
    const validUsers = parsedUsers.filter((u) => u.valid);
    await onImport(
      validUsers.map((u) => ({
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role as UserRole | undefined,
      })),
      sendInvites
    );
    setSuccess(true);
  };

  const downloadTemplate = () => {
    const template = 'email,firstName,lastName,role\njohn@example.com,John,Doe,member';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedUsers.filter((u) => u.valid).length;
  const invalidCount = parsedUsers.filter((u) => !u.valid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl" showCloseButton={!success}>
        {success ? (
          <div className="py-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-center">{t('import.success.title')}</DialogTitle>
              <DialogDescription className="text-center">
                {t('import.success.description', { count: validCount })}
                {sendInvites && `. ${t('import.success.invitesSent')}`}
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} className="mt-6">
              {t('common:done')}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('import.title')}</DialogTitle>
              <DialogDescription>{t('import.description')}</DialogDescription>
            </DialogHeader>

            {/* Progress Steps */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-lg">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium',
                      i < step
                        ? 'bg-success text-white'
                        : i === step
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'ml-2 text-sm hidden sm:inline',
                      i === step ? 'font-medium text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {t(`import.steps.${s.toLowerCase().replace(' ', '')}`)}
                  </span>
                  {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[280px]">
              {step === 0 && (
                <div className="space-y-4">
                  <div
                    className={cn(
                      'border-2 border-dashed rounded-lg p-8 text-center transition-colors relative',
                      file ? 'border-success bg-success/5' : 'border-border hover:border-primary/50'
                    )}
                  >
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="h-8 w-8 text-success" />
                        <div className="text-left">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('import.upload.rowsFound', { count: rawData.length })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFile(null);
                            setRawData([]);
                            setHeaders([]);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="font-medium">{t('import.upload.dropHere')}</p>
                        <p className="text-sm text-muted-foreground mb-4">{t('import.upload.orBrowse')}</p>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Button variant="outline" size="sm" onClick={downloadTemplate}>
                          <Download className="h-4 w-4 mr-2" />
                          {t('import.upload.downloadTemplate')}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{t('import.mapping.description')}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        {t('import.mapping.emailColumn')} <span className="text-destructive">*</span>
                      </Label>
                      <Select value={mapping.email} onValueChange={(v) => setMapping({ ...mapping, email: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('import.mapping.selectColumn')} />
                        </SelectTrigger>
                        <SelectContent>
                          {headers.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('import.mapping.firstNameColumn')}</Label>
                      <Select
                        value={mapping.firstName}
                        onValueChange={(v) => setMapping({ ...mapping, firstName: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('import.mapping.selectColumn')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">{t('import.mapping.none')}</SelectItem>
                          {headers.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('import.mapping.lastNameColumn')}</Label>
                      <Select
                        value={mapping.lastName}
                        onValueChange={(v) => setMapping({ ...mapping, lastName: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('import.mapping.selectColumn')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">{t('import.mapping.none')}</SelectItem>
                          {headers.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('import.mapping.roleColumn')}</Label>
                      <Select value={mapping.role} onValueChange={(v) => setMapping({ ...mapping, role: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('import.mapping.selectColumn')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">{t('import.mapping.none')}</SelectItem>
                          {headers.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10">
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">{t('import.validate.valid', { count: validCount })}</span>
                    </div>
                    {invalidCount > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium">
                          {t('import.validate.invalid', { count: invalidCount })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="max-h-[200px] overflow-y-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="p-2 text-left font-medium">{t('import.validate.status')}</th>
                          <th className="p-2 text-left font-medium">{t('import.validate.email')}</th>
                          <th className="p-2 text-left font-medium">{t('import.validate.name')}</th>
                          <th className="p-2 text-left font-medium">{t('import.validate.role')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedUsers.map((user, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="p-2">
                              {user.valid ? (
                                <Check className="h-4 w-4 text-success" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                            </td>
                            <td className="p-2">{user.email || <span className="text-muted-foreground">—</span>}</td>
                            <td className="p-2">
                              {user.firstName || user.lastName
                                ? `${user.firstName} ${user.lastName}`.trim()
                                : '—'}
                            </td>
                            <td className="p-2">
                              {user.role ? (
                                <Badge variant="secondary">{ROLE_LABELS[user.role as UserRole]}</Badge>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border bg-muted/30">
                    <p className="font-medium">{t('import.confirm.ready', { count: validCount })}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {invalidCount > 0 && t('import.confirm.skipped', { count: invalidCount })}
                      {t('import.confirm.review')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-sm">{t('import.confirm.sendInvites')}</p>
                      <p className="text-xs text-muted-foreground">{t('import.confirm.sendInvitesDescription')}</p>
                    </div>
                    <Switch checked={sendInvites} onCheckedChange={setSendInvites} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={step === 0 ? handleClose : handleBack}>
                {step === 0 ? (
                  t('common:cancel')
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 mr-1" /> {t('import.back')}
                  </>
                )}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={(step === 0 && !file) || (step === 1 && !mapping.email)}>
                  {t('import.next')} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleImport} disabled={validCount === 0 || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('import.importing')}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {t('import.importButton', { count: validCount })}
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
