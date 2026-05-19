/**
 * FormValidationShowcasePage - Phase 2: Validation, Feedback & Form States
 * 
 * Demonstrates production-ready form validation patterns including:
 * - Client-side validation (required, patterns, min/max)
 * - Async/server-side validation simulation
 * - Error and success feedback
 * - Loading and disabled states
 */

import React from 'react';

import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';

// Demos
import { ProfileFormDemo } from './demos/ProfileFormDemo';
import { FormStatesDemo } from './demos/FormStatesDemo';
import { LoginFormDemo } from './demos/LoginFormDemo';
import { SettingsFormDemo } from './demos/SettingsFormDemo';
import { ValidationBehaviorInfo } from './demos/ValidationBehaviorInfo';
import { RegistrationFormDemo } from './demos/RegistrationFormDemo';
import { ConditionalValidationDemo } from './demos/ConditionalValidationDemo';

export const FormValidationShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Validation & Feedback"
      description="Production-ready form validation, error handling, and user feedback patterns."
    >
      {/* ========== FIELD-LEVEL VALIDATION ========== */}
      <ShowcaseSection
        title="Field-Level Validation"
        description="Real-time validation with inline error messages. Demonstrates required fields, patterns, and composed field components."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <CodeExample
              id="profile-form-validation"
              title="Profile Form"
              description="Standard input validation with Zod schemas."
              spotlight="primary"
              code={`// Using standardized field components
<FieldText 
  label="First Name"
  {...register('firstName')} 
  status={errors.firstName && 'error'} 
  isRequired
/>

<FieldTextarea 
  label="Bio"
  rows={3}
  {...register('bio')}
/>`}
            >
              <ProfileFormDemo />
            </CodeExample>
            
            <ValidationBehaviorInfo />
          </div>

          <CodeExample
            id="form-states-demo"
            title="Form & Field States"
            description="Visual reference for all validation states and loading indicators."
            spotlight="purple"
            code={`// FieldControl handles states & icons
<FieldControl status="error" icon={<AlertCircle />}>
  <Input className="border-destructive" />
</FieldControl>

<FieldControl isLoading>
  <Input />
</FieldControl>`}
          >
            <FormStatesDemo />
          </CodeExample>
        </div>
      </ShowcaseSection>

      {/* ========== ASYNC/SERVER VALIDATION ========== */}
      <ShowcaseSection
        title="Async & Server Validation"
        description="Server-side validation simulation including authentication errors, duplicate checks, and business rule violations."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <CodeExample
            id="login-form-async"
            title="Login Form"
            description="Simulates API latency and server-side credential validation."
            spotlight="blue"
            code={`// Async validation handling
const onSubmit = async (data) => {
  const res = await api.login(data);
  if (res.error) {
    setServerError(res.message);
  }
};

<FieldEmail 
  {...register('email')}
  status={serverError && 'error'} 
/>`}
          >
            <LoginFormDemo />
          </CodeExample>

          <CodeExample
            id="settings-form-rules"
            title="Settings Form"
            description="Business rule validation (e.g. reserved names) and Select usage."
            spotlight="cyan"
            code={`// FieldSelect usage
<Controller
  name="timezone"
  render={({ field }) => (
    <FieldSelect
      label="Timezone"
      {...field}
      status={errors.timezone && 'error'}
    >
      <SelectItem value="utc">UTC</SelectItem>
    </FieldSelect>
  )}
/>`}
          >
            <SettingsFormDemo />
          </CodeExample>
        </div>
      </ShowcaseSection>

      {/* ========== COMPLEX & CONDITIONAL ========== */}
      <ShowcaseSection
        title="Complex & Conditional Logic"
        description="Advanced scenarios: cross-field validation, conditional requirements, and dynamic field visibility."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <CodeExample
            id="registration-form-complex"
            title="Registration (Cross-Field)"
            description="Complex validation with password strength and cross-field matching."
            spotlight="green"
            code={`// Built-in password strength
<FieldPassword
  showStrengthMeter
  {...register('password')}
/>

// Zod refinement for matching fields
.refine(data => 
  data.password === data.confirm, {
    message: "Passwords don't match"
});`}
          >
            <RegistrationFormDemo />
          </CodeExample>

          <CodeExample
            id="conditional-form-demo"
            title="Conditional Logic"
            description="Dynamic field requirements and dependent validation logic."
            spotlight="purple"
            code={`// Conditional validation schema
.superRefine((data, ctx) => {
  if (data.type === 'mobile' && !data.platform) {
    ctx.addIssue({ ... });
  }
});

// Conditional rendering
{projectType === 'mobile' && (
  <FieldSelect label="Platform" ... />
)}`}
          >
            <ConditionalValidationDemo />
          </CodeExample>
        </div>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default FormValidationShowcasePage;
