import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Globe, Building2 } from 'lucide-react';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/components/Alert';
import FieldText from '@/components/forms/composites/field/FieldText';
import FieldCheckbox from '@/components/forms/composites/field/FieldCheckbox';
import FieldSelect from '@/components/forms/composites/field/FieldSelect';
import { SelectItem } from '@/shared/ui/shadcn/components/ui/select';

// Settings Form Schema
const settingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  timezone: z.string().min(1, 'Please select a timezone'),
  notifications: z.boolean().optional(),
});
type SettingsFormValues = z.infer<typeof settingsSchema>;

export const SettingsFormDemo: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, setError } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      notifications: true,
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate business rule violation
    if (data.companyName.toLowerCase() === 'test') {
      setError('companyName', { 
        type: 'server', 
        message: 'This company name is reserved and cannot be used' 
      });
      return;
    }
    
    console.log('Settings saved:', data);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isSuccess && (
        <Alert variant="success" dismissible autoDismiss autoDismissDelay={3000}>
          <AlertTitle>Settings Saved</AlertTitle>
          <AlertDescription>Your settings have been updated successfully.</AlertDescription>
        </Alert>
      )}

      <FieldText
        label="Company Name"
        placeholder="Acme Inc."
        icon={<Building2 className="h-4 w-4" />}
        {...register('companyName')}
        status={errors.companyName ? 'error' : undefined}
        statusMessage={errors.companyName?.message}
      />

      <FieldText
        label="Website"
        description="Your company's public website"
        placeholder="https://example.com"
        icon={<Globe className="h-4 w-4" />}
        {...register('website')}
        status={errors.website ? 'error' : undefined}
        statusMessage={errors.website?.message}
      />

      <Controller
        name="timezone"
        control={control}
        render={({ field }) => (
          <FieldSelect
            label="Timezone"
            placeholder="Select a timezone"
            onValueChange={field.onChange}
            value={field.value}
            status={errors.timezone ? 'error' : undefined}
            statusMessage={errors.timezone?.message}
          >
            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
            <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
            <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
            <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
          </FieldSelect>
        )}
      />

      <Controller
        name="notifications"
        control={control}
        render={({ field }) => (
          <FieldCheckbox
            checked={field.value}
            onCheckedChange={field.onChange}
          >
            Send me email notifications about important updates
          </FieldCheckbox>
        )}
      />

      <ActionButton type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {isSubmitting ? 'Saving...' : 'Save Settings'}
      </ActionButton>

      <p className="text-xs text-muted-foreground">
        Try company name <code className="bg-muted px-1 rounded">test</code> to see a business rule error
      </p>
    </form>
  );
};
