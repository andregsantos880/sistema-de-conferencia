import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import FieldText from '@/components/forms/composites/field/FieldText';
import FieldEmail from '@/components/forms/composites/field/FieldEmail';
import FieldPassword from '@/components/forms/composites/field/FieldPassword';
import FieldCheckbox from '@/components/forms/composites/field/FieldCheckbox';
import FieldHelperText from '@/components/forms/composites/field/FieldHelperText';
import FieldTextarea from '@/components/forms/composites/field/FieldTextarea';
import { FieldDate, FieldDateTime, FileUploadZone } from '@/components/forms/composites/field';
import { User, Briefcase } from 'lucide-react';

const ReadyFieldsPage: React.FC = () => {
  const [helperText, setHelperText] = useState('');
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [dateTimeValue, setDateTimeValue] = useState<Date | null>(null);

  return (
    <ShowcasePage
      title="Ready-to-Use Fields"
      description="Pre-built field components with embedded validation logic and specialized UI patterns."
    >
      <ShowcaseSection
        title="Field Components"
        description="High-level field wrappers for common data types."
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
      >
        {/* FieldText */}
        <CodeExample
            id="field-text"
            title="FieldText"
            description="Standard fields with optimized support for icons and labels."
            spotlight="green"
            code={`<FieldText 
  label="Full Name"
  placeholder="Enter your name"
  description="Your legal name"
  icon={<User className="h-4 w-4" />}
/>`}
        >
            <div className="space-y-4">
            <FieldText
                label="Full Name"
                placeholder="Enter your name"
                description="Your legal name as it appears on documents"
                icon={<User className="h-4 w-4" />}
            />
            <FieldText
                label="Company"
                placeholder="Enter company name"
                description="Your current employer"
                icon={<Briefcase className="h-4 w-4" />}
            />
            </div>
        </CodeExample>

        {/* FieldEmail */}
        <CodeExample
            id="field-email"
            title="FieldEmail"
            description="Validated email input with built-in pattern matching."
            spotlight="green"
            code={`<FieldEmail 
  label="Email Address"
  placeholder="you@example.com"
  status="default"
/>`}
        >
            <div className="space-y-4">
            <FieldEmail
                label="Email Address"
                placeholder="you@example.com"
            />
            <FieldEmail
                label="Email Address (Error)"
                placeholder="you@example.com"
                status="error"
                statusMessage="Please enter a valid email address."
                defaultValue="invalid-email"
            />
            </div>
        </CodeExample>

        {/* FieldPassword */}
        <CodeExample
            id="field-password"
            title="FieldPassword"
            description="Secure input with visibility toggle and strength options."
            spotlight="green"
            code={`<FieldPassword 
  placeholder="Enter password"
  autoComplete="current-password"
/>

<FieldPassword 
  defaultValue="S3curePass"
  placeholder="Enter password"
  autoComplete="current-password"
  showStrengthMeter
/>`}
        >
            <div className="space-y-4">
            <div className="space-y-1 bg-muted/50 p-3 rounded-md">
                <p className="text-sm text-muted-foreground">Password</p>
                <FieldPassword placeholder="Enter password" />
            </div>

            <div className="space-y-1 bg-muted/50 p-3 rounded-md">
                <p className="text-sm text-muted-foreground">Password with strength meter</p>
                <FieldPassword placeholder="Enter password" showStrengthMeter />
            </div>
            </div>
        </CodeExample>

        {/* FieldCheckbox */}
        <CodeExample
            id="field-checkbox"
            title="FieldCheckbox"
            description="Accessible checkbox wrapper with integrated error states."
            spotlight="green"
            code={`<FieldCheckbox>
  Remember me for 30 days
</FieldCheckbox>`}
        >
            <div className="space-y-4">
            <FieldCheckbox>
                Remember me for 30 days
            </FieldCheckbox>
            <FieldCheckbox
                status="error"
                statusMessage="You must accept the terms to continue."
            >
                I accept the terms and conditions
            </FieldCheckbox>
            </div>
        </CodeExample>

        {/* HelperTextInput */}
        <CodeExample
            id="helper-text-input"
            title="HelperTextInput"
            description="Input field with dynamic character count and limits."
            spotlight="green"
            code={`<HelperTextInput
  label="Bio"
  value={helperText}
  onChange={setHelperText}
  maxLength={160}
  placeholder="Tell us about yourself..."
  warningThreshold={40}
  dangerThreshold={20}
/>`}
        >
            <div>
            <FieldHelperText
                label="Bio"
                value={helperText}
                onChange={setHelperText}
                maxLength={160}
                placeholder="Tell us about yourself..."
                warningThreshold={40}
                dangerThreshold={20}
            />
            </div>
        </CodeExample>

        {/* CalendarInput */}
        <CodeExample
            id="calendar-input"
            title="Date & Time Fields"
            description="Native date and time pickers with formatting."
            spotlight="green"
            code={`<FieldDate
  label="Event Date"
  value={dateValue}
  onChange={setDateValue}
  placeholder="Select date"
/>

<FieldDateTime
  label="Meeting Time"
  value={dateTimeValue}
  onChange={setDateTimeValue}
  placeholder="Select date and time"
/>`}
        >
            <div className="space-y-4">
            <FieldDate
                label="Event Date"
                value={dateValue}
                onChange={setDateValue}
                placeholder="Select date"
                description="Choose the date for your event."
            />
            <FieldDateTime
                label="Meeting Time"
                value={dateTimeValue}
                onChange={setDateTimeValue}
                placeholder="Select date and time"
                description="Select both date and time for the meeting."
            />
            </div>
        </CodeExample>

        {/* FieldTextarea */}
        <CodeExample
            id="field-textarea"
            title="FieldTextarea"
            description="Textarea with label, description, and status support."
            spotlight="teal"
            code={`<FieldTextarea 
  label="Description"
  placeholder="Type a message..."
  description="Max 500 characters"
  status="default"
/>`}
        >
            <FieldTextarea 
                label="Bio / Description" 
                placeholder="Tell us a bit about yourself..."
                description="A short bio helps other users know who you are."
                rows={4}
            />
        </CodeExample>

        {/* FileUploadZone */}
        <CodeExample
            id="file-upload-zone"
            title="FileUploadZone"
            description="File upload zone component."
            spotlight="green"
            code={`<FileUploadZone 
  label="Profile Photo"
  placeholder="Select your profile photo"
  description="Select your profile photo"
  status="default"
/>`}
        >
            <FileUploadZone />
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default ReadyFieldsPage;
