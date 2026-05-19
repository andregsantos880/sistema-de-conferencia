import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';

const BadgesShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Badges & Chips"
      description="Small status indicators and labels for categorizing content."
    >
      <ShowcaseSection
        title="Badge Variants"
        description="Different badge styles for various use cases."
      >
        <CodeExample
          id="badges"
          title="Badge Variants"
          code={`<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>`}
        >
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Status Badges"
        description="Colored badges for indicating status."
      >
        <CodeExample
          id="badges"
          title="Status Indicators"
          code={`<Badge className="bg-green-100 text-green-800">Active</Badge>
<Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
<Badge className="bg-red-100 text-red-800">Inactive</Badge>
<Badge className="bg-blue-100 text-blue-800">Info</Badge>`}
        >
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Inactive</Badge>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Info</Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">New</Badge>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Tag Chips"
        description="Chips for labeling and categorization."
      >
        <CodeExample
          id="badges"
          title="Tags"
          code={`<div className="flex flex-wrap gap-2">
  <Badge variant="outline">React</Badge>
  <Badge variant="outline">TypeScript</Badge>
  <Badge variant="outline">Tailwind</Badge>
</div>`}
        >
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">React</Badge>
            <Badge variant="outline">TypeScript</Badge>
            <Badge variant="outline">Tailwind CSS</Badge>
            <Badge variant="outline">Node.js</Badge>
            <Badge variant="outline">PostgreSQL</Badge>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Badges with Icons"
        description="Badges can include icons for additional context."
      >
        <CodeExample
          id="badges"
          title="Icon Badges"
          code={`<Badge className="gap-1">
  <span className="h-2 w-2 rounded-full bg-green-500" />
  Online
</Badge>`}
        >
          <div className="flex flex-wrap gap-3">
            <Badge className="gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Online
            </Badge>
            <Badge className="gap-1.5" variant="secondary">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              Away
            </Badge>
            <Badge className="gap-1.5" variant="outline">
              <span className="h-2 w-2 rounded-full bg-gray-400" />
              Offline
            </Badge>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Usage in Context"
        description="Badges used within other components."
      >
        <CodeExample
          id="badges"
          title="In Lists"
          code={`<div className="flex items-center justify-between">
  <span>Feature Request</span>
  <Badge>New</Badge>
</div>`}
        >
          <div className="max-w-md space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Feature Request</span>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">New</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Bug Report</span>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Critical</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Documentation</span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Complete</Badge>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default BadgesShowcasePage;

