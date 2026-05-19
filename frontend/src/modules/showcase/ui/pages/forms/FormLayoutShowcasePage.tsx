import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
// Primitives
import FieldText from '@/components/forms/composites/field/FieldText';
import FieldSelect from '@/components/forms/composites/field/FieldSelect';
import FieldTextarea from '@/components/forms/composites/field/FieldTextarea';
// Shadcn

import { SelectItem } from '@/shared/ui/shadcn/components/ui/select';
import { FormSection } from '@/components/forms/layout/FormSection';

import { Building2, Globe, FileText, LayoutTemplate } from 'lucide-react';


/**
 * Reusable form content to demonstrate consistency across variants
 */
const WorkspaceFormContent = () => (
  <>
    <div className="grid gap-5 md:grid-cols-2">
      <FieldText 
        label="Workspace Name" 
        defaultValue="The Web Dev Company" 
        placeholder="e.g. Acme Corp"
        icon={<Building2 className="w-4 h-4" />}
      />
      <FieldText 
        label="Workspace URL" 
        defaultValue="thewebdevcompany" 
        placeholder="your-company"
        icon={<Globe className="w-4 h-4" />}
      />
    </div>
    
    <FieldSelect 
      label="Industry" 
      defaultValue="tech"
    >
      <SelectItem value="tech">Technology</SelectItem>
      <SelectItem value="marketing">Marketing</SelectItem>
      <SelectItem value="design">Design</SelectItem>
      <SelectItem value="finance">Finance</SelectItem>
    </FieldSelect>

    <FieldTextarea 
      label="Description (Optional)" 
      rows={3} 
      defaultValue="We are a modern web development agency specializing in building scalable SaaS products."
      placeholder="Tell us about your team..."
    />
  </>
);

/**
 * Phase 3 – Layouts, Composition & Form Structure
 */
const FormLayoutShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Form Layouts & Composition"
      description="Learn how to structure complex, real-world forms with clean layouts that scale across screen sizes and business domains."
    >
      {/* Introduction */}
      <ShowcaseSection
        title="Layout Patterns"
        description="Core layout strategies for structuring forms across different screen sizes."
        className="grid gap-6 xl:grid-cols-2"
      >
        {/* Column 1: Single-Column Form */}
        <CodeExample
          id="single-column-contact"
          title="Single-Column Layout"
          description="Best for simple data entry and mobile-first flows."
          className="h-full"
          code={`<form className="space-y-5">
  <FieldText label="Full Name" placeholder="Jane Smith" />
  <FieldText label="Email Address" type="email" placeholder="jane@company.com" />
  <FieldSelect label="Subject" placeholder="Select a topic">
    <SelectItem value="support">Technical Support</SelectItem>
    <SelectItem value="billing">Billing Question</SelectItem>
  </FieldSelect>
  <FieldTextarea label="Message" rows={4} />
  <Button className="w-full">Send Message</Button>
</form>`}
        >
          <form className="space-y-5">
            <FieldText label="Full Name" placeholder="Jane Smith" />
            <FieldText label="Email Address" type="email" placeholder="jane@company.com" />
            <FieldSelect label="Subject" placeholder="Select a topic">
              <SelectItem value="support">Technical Support</SelectItem>
              <SelectItem value="billing">Billing Question</SelectItem>
              <SelectItem value="sales">Sales Inquiry</SelectItem>
            </FieldSelect>
            <FieldTextarea label="Message" rows={4} placeholder="How can we help?" />
            <Button type="button" className="w-full">Send Message</Button>
          </form>
        </CodeExample>

        {/* Column 2: Two-Column Form */}
        <CodeExample
          id="two-column-profile"
          title="Multi-Column Layout"
          description="Balanced field distribution for larger screens."
          className="h-full"
          code={`<form className="space-y-6">
  <div className="grid gap-5 md:grid-cols-2">
    <FieldText label="First Name" />
    <FieldText label="Last Name" />
  </div>
  <div className="grid gap-5 md:grid-cols-2">
    <FieldText label="Email" type="email" />
    <FieldText label="Phone" type="tel" />
  </div>
  <FieldTextarea label="Bio" rows={3} />
  <div className="flex gap-3">
    <Button type="submit">Save Profile</Button>
    <Button variant="outline">Cancel</Button>
  </div>
</form>`}
        >
          <form className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <FieldText label="First Name" placeholder="Jane" defaultValue="Jane" />
              <FieldText label="Last Name" placeholder="Smith" defaultValue="Smith" />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <FieldText label="Email" type="email" placeholder="jane@company.com" defaultValue="jane@company.com" />
              <FieldText label="Phone" type="tel" placeholder="+1 (555) 000-0000" defaultValue="+1 (555) 123-4567" />
            </div>
            <FieldTextarea 
              label="Bio" 
              rows={3} 
              placeholder="Tell us about yourself..." 
              defaultValue="Product designer with 8 years of experience in B2B SaaS."
            />
            <div className="flex gap-3 pt-2">
              <Button type="button">Save Profile</Button>
              <Button type="button" variant="outline">Cancel</Button>
            </div>
          </form>
        </CodeExample>
      </ShowcaseSection>

      {/* Form Sections Showcase */}
      <ShowcaseSection
        title="Form Sections & Hierarchy"
        description="Choose the right section style to group related fields. All examples below use the same form content to demonstrate the visual differences."
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* 1. Stacked Layout - Default Style */}
        <CodeExample
          id="stacked-default"
          title="Stacked Layout (Default)"
          description="Standard vertical stacking. Clean and minimal, best for dense forms."
          spotlight="blue"
          code={`<FormSection
  title="Workspace Information"
  icon={<LayoutTemplate />}
  variant="default"
>
  {/* Content */}
</FormSection>

<FormSection
  title="Billing Details"
  icon={<FileText />}
  variant="default"
>
  {/* Content */}
</FormSection>`}
        >
          <FormSection
            title="Workspace Information"
            description="Edit workspace name, URL, and description details."
            icon={<LayoutTemplate className="w-5 h-5 text-primary" />}
            variant="default"
            withDivider
          >
            <WorkspaceFormContent />
          </FormSection>

          <FormSection
            title="Billing Details"
            description="Manage multiple billing addresses and payment methods."
            icon={<FileText className="w-5 h-5 text-primary" />}
            variant="default"
          >
            <div className="p-12 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground bg-muted/10">
                Additional Config Content
            </div>
          </FormSection>

          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline">Discard</Button>
            <Button>Save Changes</Button>
          </div>
        </CodeExample>

        {/* 2. Stacked Layout - Card Style */}
        <CodeExample
          id="stacked-card"
          title="Stacked Layout (Card)"
          description="Contained sections with borders. detailed separation for settings pages."
          spotlight="purple"
          code={`<FormSection
  title="Workspace Information"
  icon={<Building2 className="w-5 h-5 text-primary" />}
  variant="card"
>
  {/* Content */}
</FormSection>

<FormSection
  title="Billing Details"
  icon={<FileText className="w-5 h-5 text-primary" />}
  variant="card"
>
  {/* Content */}
</FormSection>`}
        >
          <div className="space-y-8">
            <FormSection
              title="Workspace Information"
              description="Edit workspace name, URL, and description details."
              icon={<Building2 className="w-5 h-5 text-primary" />}
              variant="card"
            >
              <WorkspaceFormContent />
            </FormSection>

            <FormSection
              title="Billing Details"
              description="Manage multiple billing addresses and payment methods."
              icon={<FileText className="w-5 h-5 text-primary" />}
              variant="card"
            >
              <div className="p-12 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground bg-muted/10">
                  Additional Config Content
              </div>
            </FormSection>
          </div>

          <div className="flex justify-end gap-3 pt-6">
                <Button variant="outline">Discard</Button>
                <Button>Save Changes</Button>
          </div>
        </CodeExample>

        {/* 3. Split Layout - Default Style */}
        <CodeExample
          id="split-default"
          title="Split Layout (Default)"
          description="Sidebar look without containers. Minimalist approach to the split pattern."
          spotlight="cyan"
          code={`<FormSection
  title="Workspace Information"
  icon={<Globe className="w-5 h-5 text-primary" />}
  layout="split"
  variant="default"
>
  {/* Content */}
</FormSection>

<FormSection
  title="Billing Details"
  icon={<FileText className="w-5 h-5 text-primary" />}
  layout="split"
  variant="default"
>
  {/* Content */}
</FormSection>`}
        >
          <FormSection
            title="Workspace Information"
            description="Edit workspace name, URL, and description details."
            icon={<Globe className="w-5 h-5 text-primary" />}
            layout="split"
            variant="default"
            withDivider
          >
            <WorkspaceFormContent />
          </FormSection>

          <FormSection
            title="Billing Details"
            description="Manage multiple billing addresses and payment methods."
            icon={<FileText className="w-5 h-5 text-primary" />}
            layout="split"
            variant="default"
          >
            <div className="p-12 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground bg-muted/10">
                Additional Config Content
            </div>
          </FormSection>

          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline">Discard</Button>
            <Button>Save Changes</Button>
          </div>
        </CodeExample>

        {/* 4. Split Layout - Card Style */}
        <CodeExample
          id="split-card"
          title="Split Layout (Card)"
          description="Sidebar look with contained content blocks. High contrast and separate sections."
          spotlight="green"
          code={`<FormSection
  title="Workspace Information"
  icon={<Globe className="w-5 h-5 text-primary" />}
  layout="split"
  variant="card"
>
  {/* Content */}
</FormSection>

<FormSection
  title="Billing Details"
  icon={<FileText className="w-5 h-5 text-primary" />}
  layout="split"
  variant="card"
>
  {/* Content */}
</FormSection>`}
        >
          <FormSection
            title="Workspace Information"
            description="Edit workspace name, URL, and description details."
            icon={<Globe className="w-5 h-5 text-primary" />}
            layout="split"
            variant="card"
            withDivider
          >
            <WorkspaceFormContent />
          </FormSection>
          
          <FormSection
            title="Billing Details"
            description="Manage multiple billing addresses and payment methods."
            icon={<FileText className="w-5 h-5 text-primary" />}
            layout="split"
            variant="card"
          >
            <div className="p-12 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground bg-muted/10">
                Additional Config Content
            </div>
          </FormSection>

          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline">Discard</Button>
            <Button>Save Changes</Button>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default FormLayoutShowcasePage;
