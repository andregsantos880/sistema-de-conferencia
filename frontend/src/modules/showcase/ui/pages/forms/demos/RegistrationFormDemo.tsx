import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/components/Alert';
import FieldEmail from '@/components/forms/composites/field/FieldEmail';
import { FieldPassword } from '@/components/forms/composites/field';
import FieldText from '@/components/forms/composites/field/FieldText';
import FieldCheckbox from '@/components/forms/composites/field/FieldCheckbox';

// Registration Schema with password confirmation
const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be 20 characters or less')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegistrationFormDemo: React.FC = () => {
  const [emailTaken, setEmailTaken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, control, formState: { errors, isSubmitting, isValid } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setEmailTaken(false);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate email already exists
    if (data.email === 'taken@example.com') {
      setEmailTaken(true);
      return;
    }
    
    console.log('Registration successful:', data);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
        <div>
          <h4 className="font-semibold">Account created!</h4>
          <p className="text-sm text-muted-foreground">Check your email to verify your account.</p>
        </div>
        <ActionButton variant="outline" size="sm" onClick={() => setIsSuccess(false)}>
          Reset Demo
        </ActionButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {emailTaken && (
        <Alert variant="warning">
          <AlertTitle>Email already registered</AlertTitle>
          <AlertDescription>
            This email is already associated with an account. 
            <button type="button" className="text-primary hover:underline ml-1">
              Sign in instead?
            </button>
          </AlertDescription>
        </Alert>
      )}

      <FieldText
        label="Username"
        placeholder="johndoe"
        {...register('username')}
        status={errors.username ? 'error' : undefined}
        statusMessage={errors.username?.message}
        icon={<span className="text-sm text-muted-foreground font-medium">@</span>}
      />

      <FieldEmail
        label="Email"
        placeholder="you@company.com"
        {...register('email')}
        status={emailTaken ? 'error' : errors.email ? 'error' : undefined}
        statusMessage={emailTaken ? 'This email is already registered' : errors.email?.message}
      />

      <FieldPassword
        placeholder="Password"
        {...register('password')}
        status={errors.password ? 'error' : undefined}
        statusMessage={errors.password?.message}
        showStrengthMeter // Use the built-in feature
        className="mb-1"
      />

      <FieldPassword
        placeholder="Confirm Password"
        {...register('confirmPassword')}
        status={errors.confirmPassword ? 'error' : undefined}
        statusMessage={errors.confirmPassword?.message}
      />

      <Controller
        name="terms"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <FieldCheckbox
              checked={field.value}
              onCheckedChange={field.onChange}
              className="mt-0"
              status={errors.terms ? 'error' : undefined}
            >
              <div className="text-sm font-normal leading-relaxed">
                I agree to the <button type="button" className="text-primary hover:underline">Terms of Service</button> and <button type="button" className="text-primary hover:underline">Privacy Policy</button>
              </div>
            </FieldCheckbox>
            {errors.terms && (
              <p className="text-xs text-destructive flex items-center gap-1 pl-7">
                <AlertCircle className="h-3 w-3" />
                {errors.terms.message}
              </p>
            )}
          </div>
        )}
      />

      <ActionButton type="submit" className="w-full" disabled={isSubmitting || !isValid}>
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </ActionButton>

      <p className="text-xs text-muted-foreground text-center">
        Try <code className="bg-muted px-1 rounded">taken@example.com</code> to see "email exists" error
      </p>
    </form>
  );
};
