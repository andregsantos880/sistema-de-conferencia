import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/shadcn/components/ui/tabs';
import {
  Tabs as AnimatedTabs,
  TabsList as AnimatedTabsList,
  TabsTrigger as AnimatedTabsTrigger,
  TabsContent as AnimatedTabsContent,
  TabsContents as AnimatedTabsContents,
} from '@/shared/ui/shadcn/components/animate-ui/components/animate/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';

const TabsShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Tabs"
      description="Tabbed navigation components for organizing content into sections."
    >
      <ShowcaseSection
        title="Basic Tabs"
        description="Standard tabbed interface with content panels."
      >
        <CodeExample
          id="tabs"
          title="Default Tabs"
          code={`<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="reports">Reports</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content...</TabsContent>
  <TabsContent value="analytics">Analytics content...</TabsContent>
  <TabsContent value="reports">Reports content...</TabsContent>
</Tabs>`}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>View your dashboard overview and key metrics.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is the overview tab content. You can display summary information, quick stats, or any introductory content here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>Detailed analytics and performance metrics.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Analytics content goes here. Charts, graphs, and detailed data analysis.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>Generate and view reports.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Reports section with downloadable documents and summaries.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Configure your preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Settings and configuration options.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Animated Tabs"
        description="Tabs with animated highlight and smooth transitions from animate-ui."
      >
        <CodeExample
          id="animated-tabs"
          title="Animated Highlight"
          code={`const animatedTabs = [
  { value: 'summary', label: 'Summary' },
  { value: 'traffic', label: 'Traffic' },
  { value: 'engagement', label: 'Engagement' },
];

<AnimatedTabs defaultValue="summary" className="w-full">
  <AnimatedTabsList>
    {animatedTabs.map(tab => (
      <AnimatedTabsTrigger key={tab.value} value={tab.value}>
        {tab.label}
      </AnimatedTabsTrigger>
    ))}
  </AnimatedTabsList>

  <AnimatedTabsContents>
    <AnimatedTabsContent value="summary" className="mt-4">
      Summary content...
    </AnimatedTabsContent>
    <AnimatedTabsContent value="traffic" className="mt-4">
      Traffic content...
    </AnimatedTabsContent>
    <AnimatedTabsContent value="engagement" className="mt-4">
      Engagement content...
    </AnimatedTabsContent>
  </AnimatedTabsContents>
</AnimatedTabs>`}
        >
          <AnimatedTabs defaultValue="summary" className="w-full max-w-2xl">
            <AnimatedTabsList>
              <AnimatedTabsTrigger value="summary">Summary</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="traffic">Traffic</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="engagement">Engagement</AnimatedTabsTrigger>
            </AnimatedTabsList>

            <AnimatedTabsContents>
              <AnimatedTabsContent value="summary" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Snapshot</CardTitle>
                    <CardDescription>Overview of key health metrics.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-semibold">12.4k</p>
                      <p className="text-[11px] text-emerald-500 font-medium">+4.2% WoW</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                      <p className="text-2xl font-semibold">48.9k</p>
                      <p className="text-[11px] text-emerald-500 font-medium">+6.8% WoW</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Churn</p>
                      <p className="text-2xl font-semibold">2.1%</p>
                      <p className="text-[11px] text-rose-500 font-medium">-0.3% WoW</p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedTabsContent>
              <AnimatedTabsContent value="traffic" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription>Channel mix for the last 7 days.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Organic Search</span>
                      <span className="font-medium">52%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Direct</span>
                      <span className="font-medium">21%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Referral</span>
                      <span className="font-medium">14%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Paid</span>
                      <span className="font-medium">13%</span>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedTabsContent>
              <AnimatedTabsContent value="engagement" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement</CardTitle>
                    <CardDescription>Retention and interaction highlights.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Session Length</span>
                      <span className="font-medium">7m 42s</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">DAU / MAU</span>
                      <span className="font-medium">32%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Feature Adoption</span>
                      <span className="font-medium">68%</span>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedTabsContent>
            </AnimatedTabsContents>
          </AnimatedTabs>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Tabs with Disabled State"
        description="Tabs can have disabled items."
      >
        <CodeExample
          id="tabs"
          title="Disabled Tab"
          code={`<TabsList>
  <TabsTrigger value="active">Active</TabsTrigger>
  <TabsTrigger value="disabled" disabled>Disabled</TabsTrigger>
  <TabsTrigger value="another">Another</TabsTrigger>
</TabsList>`}
        >
          <Tabs defaultValue="active" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="disabled" disabled>Disabled</TabsTrigger>
              <TabsTrigger value="another">Another</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4">
              <p className="text-sm text-muted-foreground">Active tab content.</p>
            </TabsContent>
            <TabsContent value="another" className="mt-4">
              <p className="text-sm text-muted-foreground">Another tab content.</p>
            </TabsContent>
          </Tabs>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default TabsShowcasePage;

