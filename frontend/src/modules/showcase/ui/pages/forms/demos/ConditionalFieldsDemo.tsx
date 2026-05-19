/**
 * Conditional Fields Demo - Real-life Implementation
 * 
 * Account setup form with conditional fields, Zod validation, and API submission.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Button } from '@/shared/ui/shadcn/components/ui/button';

import { Alert, AlertDescription } from '@/shared/ui/components/Alert';
import { SelectItem } from '@/shared/ui/shadcn/components/ui/select';
import { cn } from '@/shadcn/lib/utils';

import FieldText from '@/components/forms/composites/field/FieldText';
import FieldEmail from '@/components/forms/composites/field/FieldEmail';
import FieldSelect from '@/components/forms/composites/field/FieldSelect';
import { FormSection } from '@/components/forms/layout/FormSection';
import { FormFieldRadioGroup } from '@/shared/ui/components/forms/composites/form/FormFieldRadioGroup';
import { getFieldStatus } from './formUtils';

import { User, Bell, Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { RequestPreview } from '../../../components/RequestPreview';

// Zod Schema
const accountSetupSchema = z.object({
  accountType: z.enum(['personal', 'business']),
  // Personal fields
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  personalEmail: z.string().email('Invalid email address').optional(),
  // Business fields
  companyName: z.string().min(2, 'Company name is required').optional(),
  taxId: z.string().optional(),
  adminName: z.string().optional(),
  adminEmail: z.string().email('Invalid email').optional(),
  companySize: z.string().optional(),
  // Notifications
  enableNotifications: z.boolean(),
  notificationPreference: z.enum(['all', 'important', 'none']).optional(),
  // Security
  enableTwoFactor: z.boolean(),
  backupPhone: z.string().optional(),
}).refine((data) => {
  // Conditional validation for personal account
  if (data.accountType === 'personal') {
    return data.fullName && data.fullName.length >= 2 && data.personalEmail;
  }
  return true;
}, {
  message: 'Personal account requires name and email',
  path: ['fullName'],
}).refine((data) => {
  // Conditional validation for business account
  if (data.accountType === 'business') {
    return data.companyName && data.companyName.length >= 2 && 
           data.adminEmail && data.companySize;
  }
  return true;
}, {
  message: 'Business account requires company details',
  path: ['companyName'],
}).refine((data) => {
  // Validate notification preference when enabled
  if (data.enableNotifications) {
    return data.notificationPreference !== undefined;
  }
  return true;
}, {
  message: 'Please select notification preference',
  path: ['notificationPreference'],
}).refine((data) => {
  // Validate backup phone when 2FA is enabled
  if (data.enableTwoFactor) {
    return data.backupPhone && data.backupPhone.length >= 10;
  }
  return true;
}, {
  message: 'Backup phone is required for 2FA',
  path: ['backupPhone'],
});

type AccountSetupFormData = z.infer<typeof accountSetupSchema>;

export const ConditionalFieldsDemo: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<AccountSetupFormData>({
    resolver: zodResolver(accountSetupSchema),
    defaultValues: {
      accountType: 'personal',
      enableNotifications: true,
      notificationPreference: 'important',
      enableTwoFactor: false,
    },
  });

  const accountType = watch('accountType');
  const enableNotifications = watch('enableNotifications');
  const enableTwoFactor = watch('enableTwoFactor');
  
  const formData = watch();

  const onSubmit = async (data: AccountSetupFormData) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Account setup submitted:', data);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Account Type Selection */}
      <FormSection
        title="Account Type"
        description="Choose the type of account you want to create"
        icon={<User className="w-5 h-5 text-primary" />}
        layout='split'
        variant='card'
      >
        <FormFieldRadioGroup
          name="accountType"
          control={control}
          variant="card"
          options={[
            {
              value: 'personal',
              title: 'Personal Account',
              description: 'For individual use with basic features',
            },
            {
              value: 'business',
              title: 'Business Account',
              description: 'For teams with advanced features & billing',
            },
          ]}
        />

        {/* Conditional Personal Fields */}
        <div
          className={cn(
            'grid gap-4 md:grid-cols-2 overflow-hidden transition-all duration-300',
            accountType === 'personal'
              ? 'max-h-[500px] opacity-100 mt-6'
              : 'max-h-0 opacity-0 mt-0'
          )}
        >
          <FieldText 
            label="Full Name" 
            placeholder="Jane Smith"
            {...register('fullName')}
            {...getFieldStatus(errors.fullName)}
          />
          <FieldEmail 
            label="Email" 
            placeholder="jane@email.com"
            {...register('personalEmail')}
            {...getFieldStatus(errors.personalEmail)}
          />
        </div>

        {/* Conditional Business Fields */}
        <div
          className={cn(
            'space-y-4 overflow-hidden transition-all duration-300',
            accountType === 'business'
              ? 'max-h-[800px] opacity-100 mt-6'
              : 'max-h-0 opacity-0 mt-0'
          )}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FieldText 
              label="Company Name" 
              placeholder="Acme Corporation"
              {...register('companyName')}
              {...getFieldStatus(errors.companyName)}
            />
            <FieldText 
              label="Tax ID / VAT Number" 
              placeholder="XX-XXXXXXX"
              {...register('taxId')}
              {...getFieldStatus(errors.taxId)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldText 
              label="Admin Name" 
              placeholder="Jane Smith"
              {...register('adminName')}
              {...getFieldStatus(errors.adminName)}
            />
            <FieldEmail 
              label="Admin Email" 
              placeholder="admin@company.com"
              {...register('adminEmail')}
              {...getFieldStatus(errors.adminEmail)}
            />
          </div>
          <FieldSelect 
            label="Company Size"
            value={watch('companySize')}
            onValueChange={(v) => setValue('companySize', v)}
            {...getFieldStatus(errors.companySize)}
          >
            <SelectItem value="1-10">1-10 employees</SelectItem>
            <SelectItem value="11-50">11-50 employees</SelectItem>
            <SelectItem value="51-200">51-200 employees</SelectItem>
            <SelectItem value="201+">201+ employees</SelectItem>
          </FieldSelect>
          {errors.companySize && (
            <p className="text-sm text-destructive">{errors.companySize.message}</p>
          )}
        </div>
      </FormSection>

      {/* Notification Settings */}
      <FormSection
        title="Notification Settings"
        description="Configure how you want to receive updates"
        icon={<Bell className="w-5 h-5 text-primary" />}
        layout='split'
        variant='card'
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your account activity
              </p>
            </div>
            <Switch
              id="notifications"
              checked={enableNotifications}
              onCheckedChange={(checked) => setValue('enableNotifications', checked)}
            />
          </div>

          <div
            className={cn(
              'space-y-4 pl-4 border-l-2 border-muted overflow-hidden transition-all duration-300',
              enableNotifications
                ? 'max-h-[300px] opacity-100 mt-6'
                : 'max-h-0 opacity-0 py-0'
            )}
          >
            <Label className="text-sm font-medium">Notification Frequency</Label>
            <FormFieldRadioGroup
              name="notificationPreference"
              control={control}
              options={[
                { value: 'all', title: 'All notifications' },
                { value: 'important', title: 'Important only' },
                { value: 'none', title: 'Digest (weekly summary)' },
              ]}
            />
          </div>
        </div>
      </FormSection>

      {/* Security Settings */}
      <FormSection
        title="Security"
        description="Protect your account with additional security measures"
        icon={<Shield className="w-5 h-5 text-primary" />}
        layout='split'
        variant='card'
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="twoFactor"
              checked={enableTwoFactor}
              onCheckedChange={(checked) => setValue('enableTwoFactor', checked)}
            />
          </div>

          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              enableTwoFactor
                ? 'max-h-[200px] opacity-100 mt-6'
                : 'max-h-0 opacity-0'
            )}
          >
            <Alert className="bg-amber-500/10 border-amber-500/30">
              <AlertDescription className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-600" />
                <span>You'll need an authenticator app to complete 2FA setup.</span>
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <FieldText 
                label="Phone Number for Backup" 
                placeholder="+1 (555) 000-0000"
                description="Used for account recovery if you lose access to your authenticator"
                {...register('backupPhone')}
                {...getFieldStatus(errors.backupPhone)}
              />
            </div>
          </div>
        </div>
      </FormSection>

      {/* Submit Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : submitSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Account Created!
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </div>

      {/* JSON Preview */}
      <RequestPreview data={formData} title="Request Payload" />
    </form>
  );
};
