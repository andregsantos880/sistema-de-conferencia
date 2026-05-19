import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/shadcn/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/components/ui/popover';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Info, HelpCircle, Settings } from 'lucide-react';

const TooltipsShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Tooltips & Popovers"
      description="Contextual information displayed on hover or click."
    >
      <ShowcaseSection
        title="Basic Tooltip"
        description="Simple tooltips that appear on hover."
      >
        <CodeExample
          id="tooltips"
          title="Hover Tooltips"
          code={`<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="outline">Hover me</Button>
  </TooltipTrigger>
  <TooltipContent>
    <p>This is a tooltip</p>
  </TooltipContent>
</Tooltip>`}
        >
          <div className="flex flex-wrap gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This is a tooltip</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More information</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Need help?</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Tooltip Positions"
        description="Tooltips can appear in different positions."
      >
        <CodeExample
          id="tooltips"
          title="Positioned Tooltips"
          code={`<Tooltip>
  <TooltipTrigger asChild>
    <Button>Top</Button>
  </TooltipTrigger>
  <TooltipContent side="top">Tooltip on top</TooltipContent>
</Tooltip>`}
        >
          <div className="flex flex-wrap gap-4 justify-center py-8">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Top</Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Tooltip on top</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Bottom</Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Tooltip on bottom</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Left</Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Tooltip on left</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Right</Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Tooltip on right</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Popovers"
        description="Rich content displayed in a floating panel."
      >
        <CodeExample
          id="tooltips"
          title="Basic Popover"
          code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="space-y-2">
      <h4 className="font-medium">Popover Title</h4>
      <p className="text-sm text-muted-foreground">
        This is the popover content.
      </p>
    </div>
  </PopoverContent>
</Popover>`}
        >
          <div className="flex flex-wrap gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open popover</Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Popover Title</h4>
                  <p className="text-sm text-muted-foreground">
                    This is the popover content. You can put any content here including forms, lists, or other components.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60">
                <div className="space-y-3">
                  <h4 className="font-medium leading-none">Quick Settings</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Notifications</span>
                      <span className="text-sm text-muted-foreground">On</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dark Mode</span>
                      <span className="text-sm text-muted-foreground">Auto</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Popover with Form"
        description="Popovers can contain interactive elements."
      >
        <CodeExample
          id="tooltips"
          title="Interactive Popover"
          code={`<Popover>
  <PopoverTrigger asChild>
    <Button>Edit</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="space-y-4">
      <h4 className="font-medium">Edit Item</h4>
      <input className="w-full border rounded px-2 py-1" />
      <Button size="sm">Save</Button>
    </div>
  </PopoverContent>
</Popover>`}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button>Edit Item</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Edit Item</h4>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Name</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Enter name..."
                    defaultValue="Item Name"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">Cancel</Button>
                  <Button size="sm">Save</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default TooltipsShowcasePage;

