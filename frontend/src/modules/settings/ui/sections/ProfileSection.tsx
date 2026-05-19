import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import ActionButton from '@/components/forms/buttons/ActionButton';
import AvatarUploader from '../components/AvatarUploader';
import FieldText from '@/components/forms/composites/field/FieldText';
import { UserIcon, Loader2 } from 'lucide-react';
import { useProfile, useUpdateProfile } from '../../application/hooks/useSettings';
import type { UpdateProfileDto } from '../../domain/models/Settings';
import { SkeletonProfileSection } from '@/shared/ui/components/Skeleton';
import { SectionHeader } from '@/shared/ui/components/SectionHeader';

const ProfileSection: React.FC = () => {
  const { t } = useTranslation('settings');
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();

  // Track local edits - only store fields that have been modified
  const [localEdits, setLocalEdits] = useState<Partial<UpdateProfileDto>>({});

  // Merge profile data with local edits
  const formData = useMemo(() => ({
    firstName: localEdits.firstName ?? profile?.firstName ?? '',
    lastName: localEdits.lastName ?? profile?.lastName ?? '',
    bio: localEdits.bio ?? profile?.bio ?? '',
    location: localEdits.location ?? profile?.location ?? '',
    website: localEdits.website ?? profile?.website ?? '',
  }), [profile, localEdits]);

  const handleChange = (field: keyof UpdateProfileDto) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLocalEdits((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    updateProfile.mutate(formData, {
      onSuccess: () => {
        // Clear local edits after successful save
        setLocalEdits({});
      },
    });
  };

  const handleCancel = () => {
    // Clear local edits to revert to server data
    setLocalEdits({});
  };

  if (isLoading) {
    return <SkeletonProfileSection />;
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center py-12 text-destructive">
          {t('common:errors.failed_to_load')}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <SectionHeader title={t('profile.title')} description={t('profile.subtitle')} />

        <Separator />

        <AvatarUploader avatarUrl={profile?.avatar} />

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldText
            label={t('profile.form.first_name')}
            id="firstName"
            placeholder={t('profile.form.first_name_placeholder')}
            icon={<UserIcon className="size-4" />}
            value={formData.firstName}
            onChange={handleChange('firstName')}
          />
          <FieldText
            label={t('profile.form.last_name')}
            id="lastName"
            placeholder={t('profile.form.last_name_placeholder')}
            value={formData.lastName}
            onChange={handleChange('lastName')}
          />
          <FieldText
            label={t('profile.form.bio')}
            id="bio"
            placeholder={t('profile.form.bio_placeholder')}
            value={formData.bio}
            onChange={handleChange('bio')}
            className="md:col-span-2"
          />
          <FieldText
            label={t('profile.form.location')}
            id="location"
            placeholder={t('profile.form.location_placeholder')}
            value={formData.location}
            onChange={handleChange('location')}
          />
          <FieldText
            label={t('profile.form.website')}
            id="website"
            placeholder={t('profile.form.website_placeholder')}
            value={formData.website}
            onChange={handleChange('website')}
          />
        </div>

        <div className="flex justify-end gap-3">
          <ActionButton variant="outline" onClick={handleCancel}>
            {t('common:actions.cancel')}
          </ActionButton>
          <ActionButton
            onClick={handleSave}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {t('common:actions.save_changes')}
          </ActionButton>
        </div>
      </div>
    </Card>
  );
};

export default ProfileSection;
