import React, { useMemo, useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import { Wizard, type WizardStep, type WizardValidationResult } from '@/components/wizard';
import { Card, CardContent } from '@/shared/ui/shadcn/components/ui/card';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import { AlertCircle, CheckCircle2, CreditCard, Building2, User, PlugZap, MapPin, Lock, Mail, Briefcase } from 'lucide-react';
import { MASK_PRESETS } from '@/components/forms/core/maskPresets';
import FieldMaskedInput from '@/components/forms/composites/field/FieldMaskedInput';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ErrorMessages({ errors }: { errors: WizardValidationResult | null }) {
  if (!errors || errors.ok) return null;
  if (!errors.errors?.length) return null;

  return (
    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
        <div className="space-y-1">
          {errors.errors.map((error, i) => (
            <p key={i} className="text-sm text-destructive">
              {error}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 1. PREVIEW / VARIANT STEPS (5 Steps, Placeholder) ---
const variantSteps: WizardStep<any>[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `step-${i + 1}`,
  title: `Step ${i + 1}`,
  description: i === 0 ? 'Start' : i === 4 ? 'Finish' : `Step ${i + 1}`,
  icon: <User className="h-5 w-5" />,
  render: () => (
    <div className="h-32 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center text-muted-foreground bg-muted/5">
      <span className="text-lg font-medium">Step {i + 1} Placeholder</span>
    </div>
  ),
}));

// --- 2. BASIC WIZARD (Personal & Contact Info) ---
type BasicValues = {
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
};

const initialBasicValues: BasicValues = {
  firstName: '',
  lastName: '',
  role: '',
  department: '',
  email: '',
  phone: '',
  website: '',
  linkedin: '',
};

function getBasicSteps(): WizardStep<BasicValues>[] {
  return [
    {
      id: 'personal',
      title: 'Personal',
      description: 'Profile info',
      icon: <User className="h-5 w-5" />,
      canExit: (values) => {
        const errors: string[] = [];
        if (!values.firstName.trim()) errors.push('First name is required');
        if (!values.lastName.trim()) errors.push('Last name is required');
        if (!values.role.trim()) errors.push('Role is required');
        return errors.length ? { ok: false, errors } : { ok: true };
      },
      render: ({ values, setValues, errors }) => (
        <div className="space-y-4">
          <ErrorMessages errors={errors} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basic-fname">First Name</Label>
              <Input id="basic-fname" value={values.firstName} onChange={(e) => setValues({ firstName: e.target.value })} placeholder="Jane" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basic-lname">Last Name</Label>
              <Input id="basic-lname" value={values.lastName} onChange={(e) => setValues({ lastName: e.target.value })} placeholder="Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basic-role">Role / Job Title</Label>
              <Input id="basic-role" value={values.role} onChange={(e) => setValues({ role: e.target.value })} placeholder="Software Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basic-dept">Department</Label>
              <Input id="basic-dept" value={values.department} onChange={(e) => setValues({ department: e.target.value })} placeholder="Engineering" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'contact',
      title: 'Contact',
      description: 'Details',
      icon: <Mail className="h-5 w-5" />,
      canExit: (values) => {
        const errors: string[] = [];
        if (!values.email.includes('@')) errors.push('Valid email is required');
        if (!values.phone.trim()) errors.push('Phone number is required');
        return errors.length ? { ok: false, errors } : { ok: true };
      },
      render: ({ values, setValues, errors }) => (
        <div className="space-y-4">
          <ErrorMessages errors={errors} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basic-email">Email Address</Label>
              <Input id="basic-email" value={values.email} onChange={(e) => setValues({ email: e.target.value })} placeholder="jane@example.com" />
            </div>
            <FieldMaskedInput
              id="basic-phone"
              name="phone"
              label="Phone Number"
              value={values.phone}
              onChange={(val) => setValues({ phone: val })}
              placeholder="(555) 000-0000"
              mask={MASK_PRESETS.PHONE_US}
            />
            <div className="space-y-2">
              <Label htmlFor="basic-web">Website (Optional)</Label>
              <Input id="basic-web" value={values.website} onChange={(e) => setValues({ website: e.target.value })} placeholder="https://" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basic-li">LinkedIn (Optional)</Label>
              <Input id="basic-li" value={values.linkedin} onChange={(e) => setValues({ linkedin: e.target.value })} placeholder="in/janedoe" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Finish',
      icon: <CheckCircle2 className="h-5 w-5" />,
      render: ({ values }) => (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">Review your information</div>
          <div className="p-4 bg-muted/40 rounded-lg text-sm grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground block text-xs">Name</span>
              <span className="font-medium">{values.firstName} {values.lastName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Role</span>
              <span className="font-medium">{values.role} - {values.department}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Email</span>
              <span className="font-medium">{values.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Phone</span>
              <span className="font-medium">{values.phone}</span>
            </div>
          </div>
        </div>
      ),
    },
  ];
}

// --- 3. ONBOARDING (Optional Steps) ---
type OnboardingValues = {
  // Step 1
  enableIntegrations: boolean;
  theme: string;
  language: string;
  notifications: boolean;
  // Step 2
  slack: boolean;
  jira: boolean;
  github: boolean;
  notion: boolean;
  // Step 3
  goal: string;
  timeline: string;
  budget: string;
  teamSize: string;
};

const initialOnboardingValues: OnboardingValues = {
  enableIntegrations: true,
  theme: 'system',
  language: 'en',
  notifications: true,
  slack: false,
  jira: false,
  github: false,
  notion: false,
  goal: '',
  timeline: '',
  budget: '',
  teamSize: '',
};

const onboardingSteps: WizardStep<OnboardingValues>[] = [
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Setup',
    icon: <User className="h-5 w-5" />,
    render: ({ values, setValues }) => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label>Theme Preference</Label>
             <Select value={values.theme} onValueChange={(v) => setValues({ theme: v })}>
               <SelectTrigger><SelectValue /></SelectTrigger>
               <SelectContent>
                 <SelectItem value="light">Light</SelectItem>
                 <SelectItem value="dark">Dark</SelectItem>
                 <SelectItem value="system">System</SelectItem>
               </SelectContent>
             </Select>
           </div>
           <div className="space-y-2">
             <Label>Language</Label>
             <Select value={values.language} onValueChange={(v) => setValues({ language: v })}>
               <SelectTrigger><SelectValue /></SelectTrigger>
               <SelectContent>
                 <SelectItem value="en">English</SelectItem>
                 <SelectItem value="es">Spanish</SelectItem>
                 <SelectItem value="fr">French</SelectItem>
               </SelectContent>
             </Select>
           </div>
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-0.5">
            <div className="font-medium">Enable Integrations Step</div>
            <div className="text-xs text-muted-foreground">Show/hide next step</div>
          </div>
          <Switch checked={values.enableIntegrations} onCheckedChange={(checked) => setValues({ enableIntegrations: checked })} />
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-0.5">
            <div className="font-medium">Enable Notifications</div>
            <div className="text-xs text-muted-foreground">Receive email updates</div>
          </div>
          <Switch checked={values.notifications} onCheckedChange={(checked) => setValues({ notifications: checked })} />
        </div>
      </div>
    ),
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Optional',
    icon: <PlugZap className="h-5 w-5" />,
    optional: true,
    isVisible: (values) => values.enableIntegrations,
    render: ({ values, setValues }) => (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg flex items-center justify-between">
            <span className="font-medium text-sm">Slack</span>
            <Switch checked={values.slack} onCheckedChange={(c) => setValues({ slack: c })} />
          </div>
          <div className="p-3 border rounded-lg flex items-center justify-between">
            <span className="font-medium text-sm">Jira</span>
            <Switch checked={values.jira} onCheckedChange={(c) => setValues({ jira: c })} />
          </div>
          <div className="p-3 border rounded-lg flex items-center justify-between">
            <span className="font-medium text-sm">GitHub</span>
            <Switch checked={values.github} onCheckedChange={(c) => setValues({ github: c })} />
          </div>
          <div className="p-3 border rounded-lg flex items-center justify-between">
            <span className="font-medium text-sm">Notion</span>
            <Switch checked={values.notion} onCheckedChange={(c) => setValues({ notion: c })} />
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">Toggle services to connect. You can skip this step.</div>
      </div>
    ),
  },
  {
    id: 'goals',
    title: 'Goals',
    description: 'Required',
    icon: <CheckCircle2 className="h-5 w-5" />,
    canExit: (values) => {
      const errs: string[] = [];
      if (!values.goal.trim()) errs.push('Primary goal is required');
      if (!values.timeline) errs.push('Timeline is required');
      return errs.length ? { ok: false, errors: errs } : { ok: true };
    },
    render: ({ values, setValues, errors }) => (
      <div className="space-y-4">
        <ErrorMessages errors={errors} />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>Primary Goal</Label>
            <Input value={values.goal} onChange={(e) => setValues({ goal: e.target.value })} placeholder="e.g. Launch Marketing Campaign" />
          </div>
          <div className="space-y-2">
            <Label>Timeline</Label>
            <Select value={values.timeline} onValueChange={(v) => setValues({ timeline: v })}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Budget (Optional)</Label>
            <Input value={values.budget} onChange={(e) => setValues({ budget: e.target.value })} placeholder="$5,000" />
          </div>
        </div>
      </div>
    ),
  },
];

// --- 4. ORGANIZATION (Branching) ---
type OrgValues = {
  orgType: 'personal' | 'company';
  region: string;
  // Personal
  pName: string;
  pHandle: string;
  pBio: string;
  pWebsite: string;
  // Company
  cName: string;
  cIndustry: string;
  cSize: string;
  cTaxId: string;
};

const initialOrgValues: OrgValues = {
  orgType: 'personal',
  region: 'us',
  pName: '',
  pHandle: '',
  pBio: '',
  pWebsite: '',
  cName: '',
  cIndustry: '',
  cSize: '',
  cTaxId: '',
};

const orgSteps: WizardStep<OrgValues>[] = [
  {
    id: 'type',
    title: 'Type',
    description: 'Selection',
    icon: <Building2 className="h-5 w-5" />,
    next: (values) => (values.orgType === 'company' ? 'company-details' : 'personal-details'),
    render: ({ values, setValues }) => (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Organization Type</Label>
          <Select value={values.orgType} onValueChange={(v) => setValues({ orgType: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal Project</SelectItem>
              <SelectItem value="company">Company / Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">Changes next step</p>
        </div>
        <div className="space-y-2">
          <Label>Region</Label>
          <Select value={values.region} onValueChange={(v) => setValues({ region: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="eu">Europe</SelectItem>
              <SelectItem value="asia">Asia Pacific</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    ),
  },
  {
    id: 'personal-details',
    title: 'Profile',
    description: 'Personal',
    icon: <User className="h-5 w-5" />,
    isVisible: (values) => values.orgType === 'personal',
    canExit: (values) => (!values.pName || !values.pHandle ? { ok: false, errors: ['Name and Handle required'] } : { ok: true }),
    render: ({ values, setValues, errors }) => (
      <div className="space-y-4">
        <ErrorMessages errors={errors} />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={values.pName} onChange={(e) => setValues({ pName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Handle</Label>
            <Input value={values.pHandle} onChange={(e) => setValues({ pHandle: e.target.value })} prefix="@" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Bio</Label>
            <Input value={values.pBio} onChange={(e) => setValues({ pBio: e.target.value })} placeholder="Tell us about yourself..." />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'company-details',
    title: 'Company',
    description: 'Business',
    icon: <Briefcase className="h-5 w-5" />,
    isVisible: (values) => values.orgType === 'company',
    canExit: (values) => (!values.cName || !values.cIndustry ? { ok: false, errors: ['Company Name & Industry required'] } : { ok: true }),
    render: ({ values, setValues, errors }) => (
      <div className="space-y-4">
        <ErrorMessages errors={errors} />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={values.cName} onChange={(e) => setValues({ cName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Input value={values.cIndustry} onChange={(e) => setValues({ cIndustry: e.target.value })} placeholder="e.g. Fintech" />
          </div>
          <div className="space-y-2">
            <Label>Company Size</Label>
            <Select value={values.cSize} onValueChange={(v) => setValues({ cSize: v })}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="50+">50+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label>Tax ID (Optional)</Label>
            <Input value={values.cTaxId} onChange={(e) => setValues({ cTaxId: e.target.value })} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'done',
    title: 'Complete',
    description: 'Review',
    icon: <CheckCircle2 className="h-5 w-5" />,
    render: ({ values }) => (
      <div className="p-4 bg-muted/40 rounded-lg text-sm space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <span className="text-muted-foreground">Type</span>
          <span className="font-medium capitalize">{values.orgType}</span>
          <span className="text-muted-foreground">Region</span>
          <span className="font-medium uppercase">{values.region}</span>
        </div>
        <div className="border-t pt-2 mt-2">
           {values.orgType === 'personal' ? (
             <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{values.pName}</span>
                <span className="text-muted-foreground">Handle</span>
                <span className="font-medium">{values.pHandle}</span>
             </div>
           ) : (
             <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Company</span>
                <span className="font-medium">{values.cName}</span>
                <span className="text-muted-foreground">Industry</span>
                <span className="font-medium">{values.cIndustry}</span>
             </div>
           )}
        </div>
      </div>
    ),
  },
];

// --- 5. CHECKOUT (Async Validation) ---
type CheckoutValues = {
  address: string;
  city: string;
  state: string;
  zip: string;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
};

const initialCheckoutValues: CheckoutValues = {
  address: '',
  city: '',
  state: '',
  zip: '',
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
};

const checkoutSteps: WizardStep<CheckoutValues>[] = [
  {
    id: 'shipping',
    title: 'Shipping',
    description: 'Async Check',
    icon: <MapPin className="h-5 w-5" />,
    canExit: async (values) => {
      await sleep(250);
      if (!values.address || !values.city || !values.zip) return { ok: false, errors: ['All address fields are required'] };
      return { ok: true };
    },
    render: ({ values, setValues, errors }) => (
      <div className="space-y-4">
        <ErrorMessages errors={errors} />
        <div className="space-y-2">
           <Label>Street Address</Label>
           <Input value={values.address} onChange={(e) => setValues({ address: e.target.value })} placeholder="123 Main St" />
        </div>
        <div className="grid grid-cols-3 gap-4">
           <div className="space-y-2 col-span-1">
             <Label>City</Label>
             <Input value={values.city} onChange={(e) => setValues({ city: e.target.value })} />
           </div>
           <div className="space-y-2 col-span-1">
             <Label>State</Label>
             <Input value={values.state} onChange={(e) => setValues({ state: e.target.value })} />
           </div>
           <div className="space-y-2 col-span-1">
             <Label>Zip</Label>
             <Input value={values.zip} onChange={(e) => setValues({ zip: e.target.value })} />
           </div>
        </div>
      </div>
    ),
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Processing',
    icon: <CreditCard className="h-5 w-5" />,
    canExit: async (values) => {
      await sleep(400);
      if (!values.cardNumber || !values.cvc) return { ok: false, errors: ['Card details incomplete'] };
      if (values.cardNumber.startsWith('4000')) return { ok: false, errors: ['Test card declined (4000...)'] };
      return { ok: true };
    },
    render: ({ values, setValues, errors }) => (
      <div className="space-y-4">
        <ErrorMessages errors={errors} />
        <div className="space-y-2">
          <Label>Name on Card</Label>
          <Input value={values.cardName} onChange={(e) => setValues({ cardName: e.target.value })} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label>Card Number</Label>
          <Input value={values.cardNumber} onChange={(e) => setValues({ cardNumber: e.target.value })} placeholder="4242..." />
          <p className="text-[10px] text-muted-foreground">Start with 4000 to fail.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Expiry (MM/YY)</Label>
            <Input value={values.expiry} onChange={(e) => setValues({ expiry: e.target.value })} placeholder="12/26" />
          </div>
          <div className="space-y-2">
            <Label>CVC</Label>
            <Input value={values.cvc} onChange={(e) => setValues({ cvc: e.target.value })} placeholder="123" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'confirm',
    title: 'Confirm',
    description: 'Done',
    icon: <CheckCircle2 className="h-5 w-5" />,
    render: ({ values }) => (
      <div className="p-4 bg-muted/40 rounded-lg text-sm grid grid-cols-2 gap-2">
        <span className="text-muted-foreground">Ship To</span>
        <span className="font-medium">{values.address}, {values.city}</span>
        <span className="text-muted-foreground">Card</span>
        <span className="font-medium">•••• {values.cardNumber.slice(-4) || 'xxxx'}</span>
      </div>
    ),
  },
];

// --- 6. ACCOUNT (Async Field Validation) ---
type AccountValues = { username: string; email: string; password: string; confirmPass: string };
const initialAccountValues: AccountValues = { username: '', email: '', password: '', confirmPass: '' };

const accountSteps: WizardStep<AccountValues>[] = [
  {
    id: 'credentials',
    title: 'Account',
    description: 'Async',
    icon: <User className="h-5 w-5" />,
    canExit: async (values) => {
      await sleep(300);
      const errors: string[] = [];
      const fieldErrors: Record<string, string> = {};
      if (values.username === 'admin') {
        errors.push('Username taken');
        fieldErrors.username = 'Taken';
      }
      if (!values.email.includes('@')) {
        errors.push('Invalid email');
        fieldErrors.email = 'Invalid';
      }
      if (errors.length) return { ok: false, errors, fieldErrors };
      return { ok: true };
    },
    render: ({ values, setValues, errors }) => {
      const fieldErrors = errors && !errors.ok ? errors.fieldErrors : undefined;
      return (
      <div className="space-y-4">
        <ErrorMessages errors={errors} />
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label>Username</Label>
             <Input value={values.username} onChange={(e) => setValues({ username: e.target.value })} className={fieldErrors?.username ? 'border-destructive' : ''} />
             {fieldErrors?.username && <span className="text-xs text-destructive">{fieldErrors.username}</span>}
           </div>
           <div className="space-y-2">
             <Label>Email</Label>
             <Input value={values.email} onChange={(e) => setValues({ email: e.target.value })} className={fieldErrors?.email ? 'border-destructive' : ''} />
           </div>
        </div>
        <p className="text-xs text-muted-foreground">Try username 'admin' to see error.</p>
      </div>
      );
    },
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Password',
    icon: <Lock className="h-5 w-5" />,
    canExit: (values) => {
       if (values.password.length < 8) return { ok: false, errors: ['Password too short'] };
       if (values.password !== values.confirmPass) return { ok: false, errors: ['Passwords do not match'] };
       return { ok: true };
    },
    render: ({ values, setValues, errors }) => (
      <div className="space-y-4">
        <ErrorMessages errors={errors} />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={values.password} onChange={(e) => setValues({ password: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input type="password" value={values.confirmPass} onChange={(e) => setValues({ confirmPass: e.target.value })} />
          </div>
        </div>
      </div>
    ),
  },
];

const WizardShowcasePage: React.FC = () => {
  const [basicDone, setBasicDone] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [orgDone, setOrgDone] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [accountDone, setAccountDone] = useState(false);

  const basicSteps = useMemo(() => getBasicSteps(), []);

  return (
    <ShowcasePage
      title="Wizard"
      description="New Wizard component with multiple stepper variants, optional steps, branching logic, async validation, and async finish handling."
    >
      <ShowcaseSection title="Stepper variants" description="Same steps, five different visually distinct variants.">
        <div className="flex flex-col gap-8">
          <Card><CardContent className="pt-6"><Wizard steps={variantSteps} initialValues={{}} onFinish={async () => {}} headerVariant="chevron" /></CardContent></Card>
          <Card><CardContent className="pt-6"><Wizard steps={variantSteps} initialValues={{}} onFinish={async () => {}} headerVariant="radio" /></CardContent></Card>
          <Card><CardContent className="pt-6"><Wizard steps={variantSteps} initialValues={{}} onFinish={async () => {}} headerVariant="circles" /></CardContent></Card>
          <Card><CardContent className="pt-6"><Wizard steps={variantSteps} initialValues={{}} onFinish={async () => {}} headerVariant="icon-underline" /></CardContent></Card>
          <Card><CardContent className="pt-6"><Wizard steps={variantSteps} initialValues={{}} onFinish={async () => {}} headerVariant="status" /></CardContent></Card>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Basic wizard" description="Linear flow + multi-field validation + async finish.">
        <Card>
          <CardContent className="pt-6">
            {basicDone ? (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <div className="font-semibold">Completed</div>
                <Button variant="ghost" onClick={() => setBasicDone(false)}>Reset</Button>
              </div>
            ) : (
              <Wizard
                steps={basicSteps}
                initialValues={initialBasicValues}
                onFinish={async () => {
                  await sleep(500);
                  setBasicDone(true);
                }}
                headerVariant="circles"
                showCancel
                labels={{
                  'personal': "Personal Information",
                  'contact': "Contact Details"
                }}
                mobileLabels={{
                  'personal': "Info",
                  'contact': "Contact",
                  'review': "Done"
                }}
              />
            )}
          </CardContent>
        </Card>
      </ShowcaseSection>

      <ShowcaseSection title="Advanced: onboarding (optional steps)" description="Optional step + conditional visibility + skip.">
        <Card>
          <CardContent className="pt-6">
            {onboardingDone ? (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <div className="font-semibold">Completed</div>
                <Button variant="ghost" onClick={() => setOnboardingDone(false)}>Reset</Button>
              </div>
            ) : (
              <Wizard
                steps={onboardingSteps}
                initialValues={initialOnboardingValues}
                onFinish={async () => {
                  await sleep(250);
                  setOnboardingDone(true);
                }}
                headerVariant="icon-underline"
              />
            )}
          </CardContent>
        </Card>
      </ShowcaseSection>

      <ShowcaseSection title="Advanced: organization setup (branching)" description="Complex branching path based on selection.">
        <Card>
          <CardContent className="pt-6">
            {orgDone ? (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <div className="font-semibold">Completed</div>
                <Button variant="ghost" onClick={() => setOrgDone(false)}>Reset</Button>
              </div>
            ) : (
              <Wizard
                steps={orgSteps}
                initialValues={initialOrgValues}
                onFinish={async () => {
                  await sleep(250);
                  setOrgDone(true);
                }}
                headerVariant="chevron"
              />
            )}
          </CardContent>
        </Card>
      </ShowcaseSection>

      <ShowcaseSection title="Advanced: checkout (payment processing)" description="Async canExit validation + finish handling.">
        <Card>
          <CardContent className="pt-6">
            {checkoutDone ? (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <div className="font-semibold">Completed</div>
                <Button variant="ghost" onClick={() => setCheckoutDone(false)}>Reset</Button>
              </div>
            ) : (
              <Wizard
                steps={checkoutSteps}
                initialValues={initialCheckoutValues}
                onFinish={async () => {
                  await sleep(500);
                  setCheckoutDone(true);
                }}
                headerVariant="radio"
              />
            )}
          </CardContent>
        </Card>
      </ShowcaseSection>

      <ShowcaseSection title="Advanced: account creation (async validation)" description="Async canExit checks and structured errors.">
        <Card>
          <CardContent className="pt-6">
            {accountDone ? (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <div className="font-semibold">Completed</div>
                <Button variant="ghost" onClick={() => setAccountDone(false)}>Reset</Button>
              </div>
            ) : (
              <Wizard
                steps={accountSteps}
                initialValues={initialAccountValues}
                onFinish={async () => {
                  await sleep(350);
                  setAccountDone(true);
                }}
                headerVariant="status"
              />
            )}
          </CardContent>
        </Card>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default WizardShowcasePage;
