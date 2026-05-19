import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/components/ui/dialog';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';

import type { CreateTeamPayload, UpdateTeamPayload, TeamListItem, TeamType } from '../../domain/models';
import { DEPARTMENTS } from '../../domain/models';

interface CreateTeamDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateTeamPayload) => Promise<void>;
  onUpdate?: (id: string, data: UpdateTeamPayload) => Promise<void>;
  editTeam?: TeamListItem | null;
  isLoading: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Separate form component that receives initial values as props
// This ensures form state resets when editTeam changes via the key prop
interface TeamFormProps {
  editTeam: TeamListItem | null;
  onCreate: (data: CreateTeamPayload) => Promise<void>;
  onUpdate?: (id: string, data: UpdateTeamPayload) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

function TeamForm({ editTeam, onCreate, onUpdate, onClose, isLoading }: TeamFormProps) {
  const { t } = useTranslation('teams');
  const isEditing = !!editTeam;

  // Initialize form state from editTeam (runs once per mount due to key)
  const [name, setName] = useState(editTeam?.name || '');
  const [slug, setSlug] = useState(editTeam?.slug || '');
  const [description, setDescription] = useState(editTeam?.description || '');
  const [department, setDepartment] = useState(editTeam?.department || '');
  const [type, setType] = useState<TeamType>(editTeam?.type || 'functional');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!editTeam);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(generateSlug(value));
    setSlugManuallyEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isEditing && editTeam && onUpdate) {
      await onUpdate(editTeam.id, {
        name,
        slug,
        description: description || undefined,
        department: department || undefined,
        type,
      });
    } else {
      await onCreate({
        name,
        slug,
        description: description || undefined,
        department: department || undefined,
        type,
      });
    }

    onClose();
  };

  const isValid = name.trim().length > 0 && slug.trim().length > 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? t('dialogs.editTeam.title') : t('dialogs.createTeam.title')}
        </DialogTitle>
        <DialogDescription>
          {isEditing ? t('dialogs.editTeam.description') : t('dialogs.createTeam.description')}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('form.name')}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={t('form.namePlaceholder')}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">{t('form.slug')}</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder={t('form.slugPlaceholder')}
            required
          />
          <p className="text-xs text-muted-foreground">{t('form.slugHelp')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('form.description')}</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('form.descriptionPlaceholder')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('form.department')}</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder={t('form.departmentPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('form.type')}</Label>
            <Select value={type} onValueChange={(v) => setType(v as TeamType)}>
              <SelectTrigger>
                <SelectValue placeholder={t('form.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="functional">{t('type.functional')}</SelectItem>
                <SelectItem value="project">{t('type.project')}</SelectItem>
                <SelectItem value="cross-functional">{t('type.cross-functional')}</SelectItem>
                <SelectItem value="other">{t('type.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('form.cancel')}
          </Button>
          <Button type="submit" disabled={!isValid || isLoading}>
            {isLoading
              ? t('common:loading')
              : isEditing
                ? t('form.update')
                : t('form.create')}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function CreateTeamDialog({
  open,
  onClose,
  onCreate,
  onUpdate,
  editTeam,
  isLoading,
}: CreateTeamDialogProps) {
  // Use key to force remount TeamForm when editTeam changes
  // This ensures form state is properly reset without useEffect
  const formKey = editTeam?.id || 'new';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <TeamForm
          key={formKey}
          editTeam={editTeam || null}
          onCreate={onCreate}
          onUpdate={onUpdate}
          onClose={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
