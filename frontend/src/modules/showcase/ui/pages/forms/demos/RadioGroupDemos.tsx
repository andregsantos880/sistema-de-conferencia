import { useState } from 'react';
import { FieldRadioGroup } from '@/components/forms/composites/field';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/components/ui/select';
import { Truck, Zap, Rocket, Crown, Code, Eye, CheckCircle2 } from 'lucide-react';
import visaLogo from '@/assets/visa_logo.png';
import mastercardLogo from '@/assets/mastercard_logo.png';
import amexLogo from '@/assets/amex_logo.png';

type RadioVariant = 'list' | 'card';
type Alignment = 'start' | 'end';
type ContentAlign = 'start' | 'center' | 'end';
type MediaPosition = 'start' | 'end';

interface PlaygroundState {
  variant: RadioVariant;
  alignment: Alignment;
  contentAlign: ContentAlign;
  mediaPosition: MediaPosition;
}

const Controls = ({ state, onChange }: { state: PlaygroundState, onChange: (s: PlaygroundState) => void }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg border">
    <div className="space-y-2">
      <Label>Variant</Label>
      <Select value={state.variant} onValueChange={(v) => onChange({ ...state, variant: v as RadioVariant })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="list">List</SelectItem>
          <SelectItem value="card">Card</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Radio Align</Label>
      <Select value={state.alignment} onValueChange={(v) => onChange({ ...state, alignment: v as Alignment })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="start">Start</SelectItem>
          <SelectItem value="end">End</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Content Align</Label>
      <Select value={state.contentAlign} onValueChange={(v) => onChange({ ...state, contentAlign: v as ContentAlign })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="start">Start</SelectItem>
          <SelectItem value="center">Center</SelectItem>
          <SelectItem value="end">End</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Media Pos</Label>
      <Select value={state.mediaPosition} onValueChange={(v) => onChange({ ...state, mediaPosition: v as MediaPosition })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="start">Start</SelectItem>
          <SelectItem value="end">End</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

export const DeliveryMethodDemo = () => {
  const [method, setMethod] = useState('standard');
  const [config, setConfig] = useState<PlaygroundState>({
    variant: 'card',
    alignment: 'start',
    contentAlign: 'start',
    mediaPosition: 'end',
  });

  return (
    <div className="space-y-6">
      <Controls state={config} onChange={setConfig} />
      
      <div className="p-6 border rounded-xl bg-background/50">
        <FieldRadioGroup 
          id="demo-delivery"
          label="Delivery Method"
          value={method}
          onChange={setMethod}
          variant={config.variant}
          alignment={config.alignment}
          contentAlign={config.contentAlign}
          mediaPosition={config.mediaPosition}
          options={[
            { 
              value: 'standard', 
              title: 'Standard', 
              description: '4-10 business days',
              secondary: <span className="font-bold text-foreground">$5.00</span>,
              media: <Truck className="h-8 w-8 text-muted-foreground" />
            },
            { 
              value: 'express', 
              title: 'Express', 
              description: '2-5 business days',
              secondary: <span className="font-bold text-foreground">$16.00</span>,
              media: <Zap className="h-8 w-8 text-amber-500" />
            },
            { 
              value: 'super', 
              title: 'Super Fast', 
              description: '1 business day',
              secondary: <span className="font-bold text-foreground">$25.00</span>,
              media: <Rocket className="h-8 w-8 text-primary" />
            },
          ]}
        />
      </div>
    </div>
  );
};

export const PaymentMethodDemo = () => {
    const [card, setCard] = useState('visa');
    const [config, setConfig] = useState<PlaygroundState>({
      variant: 'card',
      alignment: 'end',
      contentAlign: 'center',
      mediaPosition: 'start',
    });

    return (
        <div className="space-y-6">
          <Controls state={config} onChange={setConfig} />

          <div className="p-6 border rounded-xl bg-background/50">
            <FieldRadioGroup
                id="demo-payment"
                label="Payment Method"
                value={card}
                onChange={setCard}
                variant={config.variant}
                alignment={config.alignment}
                contentAlign={config.contentAlign}
                mediaPosition={config.mediaPosition}
                options={[
                    { 
                      value: 'visa', 
                      title: '•••• 1234', 
                      description: 'Expires 12/28', 
                      secondary: <span className="text-xs">Last used: Yesterday</span>,
                      media: <img src={visaLogo} alt="Visa" className="h-12 w-auto rounded-md object-contain" /> 
                    },
                    { 
                        value: 'mastercard', 
                        title: '•••• 5678', 
                        description: 'Expires 10/29', 
                        secondary: <span className="text-xs">Never used</span>,
                        media: <img src={mastercardLogo} alt="Mastercard" className="h-12 w-auto rounded-md object-contain" /> 
                    },
                    { 
                        value: 'amex', 
                        title: '•••• 9012', 
                        description: 'Expires 01/27',
                        secondary: <span className="text-xs">Last used: 2 days ago</span>, 
                        media: <img src={amexLogo} alt="Amex" className="h-12 w-auto rounded-md object-contain" /> 
                    },
                ]}
            />
          </div>
        </div>
    )
}

// Scoped internal component for custom rendering
const TeamRoleOption = ({ option, state }: { option: any, state: { checked: boolean, disabled: boolean } }) => {
  const { checked } = state;
  const isRecommended = option.value === 'dev';

  return (
    <div className={`
      relative flex flex-col gap-3 p-5 rounded-xl border transition-all h-full
      ${checked 
        ? 'border-primary ring-1 ring-primary bg-primary/5' 
        : 'border-border bg-card hover:border-foreground/20 hover:shadow-sm'
      }
    `}>
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-wider rounded-full shadow-sm">
          Recommended
        </div>
      )}

      <div className="flex items-start justify-between">
          {/* Custom Icon Box */}
        <div className={`
          p-2.5 rounded-lg shrink-0 transition-colors
          ${checked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
        `}>
          {option.value === 'admin' && <Crown className="h-5 w-5" />}
          {option.value === 'dev' && <Code className="h-5 w-5" />}
          {option.value === 'viewer' && <Eye className="h-5 w-5" />}
        </div>
        
        {checked ? (
            <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in spin-in-90 duration-300" />
        ) : (
            <div className="h-5 w-5 rounded-full border-2 border-muted" />
        )}
      </div>

      <div className="space-y-1">
        <h4 className={`font-bold text-base ${checked ? 'text-primary' : 'text-foreground'}`}>
          {option.title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed h-10">
          {option.description}
        </p>

        {/* Conditional Tag based on role */}
        {option.value === 'admin' && (
          <div className="text-[10px] text-destructive font-medium flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            Restricted access
          </div>
        )}
      </div>

      {/* Feature List (Micro) */}
      <div className="pt-3 mt-auto border-t border-border/50 space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Includes:</p>
          <ul className="text-xs space-y-1 text-foreground/80">
            {option.value === 'admin' && (
              <>
                <li className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-primary" /> User Management</li>
                <li className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-primary" /> Billing & Invoices</li>
              </>
            )}
            {option.value === 'dev' && (
              <>
                <li className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-primary" /> Deployments</li>
                <li className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-primary" /> Environment Vars</li>
              </>
            )}
            {option.value === 'viewer' && (
              <>
                <li className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-primary" /> View Analytics</li>
                <li className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-primary" /> Download Reports</li>
              </>
            )}
          </ul>
      </div>
    </div>
  );
};

export const CustomRenderDemo = () => {
  const [role, setRole] = useState('dev');

  return (
    <div className="p-6 border rounded-xl bg-background/50">
      <FieldRadioGroup
        id="demo-custom"
        label="Invite Team Member"
        description="Select an access level for the new user."
        value={role}
        onChange={setRole}
        variant="card" // Use card to get grid layout
        options={[
          { 
            value: 'admin', 
            title: 'Administrator', 
            description: 'Full access to settings, billing, and user management.' 
          },
          { 
            value: 'dev', 
            title: 'Developer', 
            description: 'Can deploy, manage API keys, and view logs.' 
          },
          { 
            value: 'viewer', 
            title: 'Viewer', 
            description: 'Read-only access to dashboards and reports.' 
          },
        ]}
        renderOption={(option, state) => (
          <TeamRoleOption option={option} state={state} />
        )}
      />
    </div>
  );
};
