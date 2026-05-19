import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, User, Phone } from 'lucide-react';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/components/Alert';
import FieldText from '@/components/forms/composites/field/FieldText';
import FieldEmail from '@/components/forms/composites/field/FieldEmail';
import FieldTextarea from '@/components/forms/composites/field/FieldTextarea';

// Profile Form Schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number').optional().or(z.literal('')),
  bio: z.string().max(200, 'Bio must be 200 characters or less').optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileFormDemo: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ProfileFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Profile saved:', data);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isSuccess && (
        <Alert variant="success" dismissible onDismiss={() => setIsSuccess(false)}>
          <AlertTitle>Profile Updated</AlertTitle>
          <AlertDescription>Your profile has been saved successfully.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldText
          label="First Name"
          placeholder="John"
          icon={<User className="h-4 w-4" />}
          required
          {...register('firstName')}
          status={errors.firstName ? 'error' : undefined}
          statusMessage={errors.firstName?.message}
        />

        <FieldText
          label="Last Name"
          placeholder="Doe"
          required
          {...register('lastName')}
          status={errors.lastName ? 'error' : undefined}
          statusMessage={errors.lastName?.message}
        />
      </div>

      <FieldEmail
        label="Email"
        isRequired
        placeholder="john.doe@company.com"
        {...register('email')}
        status={errors.email ? 'error' : undefined}
        statusMessage={errors.email?.message}
      />

      <FieldText
        label="Phone"
        description="Include country code for international numbers"
        placeholder="+1 555 123 4567"
        icon={<Phone className="h-4 w-4" />}
        {...register('phone')}
        status={errors.phone ? 'error' : undefined}
        statusMessage={errors.phone?.message}
      />

      <FieldTextarea 
        label="Bio"
        description="Brief description for your profile (max 200 characters)"
        placeholder="Tell us about yourself..."
        rows={3}
        {...register('bio')}
        status={errors.bio ? 'error' : undefined}
        statusMessage={errors.bio?.message}
      />

      <div className="flex items-center gap-3 pt-2">
        <ActionButton type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </ActionButton>
        <ActionButton type="button" variant="outline" onClick={() => reset()}>
          Reset
        </ActionButton>
      </div>
    </form>
  );
};
