import React, { useState } from 'react';
import { Settings, Bell, Shield, Palette, Database, Globe } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Switch } from '@/shared/ui/shadcn/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import { ExpandablePanel } from '@/shared/ui/components/ExpandablePanel';

const CollapsiblePanelsShowcasePage: React.FC = () => {
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [expandedPanel, setExpandedPanel] = useState<string>('general');

  const togglePanel = (id: string) => {
    setExpandedPanel(current => (current === id ? '' : id));
  };

  return (
    <ShowcasePage
      title="Collapsible Panels"
      description="Demonstrate progressive disclosure with collapsible sections - keep interfaces clean by hiding optional configuration until needed."
    >
      <ShowcaseSection
        title="Settings Page with Collapsible Sections"
        description="Each settings category is collapsed by default, revealing options only when expanded."
      >
        <CodeExample
          id="progressive"
          title="Collapsible Settings Panels"
          code={`const [expandedPanel, setExpandedPanel] = useState('general');

const togglePanel = (id: string) => {
  setExpandedPanel(current => (current === id ? '' : id));
};

<div className="space-y-3">
  <ExpandablePanel
    id="general"
    isExpanded={expandedPanel === 'general'}
    onToggle={() => togglePanel('general')}
    header={
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <Settings className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="font-medium">General</span>
      </div>
    }
  >
    {/* General settings content */}
  </ExpandablePanel>

  <ExpandablePanel
    id="notifications"
    isExpanded={expandedPanel === 'notifications'}
    onToggle={() => togglePanel('notifications')}
    header={
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <Bell className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="font-medium">Notifications</span>
      </div>
    }
  >
    {/* Notification settings content */}
  </ExpandablePanel>

  <ExpandablePanel
    id="security"
    isExpanded={expandedPanel === 'security'}
    onToggle={() => togglePanel('security')}
    header={
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <Shield className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="font-medium">Security</span>
      </div>
    }
  >
    {/* Security settings content */}
  </ExpandablePanel>
</div>`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your account preferences and configuration
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* General Settings - Open by default */}
              <ExpandablePanel
                id="general"
                isExpanded={expandedPanel === 'general'}
                onToggle={() => togglePanel('general')}
                header={
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">General</span>
                  </div>
                }
                contentClassName="pt-4"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input id="displayName" placeholder="Your name" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" defaultValue="john@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language" className="w-full md:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </ExpandablePanel>

              {/* Notifications - Collapsed by default */}
              <ExpandablePanel
                id="notifications"
                isExpanded={expandedPanel === 'notifications'}
                onToggle={() => togglePanel('notifications')}
                header={
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">Notifications</span>
                  </div>
                }
                contentClassName="pt-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotif">Email notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      id="emailNotif"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotif">Push notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive browser notifications</p>
                    </div>
                    <Switch
                      id="pushNotif"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                </div>
              </ExpandablePanel>

              {/* Security - Collapsed by default */}
              <ExpandablePanel
                id="security"
                isExpanded={expandedPanel === 'security'}
                onToggle={() => togglePanel('security')}
                header={
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">Security</span>
                  </div>
                }
                contentClassName="pt-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactor">Two-factor authentication</Label>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch
                      id="twoFactor"
                      checked={twoFactor}
                      onCheckedChange={setTwoFactor}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Change Password</Label>
                    <div className="flex gap-2">
                      <Input type="password" placeholder="Current password" className="flex-1" />
                      <Input type="password" placeholder="New password" className="flex-1" />
                    </div>
                    <Button size="sm" variant="outline">Update Password</Button>
                  </div>
                </div>
              </ExpandablePanel>

              {/* Appearance - Collapsed by default */}
              <ExpandablePanel
                id="appearance"
                isExpanded={expandedPanel === 'appearance'}
                onToggle={() => togglePanel('appearance')}
                header={
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">Appearance</span>
                  </div>
                }
                contentClassName="pt-4"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </ExpandablePanel>

              {/* Data & Privacy - Collapsed by default */}
              <ExpandablePanel
                id="data"
                isExpanded={expandedPanel === 'data'}
                onToggle={() => togglePanel('data')}
                header={
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">Data & Privacy</span>
                  </div>
                }
                contentClassName="pt-4"
              >
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">Export your data</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Download a copy of all your data in JSON format
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Request Export
                    </Button>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-sm font-medium text-destructive">Delete account</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Permanently delete your account and all associated data
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 text-destructive border-destructive/50">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </ExpandablePanel>

              {/* Integrations - Collapsed by default */}
              <ExpandablePanel
                id="integrations"
                isExpanded={expandedPanel === 'integrations'}
                onToggle={() => togglePanel('integrations')}
                header={
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">Integrations</span>
                  </div>
                }
                contentClassName="pt-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs font-bold">
                        G
                      </div>
                      <div>
                        <p className="text-sm font-medium">Google</p>
                        <p className="text-xs text-muted-foreground">Connected</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Disconnect</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-600 text-xs font-bold">
                        GH
                      </div>
                      <div>
                        <p className="text-sm font-medium">GitHub</p>
                        <p className="text-xs text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button size="sm">Connect</Button>
                  </div>
                </div>
              </ExpandablePanel>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default CollapsiblePanelsShowcasePage;
