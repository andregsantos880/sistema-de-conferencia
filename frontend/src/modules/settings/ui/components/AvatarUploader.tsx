import React from 'react';
import { useTranslation } from 'react-i18next';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { useUploadAvatar } from '../../application/hooks/useSettings';

interface AvatarUploaderProps {
  avatarUrl?: string;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ avatarUrl }) => {
  const { t } = useTranslation('settings');
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);
  const objectUrlRef = React.useRef<string | null>(null);
  const uploadAvatar = useUploadAvatar();

  // Display preview if available, otherwise use avatarUrl from props
  const displaySrc = previewSrc || avatarUrl || 'https://github.com/shadcn.png';

  React.useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const onPick = () => inputRef.current?.click();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreviewSrc(url); // optimistic preview

    // Upload to API
    uploadAvatar.mutate(file, {
      onSuccess: () => {
        // Clear preview on success - the new avatar URL will come from refetched profile
        setPreviewSrc(null);
      },
      onError: () => {
        // Revert preview on error
        setPreviewSrc(null);
      },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-6">
      <Avatar className="w-24 h-24">
        <AvatarImage src={displaySrc} />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={onChange} aria-hidden="true" />
        <ActionButton
          variant="outline"
          className="gap-2"
          onClick={onPick}
          disabled={uploadAvatar.isPending}
          aria-label={t('profile.avatar.change_aria')}
        >
          {uploadAvatar.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
          {t('profile.avatar.change_photo')}
        </ActionButton>
        <p className="text-xs text-muted-foreground">{t('profile.avatar.help')}</p>
      </div>
    </div>
  );
};

export default AvatarUploader;
