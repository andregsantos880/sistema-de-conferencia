import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import FieldMaskedInput from '@/components/forms/composites/field/FieldMaskedInput';
import { MASK_PRESETS } from '@/components/forms/core/maskPresets';
import { Phone, Search, DollarSign, CreditCard, Percent, Network, Building } from 'lucide-react';

const DemoMaskedInput = (props: React.ComponentProps<typeof FieldMaskedInput>) => {
  const [val, setVal] = useState<string>('');

  return (
    <div>
      <FieldMaskedInput 
        {...props} 
        value={val}
        onChange={(v) => {
            setVal(v);
            props.onChange?.(v);
        }} 
      />
      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-2 flex items-center">
        Raw Value: 
        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground normal-case text-xs">
          {val || <span className="opacity-50">Empty</span>}
        </span>
      </div>
    </div>
  );
};

const MaskedFieldsPage: React.FC = () => {
  return (
    <ShowcasePage
      title="Masked Fields"
      description="Input masking for structured data entry like phones, credit cards, and specialized formats."
    >
      <ShowcaseSection
        title="Masked Inputs"
        description="Masked inputs with label, description, and status support."
        className="grid gap-6 lg:grid-cols-2"
      >
        <CodeExample
          id="field-masked-input"
          title="FieldMaskedInput"
          description="Masked input with presets from maskPresets.ts."
          spotlight="teal"
          code={`<FieldMaskedInput 
  label="Description"
  placeholder="Type a message..."
  description="Max 500 characters"
  mask={MASK_PRESETS.PHONE_US}
/>`}
        >
          <div className="space-y-4">
            <DemoMaskedInput 
              label="Phone Number"
              placeholder="Enter your phone number"
              icon={<Phone className="h-4 w-4" />} 
              mask={MASK_PRESETS.PHONE_US}
              name="phone"
            />

            <DemoMaskedInput 
              label="Zip Code"
              placeholder="Enter your zip code"
              icon={<Search className="h-4 w-4" />} 
              mask={MASK_PRESETS.ZIP_CODE}
              name="zip"
            />

            <DemoMaskedInput 
              label="Currency"
              placeholder="Enter your currency"
              icon={<DollarSign className="h-4 w-4" />} 
              mask={MASK_PRESETS.CURRENCY_USD}
              name="currency"
            />

            <DemoMaskedInput 
              label="Credit Card"
              placeholder="Enter your credit card"
              icon={<CreditCard className="h-4 w-4" />} 
              mask={MASK_PRESETS.CREDIT_CARD}
              name="credit-card"
            />

            <DemoMaskedInput 
              label="Percentage"
              placeholder="Enter your percentage"
              icon={<Percent className="h-4 w-4" />} 
              mask={MASK_PRESETS.PERCENTAGE}
              name="percentage"
            />
          </div>
        </CodeExample>

        <CodeExample
          id="field-masked-input-custom"
          title="Custom Masks"
          description="Masked input with custom mask definitions."
          spotlight="teal"
          code={`<FieldMaskedInput 
  label="Custom Mask"
  mask={{
    mask: '000-000000-0000X',
    lazy: false,
  }}
/>`}
        >
          <div className="space-y-4">
            <DemoMaskedInput 
                label="Custom Mask"
                placeholder="Enter your value"
                mask={{
                mask: '000-000000-0000X',
                lazy: false,
                definitions: {
                    'X': {
                    mask: 'a',
                    prepareChar: (str: string) => str.toUpperCase(),
                    }
                }
                }}
                name="custom-mask"
            />

            <DemoMaskedInput 
                label="Custom Pattern"
                placeholder="Enter your value"
                mask={{
                mask: '{#}000[aaa]/NIC-`*[**]',
                lazy: false,
                }}
                name="custom-mask-2"
            />
            
            <DemoMaskedInput 
                label="IP Address"
                placeholder="Enter your IP Address"
                mask={MASK_PRESETS.IP_ADDRESS}
                icon={<Network className="h-4 w-4" />} 
                unmask={false}
                name="ip-address"
            />

            <DemoMaskedInput 
                label="MAC Address"
                placeholder="Enter your MAC Address"
                mask={MASK_PRESETS.MAC_ADDRESS}
                unmask={false}
                name="mac-address"
            />

            <DemoMaskedInput 
                label="IBAN"
                placeholder="Enter your IBAN"
                icon={<Building className="h-4 w-4" />} 
                mask={MASK_PRESETS.IBAN}
                name="iban"
            />
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default MaskedFieldsPage;
