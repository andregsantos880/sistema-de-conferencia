import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { ScrollArea, ScrollBar } from '@/shared/ui/shadcn/components/ui/scroll-area';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';

const tags = Array.from({ length: 50 }).map((_, i) => `Tag ${i + 1}`);

const ScrollableShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Scrollable Areas"
      description="Custom scrollable containers with styled scrollbars."
    >
      <ShowcaseSection
        title="Vertical Scroll"
        description="Scrollable area with vertical overflow."
      >
        <CodeExample
          id="scrollable"
          title="Vertical ScrollArea"
          code={`<ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
  {items.map((item) => (
    <div key={item} className="text-sm">
      {item}
    </div>
  ))}
</ScrollArea>`}
        >
          <ScrollArea className="h-[200px] w-full max-w-[350px] rounded-md border p-4">
            <div className="space-y-4">
              {tags.slice(0, 20).map((tag) => (
                <div key={tag}>
                  <div className="text-sm font-medium">{tag}</div>
                  <p className="text-sm text-muted-foreground">
                    Description for {tag.toLowerCase()}
                  </p>
                  <Separator className="mt-2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Horizontal Scroll"
        description="Scrollable area with horizontal overflow."
      >
        <CodeExample
          id="scrollable"
          title="Horizontal ScrollArea"
          code={`<ScrollArea className="w-full whitespace-nowrap rounded-md border">
  <div className="flex w-max space-x-4 p-4">
    {items.map((item) => (
      <div key={item} className="w-[150px] shrink-0 rounded-md border p-4">
        {item}
      </div>
    ))}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>`}
        >
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex w-max space-x-4 p-4">
              {tags.slice(0, 15).map((tag) => (
                <div
                  key={tag}
                  className="w-[150px] shrink-0 rounded-md border bg-card p-4"
                >
                  <div className="font-medium text-sm">{tag}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Card content
                  </p>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Both Directions"
        description="Scrollable in both directions."
      >
        <CodeExample
          id="scrollable"
          title="Bidirectional Scroll"
          code={`<ScrollArea className="h-[300px] w-full rounded-md border">
  <div className="w-[800px] p-4">
    {/* Wide content */}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>`}
        >
          <ScrollArea className="h-[250px] w-full rounded-md border">
            <div className="w-[800px] p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {['ID', 'Name', 'Email', 'Role', 'Status', 'Created', 'Updated', 'Actions'].map((header) => (
                      <th key={header} className="text-left p-2 font-medium text-sm whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 text-sm">{i + 1}</td>
                      <td className="p-2 text-sm whitespace-nowrap">User {i + 1}</td>
                      <td className="p-2 text-sm whitespace-nowrap">user{i + 1}@example.com</td>
                      <td className="p-2 text-sm">{['Admin', 'Editor', 'Viewer'][i % 3]}</td>
                      <td className="p-2 text-sm">{['Active', 'Inactive', 'Pending'][i % 3]}</td>
                      <td className="p-2 text-sm whitespace-nowrap">2024-01-{String(i + 1).padStart(2, '0')}</td>
                      <td className="p-2 text-sm whitespace-nowrap">2024-02-{String(i + 1).padStart(2, '0')}</td>
                      <td className="p-2 text-sm">
                        <button className="text-primary hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Chat-like Scroll"
        description="Scrollable container for chat messages."
      >
        <CodeExample
          id="scrollable"
          title="Chat Container"
          code={`<ScrollArea className="h-[300px] rounded-md border p-4">
  {messages.map((msg) => (
    <div key={msg.id} className="mb-4">
      <div className="font-medium">{msg.sender}</div>
      <p className="text-sm">{msg.text}</p>
    </div>
  ))}
</ScrollArea>`}
        >
          <ScrollArea className="h-[250px] w-full max-w-md rounded-md border p-4">
            <div className="space-y-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      i % 2 === 0
                        ? 'bg-muted'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="text-sm">
                      {i % 2 === 0
                        ? 'This is a message from the other person.'
                        : 'This is your reply message.'}
                    </p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {`${10 + i}:${String(i * 3).padStart(2, '0')} AM`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default ScrollableShowcasePage;

