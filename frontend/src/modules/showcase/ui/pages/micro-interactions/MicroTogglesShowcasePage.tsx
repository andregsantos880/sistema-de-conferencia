import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { cn } from '@/shadcn/lib/utils';

const MicroTogglesShowcasePage: React.FC = () => {
  const [switches, setSwitches] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
    marketing: false,
  });

  const [checkboxes, setCheckboxes] = useState({
    terms: false,
    newsletter: true,
    updates: false,
  });

  const [selectAll, setSelectAll] = useState(false);
  const [items, setItems] = useState([
    { id: 1, label: 'Item 1', checked: false },
    { id: 2, label: 'Item 2', checked: false },
    { id: 3, label: 'Item 3', checked: false },
  ]);

  const handleSwitchChange = (key: keyof typeof switches) => {
    setSwitches((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheckboxChange = (key: keyof typeof checkboxes) => {
    setCheckboxes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setItems((prev) => prev.map((item) => ({ ...item, checked })));
  };

  const handleItemCheck = (id: number, checked: boolean) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked } : item)));
    const allChecked = items.every((item) => (item.id === id ? checked : item.checked));
    setSelectAll(allChecked);
  };

  return (
    <ShowcasePage
      title="Toggles & Switches"
      description="Demonstrate smooth toggle and switch interactions with clear state feedback."
    >
      <ShowcaseSection
        title="Switch Transitions"
        description="Switches animate smoothly between on and off states."
      >
        <CodeExample
          id="micro-interactions"
          title="Switch Animation"
          code={`const [enabled, setEnabled] = useState(false);

<div className="flex items-center justify-between">
  <Label htmlFor="switch">Enable notifications</Label>
  <Switch
    id="switch"
    checked={enabled}
    onCheckedChange={setEnabled}
  />
</div>

// The Switch component has built-in transition animations:
// - Thumb slides smoothly
// - Background color transitions
// - Focus ring appears on keyboard focus`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Switch Controls</CardTitle>
              <p className="text-sm text-muted-foreground">Toggle switches to see smooth transitions</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="notifications" className="font-medium">Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive push notifications</p>
                </div>
                <Switch
                  id="notifications"
                  checked={switches.notifications}
                  onCheckedChange={() => handleSwitchChange('notifications')}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="darkMode" className="font-medium">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Use dark theme</p>
                </div>
                <Switch
                  id="darkMode"
                  checked={switches.darkMode}
                  onCheckedChange={() => handleSwitchChange('darkMode')}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="autoSave" className="font-medium">Auto-save</Label>
                  <p className="text-xs text-muted-foreground">Automatically save changes</p>
                </div>
                <Switch
                  id="autoSave"
                  checked={switches.autoSave}
                  onCheckedChange={() => handleSwitchChange('autoSave')}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                <div>
                  <Label htmlFor="marketing" className="font-medium">Marketing emails</Label>
                  <p className="text-xs text-muted-foreground">Disabled option</p>
                </div>
                <Switch
                  id="marketing"
                  checked={switches.marketing}
                  onCheckedChange={() => handleSwitchChange('marketing')}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Checkbox Feedback"
        description="Checkboxes provide immediate visual feedback with check animation."
      >
        <CodeExample
          id="micro-interactions"
          title="Checkbox Animation"
          code={`const [checked, setChecked] = useState(false);

<div className="flex items-center space-x-2">
  <Checkbox
    id="terms"
    checked={checked}
    onCheckedChange={setChecked}
  />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>

// Checkbox has built-in animations:
// - Check mark appears with scale animation
// - Background color transitions
// - Focus ring on keyboard navigation`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Checkbox Controls</CardTitle>
              <p className="text-sm text-muted-foreground">Click checkboxes to see check animation</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="terms"
                  checked={checkboxes.terms}
                  onCheckedChange={() => handleCheckboxChange('terms')}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor="terms" className="font-medium cursor-pointer">
                    Accept terms and conditions
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    You agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="newsletter"
                  checked={checkboxes.newsletter}
                  onCheckedChange={() => handleCheckboxChange('newsletter')}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor="newsletter" className="font-medium cursor-pointer">
                    Subscribe to newsletter
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get weekly updates and tips
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg opacity-50">
                <Checkbox
                  id="updates"
                  checked={checkboxes.updates}
                  onCheckedChange={() => handleCheckboxChange('updates')}
                  className="mt-0.5"
                  disabled
                />
                <div>
                  <Label htmlFor="updates" className="font-medium cursor-pointer">
                    Automatic updates
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Disabled option
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Select All Pattern"
        description="Parent checkbox controls all children with indeterminate state support."
      >
        <CodeExample
          id="micro-interactions"
          title="Select All with Indeterminate"
          code={`const [selectAll, setSelectAll] = useState(false);
const [items, setItems] = useState([
  { id: 1, label: 'Item 1', checked: false },
  { id: 2, label: 'Item 2', checked: false },
]);

const someChecked = items.some(i => i.checked);
const allChecked = items.every(i => i.checked);

<Checkbox
  checked={allChecked}
  // indeterminate state when some but not all are checked
  data-state={someChecked && !allChecked ? "indeterminate" : undefined}
  onCheckedChange={(checked) => {
    setSelectAll(checked);
    setItems(prev => prev.map(i => ({ ...i, checked })));
  }}
/>

{items.map(item => (
  <Checkbox
    key={item.id}
    checked={item.checked}
    onCheckedChange={(checked) => handleItemCheck(item.id, checked)}
  />
))}`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Select All Pattern</CardTitle>
              <p className="text-sm text-muted-foreground">Toggle parent to select/deselect all children</p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <div className="flex items-center space-x-3 p-3 border-b bg-muted/50">
                  <Checkbox
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                  <Label htmlFor="select-all" className="font-medium cursor-pointer">
                    Select All
                  </Label>
                </div>
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.checked}
                        onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                      />
                      <Label htmlFor={`item-${item.id}`} className="cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Toggle Button Group"
        description="Button-style toggles with smooth state transitions."
      >
        <CodeExample
          id="micro-interactions"
          title="Toggle Button Group"
          code={`const [selected, setSelected] = useState('option1');

<div className="flex border rounded-lg p-1">
  {options.map(option => (
    <button
      key={option.id}
      onClick={() => setSelected(option.id)}
      className={cn(
        "px-4 py-2 rounded-md transition-all duration-150",
        selected === option.id
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      )}
    >
      {option.label}
    </button>
  ))}
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Toggle Button Group</CardTitle>
              <p className="text-sm text-muted-foreground">Click options to see smooth selection transition</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleButtonGroup
                options={[
                  { id: 'daily', label: 'Daily' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                ]}
              />

              <ToggleButtonGroup
                options={[
                  { id: 'list', label: 'List' },
                  { id: 'grid', label: 'Grid' },
                ]}
              />
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

interface ToggleButtonGroupProps {
  options: { id: string; label: string }[];
}

const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({ options }) => {
  const [selected, setSelected] = useState(options[0].id);

  return (
    <div className="inline-flex border rounded-lg p-1 bg-muted/30">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => setSelected(option.id)}
          className={cn(
            "px-4 py-1.5 text-sm rounded-md transition-all duration-150",
            selected === option.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default MicroTogglesShowcasePage;
