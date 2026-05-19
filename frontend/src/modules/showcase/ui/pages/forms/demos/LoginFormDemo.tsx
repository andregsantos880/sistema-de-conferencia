import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle2 } from 'lucide-react';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Alert, AlertTitle, AlertDescription } from '@/shared/ui/components/Alert';
import FieldEmail from '@/components/forms/composites/field/FieldEmail';
import { FieldPassword } from '@/components/forms/composites/field';
import FieldCheckbox from '@/components/forms/composites/field/FieldCheckbox';

// Login Form Schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional(),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginFormDemo: React.FC = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate server-side validation error
    if (data.email === 'invalid@test.com') {
      setServerError('No account found with this email address.');
      return;
    }
    if (data.password === 'wrongpass') {
      setServerError('Invalid password. Please try again.');
      return;
    }
    
    console.log('Login successful:', data);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
        <div>
          <h4 className="font-semibold">Sign in successful!</h4>
          <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
        </div>
        <ActionButton variant="outline" size="sm" onClick={() => setIsSuccess(false)}>
          Reset Demo
        </ActionButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertTitle>Sign in failed</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <FieldEmail
        label="Email"
        placeholder="you@company.com"
        {...register('email')}
        status={errors.email ? 'error' : undefined}
        statusMessage={errors.email?.message}
      />

      <FieldPassword
        {...register('password')}
        status={errors.password ? 'error' : undefined}
        statusMessage={errors.password?.message}
      />

      <div className="flex items-center justify-between">
        <Controller
          name="remember"
          control={control}
          render={({ field }) => (
            <FieldCheckbox
              checked={field.value}
              onCheckedChange={field.onChange}
              className="mt-0"
            >
              Remember me for 30 days
            </FieldCheckbox>
          )}
        />
        <button type="button" className="text-sm text-primary hover:underline">
          Forgot password?
        </button>
      </div>

      <ActionButton type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </ActionButton>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ActionButton type="button" variant="outline" className="w-full">
          GitHub
        </ActionButton>
        <ActionButton type="button" variant="outline" className="w-full">
          Google
        </ActionButton>
      </div>

      <div className="text-xs text-muted-foreground text-center pt-2">
        <p>Try these for demo errors:</p>
        <p><code className="bg-muted px-1 rounded">invalid@test.com</code> - Account not found</p>
        <p>Password: <code className="bg-muted px-1 rounded">wrongpass</code> - Invalid password</p>
      </div>
    </form>
  );
};
