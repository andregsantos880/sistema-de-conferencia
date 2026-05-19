import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import { FormShowcaseSection, PrimitiveGrid, PrimitiveCard, StateDemo } from '../../components/forms/FormShowcaseSection';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Textarea } from '@/shared/ui/shadcn/components/ui/textarea';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { Search, Copy, Eye } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput } from '@/shared/ui/shadcn/components/ui/input-group';
import FormSection from '@/components/forms/layout/FormSection';

const FormBasicsShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Form Basics & Primitives"
      description="Production-ready form primitives with consistent styling and behavior. All components follow enterprise design patterns and accessibility standards."
    >


      {/* ========== INPUT GROUPS & ADORNMENTS ========== */}
      <ShowcaseSection
        title="Input Groups & Adornments"
        description="Enhance text inputs with icons, buttons, and text addons using the flexible InputGroup component."
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Search & Actions */}
        <CodeExample
          id="input-group-actions"
          title="Search & Actions"
          description="Inputs with integrated actions, icons, and keyboard shortcuts."
          code={`{/* Search with Shortcut */}
<div className="space-y-2">
  <Label>Search</Label>
  <InputGroup>
    <InputGroupText>
      <Search />
    </InputGroupText>
    <InputGroupInput placeholder="Search..." />
    <InputGroupAddon>
      <Command className="w-3.5 h-3.5" />K
    </InputGroupAddon>
  </InputGroup>
</div>

{/* URL with Copy Action */}
<div className="space-y-2">
  <Label>Project URL</Label>
  <InputGroup>
    <InputGroupAddon>https://</InputGroupAddon>
    <InputGroupInput defaultValue="katalyst.dev" />
    <InputGroupButton onClick={copy}>
      <Copy />
    </InputGroupButton>
  </InputGroup>
</div>`}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Search</Label>
              <InputGroup>
                <InputGroupInput placeholder="Search..." />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label>Project URL</Label>
              <InputGroup>
                <InputGroupAddon>https://</InputGroupAddon>
                <InputGroupInput defaultValue="katalyst.dev" />
                <InputGroupButton onClick={() => navigator.clipboard.writeText('https://katalyst.dev')}>
                  <Copy />
                </InputGroupButton>
              </InputGroup>
            </div>
          </div>
        </CodeExample>

        {/* Data Formats */}
        <CodeExample
          id="input-group-data"
          title="Data Formats"
          description="Prefixes and suffixes for structured data entry like currency and passwords."
          code={`{/* Currency Input */}
<div className="space-y-2">
  <Label>Amount</Label>
  <InputGroup>
    <InputGroupText>$</InputGroupText>
    <InputGroupInput placeholder="0.00" type="number" />
    <InputGroupAddon>USD</InputGroupAddon>
  </InputGroup>
</div>

{/* Password Reveal */}
<div className="space-y-2">
  <Label>Password</Label>
  <InputGroup>
    <InputGroupInput type="password" />
    <InputGroupButton onClick={toggleVisibility}>
      <Eye />
    </InputGroupButton>
  </InputGroup>
</div>`}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Monthly Budget</Label>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput placeholder="0.00" min="0" step="0.01" type="number" />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>USD</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <InputGroup>
                <InputGroupInput type="password" defaultValue="sk_test_51MxP..." />
                <InputGroupButton>
                  <Eye />
                </InputGroupButton>
              </InputGroup>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* ========== BASE FIELDS ========== */}
      <ShowcaseSection
        title="Form Basics & Primitives"
        description="Production-ready form primitives with consistent styling and behavior. All components follow enterprise design patterns and accessibility standards."
      >
        <CodeExample 
          id="form-basics" 
          code={`<Input placeholder="Enter your name" />
<Input type="password" placeholder="Enter password" />
<Textarea placeholder="Enter a detailed description..." rows={4} />
`}
        >
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6'>
            {/* ========== TEXT INPUTS ========== */}
            <FormSection
              title="Text Inputs"
              description="Standard single-line text fields for collecting user data."
            >
              <PrimitiveCard title="Text Input" description="Standard single-line text field">
                <StateDemo label="Default" note="Empty state with placeholder">
                  <Input placeholder="Enter your name" />
                </StateDemo>

                <StateDemo label="With Value" note="Input contains text">
                  <Input defaultValue="John Doe" />
                </StateDemo>

                <StateDemo label="Focus" note="Active input with ring">
                  <Input
                    defaultValue="John Doe"
                    className="border-ring ring-ring/50 ring-[3px]"
                  />
                </StateDemo>

                <StateDemo label="Disabled" note="Cannot be edited">
                  <Input disabled value="John Doe" />
                </StateDemo>

                <StateDemo label="Read-only" note="Value cannot be changed">
                  <Input readOnly value="John Doe" className="bg-muted/50" />
                </StateDemo>
              </PrimitiveCard>
            </FormSection>

            {/* ========== PASSWORD INPUTS ========== */}
            <FormSection
              title="Password Inputs"
              description="Secure password fields with masked input."
            >
              <PrimitiveCard title="Password Input" description="Secure password field with type='password'">
                <StateDemo label="Default" note="Empty state with placeholder">
                  <Input type="password" placeholder="Enter password" />
                </StateDemo>

                <StateDemo label="With Value" note="Password is masked">
                  <Input type="password" defaultValue="password123" />
                </StateDemo>

                <StateDemo label="Focus" note="Active input state">
                  <Input
                    type="password"
                    defaultValue="password123"
                    className="border-ring ring-ring/50 ring-[3px]"
                  />
                </StateDemo>

                <StateDemo label="Disabled" note="Password field is locked">
                  <Input type="password" disabled value="••••••••" />
                </StateDemo>
              </PrimitiveCard>
            </FormSection>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* ========== TEXTAREA ========== */}
      <ShowcaseSection
        title="Textarea"
        description="Multi-line text input for longer content."
      >
        <PrimitiveGrid columns={2}>
          <PrimitiveCard title="Standard Textarea" description="Multi-line text field">
            <StateDemo label="Default" note="Empty state">
              <Textarea placeholder="Enter a detailed description..." rows={4} />
            </StateDemo>

            <StateDemo label="With Content" note="Contains text">
              <Textarea
                rows={4}
                defaultValue="This is a sample description that demonstrates the textarea component with content."
              />
            </StateDemo>

            <StateDemo label="Focus" note="Active textarea state">
              <Textarea
                rows={4}
                defaultValue="This textarea is focused."
                className="border-ring ring-ring/50 ring-[3px]"
              />
            </StateDemo>
          </PrimitiveCard>

          <PrimitiveCard title="Textarea States" description="Different states">
            <StateDemo label="Disabled" note="Cannot be edited">
              <Textarea
                disabled
                rows={4}
                value="This textarea is disabled and cannot be edited."
              />
            </StateDemo>

            <StateDemo label="Read-only" note="Content locked">
              <Textarea
                readOnly
                rows={4}
                value="This textarea is read-only."
                className="bg-muted/50"
              />
            </StateDemo>
          </PrimitiveCard>
        </PrimitiveGrid>
      </ShowcaseSection>

      {/* ========== ADDITIONAL FORM COMPONENTS ========== */}
      <ShowcaseSection
        title="Additional form components"
        description="Form components with consistent styling and behavior."
      >
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
        
        {/* ========== SWITCH ========== */}
        <FormShowcaseSection
          title="Switch / Toggle"
          description="Binary on/off toggle for settings and preferences."
        >
          <PrimitiveCard title="Toggle Switch" description="On/off switch states">
            <StateDemo label="Off" note="Default unchecked state">
              <div className="flex items-center gap-3">
                <Switch id="switch-1" />
                <Label htmlFor="switch-1" className="text-sm font-normal">Enable feature</Label>
              </div>
            </StateDemo>

            <StateDemo label="On" note="Checked state">
              <div className="flex items-center gap-3">
                <Switch id="switch-2" defaultChecked />
                <Label htmlFor="switch-2" className="text-sm font-normal">Enable feature</Label>
              </div>
            </StateDemo>

            <StateDemo label="Disabled Off" note="Cannot be toggled">
              <div className="flex items-center gap-3 opacity-50">
                <Switch id="switch-3" disabled />
                <Label htmlFor="switch-3" className="text-sm font-normal">Enable feature</Label>
              </div>
            </StateDemo>

            <StateDemo label="Disabled On" note="Locked in on state">
              <div className="flex items-center gap-3 opacity-50">
                <Switch id="switch-4" disabled defaultChecked />
                <Label htmlFor="switch-4" className="text-sm font-normal">Enable feature</Label>
              </div>
            </StateDemo>
          </PrimitiveCard>
        </FormShowcaseSection>
      </div>
      </ShowcaseSection>

      {/* ========== CHECKBOX ========== */}
      <ShowcaseSection
        title="Checkbox"
        description="Boolean selection controls for single or multiple options."
      >
        <PrimitiveGrid columns={2}>
          <PrimitiveCard title="Single Checkbox" description="Individual checkbox states">
            <StateDemo label="Unchecked" note="Default state">
              <div className="flex items-center gap-3">
                <Checkbox id="cb-1" />
                <Label htmlFor="cb-1" className="text-sm font-normal">
                  Accept terms and conditions
                </Label>
              </div>
            </StateDemo>

            <StateDemo label="Checked" note="Selected state">
              <div className="flex items-center gap-3">
                <Checkbox id="cb-2" defaultChecked />
                <Label htmlFor="cb-2" className="text-sm font-normal">
                  Accept terms and conditions
                </Label>
              </div>
            </StateDemo>

            <StateDemo label="Disabled Unchecked" note="Cannot be selected">
              <div className="flex items-center gap-3 opacity-50">
                <Checkbox id="cb-3" disabled />
                <Label htmlFor="cb-3" className="text-sm font-normal">
                  Accept terms and conditions
                </Label>
              </div>
            </StateDemo>

            <StateDemo label="Disabled Checked" note="Cannot be changed">
              <div className="flex items-center gap-3 opacity-50">
                <Checkbox id="cb-4" disabled defaultChecked />
                <Label htmlFor="cb-4" className="text-sm font-normal">
                  Accept terms and conditions
                </Label>
              </div>
            </StateDemo>
          </PrimitiveCard>

          <PrimitiveCard title="Checkbox Group" description="Multiple related checkboxes">
            <StateDemo label="Default Group" note="Multiple selections allowed">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox id="notif-1" defaultChecked />
                  <Label htmlFor="notif-1" className="text-sm font-normal">Email notifications</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="notif-2" />
                  <Label htmlFor="notif-2" className="text-sm font-normal">SMS notifications</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="notif-3" defaultChecked />
                  <Label htmlFor="notif-3" className="text-sm font-normal">Push notifications</Label>
                </div>
              </div>
            </StateDemo>

            <StateDemo label="Disabled Group" note="All options locked">
              <div className="space-y-3 opacity-50">
                <div className="flex items-center gap-3">
                  <Checkbox id="notif-4" disabled defaultChecked />
                  <Label htmlFor="notif-4" className="text-sm font-normal">Email notifications</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="notif-5" disabled />
                  <Label htmlFor="notif-5" className="text-sm font-normal">SMS notifications</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="notif-6" disabled defaultChecked />
                  <Label htmlFor="notif-6" className="text-sm font-normal">Push notifications</Label>
                </div>
              </div>
            </StateDemo>
          </PrimitiveCard>
        </PrimitiveGrid>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default FormBasicsShowcasePage;
