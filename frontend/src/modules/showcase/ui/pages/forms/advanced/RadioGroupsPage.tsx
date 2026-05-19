import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { DeliveryMethodDemo, PaymentMethodDemo, CustomRenderDemo } from '../demos/RadioGroupDemos';

const RadioGroupsPage: React.FC = () => {
  return (
    <ShowcasePage
      title="Radio Groups"
      description="Advanced radio group patterns including cards, lists, and custom layouts."
    >
      <ShowcaseSection
        title="Radio Group Variants"
        description="Decision groups with interactive playground. Test different layouts and alignments."
        className="grid grid-cols-1 gap-6"
      >
        <CodeExample
          id="field-radio-delivery"
          title="Delivery Method (Playground)"
          description="Interactive demo for delivery options."
          code={`<FieldRadioGroup 
  label="Delivery Method"
  variant={variant}
  alignment={alignment}
  options={[
    { 
      value: 'standard', 
      title: 'Standard', 
      description: '4-10 business days',
      secondary: '$5.00',
      media: <Truck />
    },
    ...
  ]}
  value={value}
  onChange={setValue}
/>`}
        >
          <DeliveryMethodDemo />
        </CodeExample>

        <CodeExample
          id="field-radio-payment"
          title="Payment Method (Playground)"
          description="Interactive demo for payment selection."
          code={`<FieldRadioGroup 
  label="Payment Method"
  variant={variant}
  alignment="end"
  mediaPosition="end"
  options={[
    { 
      value: 'visa', 
      title: '•••• 1234', 
      media: <VisaLogo /> 
    },
    ...
  ]}
  value={value}
  onChange={setValue}
/>`}
        >
          <PaymentMethodDemo />
        </CodeExample>

        <CodeExample
          id="field-radio-custom"
          title="Custom Render"
          description="Completely custom option rendering using renderOption prop."
          code={`<FieldRadioGroup 
  label="Invite Team Member"
  variant="card"
  options={[{ value: 'admin', ... }]}
  renderOption={(option, { checked }) => (
    <div className={checked ? 'border-primary' : 'border-muted'}>
      {/* Custom content */}
      <Icon /> {option.title}
    </div>
  )}
  value={role}
  onChange={setRole}
/>`}
        >
          <CustomRenderDemo />
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default RadioGroupsPage;
