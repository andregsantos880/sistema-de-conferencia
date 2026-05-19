import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import FieldPassword from '@/shared/ui/components/forms/composites/field/FieldPassword';
import FieldHelperText from '@/components/forms/composites/field/FieldHelperText';
import FieldEmail from '@/components/forms/composites/field/FieldEmail';
import FieldText from '@/components/forms/composites/field/FieldText';
import FieldCheckbox from '@/components/forms/composites/field/FieldCheckbox';

const MicroInputsShowcasePage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [bio, setBio] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsTouched, setTermsTouched] = useState(false);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidUsername = (value: string) => value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);

  const emailError = emailTouched && email && !isValidEmail(email);
  const emailSuccess = emailTouched && email && isValidEmail(email);
  const usernameError = usernameTouched && username && !isValidUsername(username);
  const usernameSuccess = usernameTouched && username && isValidUsername(username);

  return (
    <ShowcasePage
      title="Inputs & Focus"
      description="Demonstrate polished input interactions - focus rings, validation transitions, and helper text feedback."
    >
      <ShowcaseSection
        title="Focus Ring Animation"
        description="Inputs show clear, animated focus states for accessibility and visual feedback."
      >
        <CodeExample
          id="micro-interactions"
          title="Focus States"
          code={`// Tailwind focus classes provide smooth ring animation
// focus:ring-2 focus:ring-primary focus:ring-offset-2

<Input
  className="transition-all duration-150 focus:ring-2 focus:ring-primary focus:ring-offset-2"
  placeholder="Click to focus..."
/>

// With label animation
<div className="relative">
  <Input id="floating" className="peer pt-4" placeholder=" " />
  <Label
    htmlFor="floating"
    className="absolute left-3 top-3 text-muted-foreground transition-all duration-150
               peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary
               peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
  >
    Floating Label
  </Label>
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Focus States</CardTitle>
              <p className="text-sm text-muted-foreground">Click inputs to see focus ring animation</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Standard Focus Ring</Label>
                <Input
                  className="transition-all duration-150"
                  placeholder="Click to focus..."
                />
              </div>

              <div className="space-y-2">
                <Label>Enhanced Focus Ring</Label>
                <Input
                  className="transition-all duration-150 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  placeholder="Click to see enhanced focus..."
                />
              </div>

              <div className="relative">
                <Input
                  id="floating"
                  className="peer pt-5 h-12 transition-all duration-150"
                  placeholder=" "
                />
                <Label
                  htmlFor="floating"
                  className="absolute left-3 top-3.5 text-muted-foreground transition-all duration-150 pointer-events-none
                             peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-primary
                             peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs"
                >
                  Floating Label
                </Label>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Validation Transitions"
        description="Smooth transitions between error and success states with clear visual indicators."
      >
        <CodeExample
          id="micro-interactions"
          title="Error → Success Transitions"
          code={`const emailStatus = emailError ? 'error' : emailSuccess ? 'success' : 'default';
const emailMsg = emailError ? 'Please enter a valid email' : emailSuccess ? 'Email looks good!' : undefined;
const termsStatus = termsTouched && !termsAccepted ? 'error' : 'default';
const termsMsg = termsTouched && !termsAccepted ? 'Please accept the terms' : undefined;

<FieldEmail
  label="Email Address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onBlur={() => setEmailTouched(true)}
  status={emailStatus}
  statusMessage={emailMsg}
/>

<FieldText
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  onBlur={() => setUsernameTouched(true)}
  status={usernameStatus}
  statusMessage={usernameMsg}
/>

<FieldCheckbox
  checked={termsAccepted}
  onCheckedChange={(val) => {
    setTermsTouched(true);
    setTermsAccepted(!!val);
  }}
  status={termsStatus}
  statusMessage={termsMsg}
>
  I accept the terms
</FieldCheckbox>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Validation Feedback</CardTitle>
              <p className="text-sm text-muted-foreground">Type and blur to see validation transitions</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <FieldEmail
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@example.com"
                status={emailError ? 'error' : emailSuccess ? 'success' : 'default'}
                statusMessage={
                  emailError
                    ? 'Please enter a valid email address'
                    : emailSuccess
                    ? 'Email looks good!'
                    : undefined
                }
              />

              <FieldText
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setUsernameTouched(true)}
                placeholder="john_doe"
                status={usernameError ? 'error' : usernameSuccess ? 'success' : 'default'}
                statusMessage={
                  usernameError
                    ? 'Username must be 3+ characters (letters, numbers, underscore)'
                    : usernameSuccess
                    ? 'Username is available!'
                    : undefined
                }
              />

              <FieldCheckbox
                checked={termsAccepted}
                onCheckedChange={(val) => {
                  setTermsTouched(true);
                  setTermsAccepted(!!val);
                }}
                status={termsTouched && !termsAccepted ? 'error' : 'default'}
                statusMessage={termsTouched && !termsAccepted ? 'Please accept the terms' : undefined}
              >
                I accept the terms
              </FieldCheckbox>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Password Visibility Toggle"
        description="Smooth toggle between password visibility states."
      >
        <CodeExample
          id="micro-interactions"
          title="Password Toggle"
          code={`import FieldPassword from '@/shared/ui/components/fields/FieldPassword';

<FieldPassword
  name="password"
  placeholder="Enter password..."
  onChange={(e) => setPassword(e.target.value)}
/>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Password Toggle</CardTitle>
              <p className="text-sm text-muted-foreground">Click the eye icon to toggle visibility</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-sm">
                <FieldPassword
                  name="password"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Helper Text Feedback"
        description="Dynamic helper text that responds to input state."
      >
        <CodeExample
          id="micro-interactions"
          title="Dynamic Helper Text"
          code={`import HelperTextInput from '@/shared/ui/components/fields/HelperTextInput';

<HelperTextInput
  id="bio-input"
  label="Short Bio"
  value={bio}
  onChange={setBio}
  maxLength={50}
  warningThreshold={20}
  dangerThreshold={10}
  placeholder="Tell us about yourself..."
/>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Character Counter</CardTitle>
              <p className="text-sm text-muted-foreground">Type to see the counter change color</p>
            </CardHeader>
            <CardContent>
              <FieldHelperText
                id="bio-input"
                label="Short Bio"
                value={bio}
                onChange={setBio}
                maxLength={50}
                warningThreshold={20}
                dangerThreshold={10}
                placeholder="Tell us about yourself..."
                className="max-w-md"
              />
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default MicroInputsShowcasePage;
