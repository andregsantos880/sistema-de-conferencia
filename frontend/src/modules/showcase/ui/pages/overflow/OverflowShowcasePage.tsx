import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Copy, Share, Download, Archive, Eye } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Label } from '@/shared/ui/shadcn/components/ui/label';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/shadcn/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/components/ui/dropdown-menu';
import { ScrollArea } from '@/shared/ui/shadcn/components/ui/scroll-area';
import { Separator } from '@/shared/ui/shadcn/components/ui/separator';
import { ScrollFadeContainer } from '@/shared/ui/components/scroll';
import { cn } from '@/shadcn/lib/utils';

// Long text samples
const longTexts = {
  title: 'This is an extremely long title that would normally break the layout if not handled properly with truncation',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  email: 'very.long.email.address.that.exceeds.normal.column.width@extremely-long-domain-name.example.com',
  notes: 'Customer requested expedited shipping with special handling instructions for fragile items. Please ensure package is marked as fragile and handle with care during transit. Additional insurance coverage has been purchased.',
};

// Table data with long content
const tableData = [
  { id: 1, name: 'John Doe', email: longTexts.email, notes: longTexts.notes, status: 'Active' },
  { id: 2, name: 'Jane Smith with a Very Long Name That Exceeds Normal Width', email: 'jane@example.com', notes: 'Standard delivery', status: 'Pending' },
  { id: 3, name: 'Bob Wilson', email: 'bob.wilson@company.com', notes: longTexts.notes, status: 'Active' },
  { id: 4, name: 'Alice Johnson', email: 'alice.johnson.manager@enterprise-solutions.example.com', notes: 'Priority customer - VIP treatment required', status: 'Inactive' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', notes: longTexts.notes, status: 'Active' },
];

// Wide table data for horizontal overflow
const wideTableData = Array.from({ length: 10 }, (_, i) => ({
  id: `ORD-${String(i + 1).padStart(4, '0')}`,
  customer: `Customer ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  product: `Product Name ${i + 1}`,
  quantity: Math.floor(Math.random() * 100) + 1,
  unitPrice: `$${(Math.random() * 100).toFixed(2)}`,
  discount: `${Math.floor(Math.random() * 20)}%`,
  tax: `$${(Math.random() * 50).toFixed(2)}`,
  shipping: `$${(Math.random() * 20).toFixed(2)}`,
  total: `$${(Math.random() * 500 + 100).toFixed(2)}`,
  status: ['Pending', 'Shipped', 'Delivered', 'Cancelled'][i % 4],
  date: new Date(2024, i % 12, (i % 28) + 1).toLocaleDateString(),
}));

// Scrollable content items
const scrollableItems = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}: ${i % 3 === 0 ? longTexts.title : `Regular item title ${i + 1}`}`,
  description: i % 2 === 0 ? longTexts.description : 'Short description for this item.',
  timestamp: `${Math.floor(Math.random() * 24)}h ago`,
}));

const OverflowShowcasePage: React.FC = () => {
  const [expandedCell, setExpandedCell] = useState<number | null>(null);

  return (
    <ShowcasePage
      title="Overflow & Long Content"
      description="Demonstrate how Katalyst handles long text, content overflow, and scroll behavior gracefully."
    >
      {/* Section A: Table Cell Overflow */}
      <ShowcaseSection
        title="Table Cell Overflow"
        description="Handle long text in table cells with truncation, tooltips, and expandable content."
      >
        <CodeExample
          id="overflow"
          title="Truncation with Tooltip"
          code={`{/* Truncated cell with tooltip */}
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="truncate max-w-[200px] block cursor-help">
        {longText}
      </span>
    </TooltipTrigger>
    <TooltipContent className="max-w-sm">
      <p>{longText}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

{/* Expandable cell */}
<button onClick={() => setExpanded(!expanded)}>
  <span className={cn(expanded ? '' : 'line-clamp-2')}>
    {longText}
  </span>
</button>`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[80px_150px_200px_1fr_100px] gap-4 p-3 border-b bg-muted/50 text-xs font-medium">
                  <div>ID</div>
                  <div>Name</div>
                  <div>Email</div>
                  <div>Notes</div>
                  <div>Status</div>
                </div>
                
                {/* Rows */}
                <TooltipProvider>
                  {tableData.map((row) => (
                    <div key={row.id} className="grid grid-cols-[80px_150px_200px_1fr_100px] gap-4 p-3 border-b last:border-b-0 text-sm items-start">
                      <div className="font-mono text-xs">{row.id}</div>
                      
                      {/* Name with tooltip */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate block cursor-help">{row.name}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{row.name}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      {/* Email with tooltip */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate block cursor-help text-muted-foreground">{row.email}</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p className="break-all">{row.email}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      {/* Notes - expandable */}
                      <div>
                        <button 
                          onClick={() => setExpandedCell(expandedCell === row.id ? null : row.id)}
                          className="text-left w-full"
                        >
                          <span className={cn(
                            "text-muted-foreground text-xs",
                            expandedCell === row.id ? '' : 'line-clamp-2'
                          )}>
                            {row.notes}
                          </span>
                          {row.notes.length > 80 && (
                            <span className="text-primary text-xs ml-1">
                              {expandedCell === row.id ? 'Show less' : 'Show more'}
                            </span>
                          )}
                        </button>
                      </div>
                      
                      <Badge variant={row.status === 'Active' ? 'default' : row.status === 'Pending' ? 'secondary' : 'outline'}>
                        {row.status}
                      </Badge>
                    </div>
                  ))}
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      {/* Section B: Card Content Overflow */}
      <ShowcaseSection
        title="Card Content Overflow"
        description="Handle long content in cards with max-height, scroll, and gradient fade."
      >
        <CodeExample
          id="overflow"
          title="Cards with Overflow Handling"
          code={`{/* Card with truncated title */}
<Card>
  <CardHeader>
    <CardTitle className="truncate">{longTitle}</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="line-clamp-3">{longDescription}</p>
  </CardContent>
</Card>

{/* Card with scroll and fade */}
<Card>
  <CardContent className="relative max-h-[200px] overflow-y-auto">
    {content}
    <div className="sticky bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
  </CardContent>
</Card>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card with truncated title */}
            <Card>
              <CardHeader className="pb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-base truncate cursor-help">
                        {longTexts.title}
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>{longTexts.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {longTexts.description}
                </p>
                <Button variant="link" className="px-0 h-auto text-xs mt-2">Read more</Button>
              </CardContent>
            </Card>

            {/* Card with max-height and scroll */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Scrollable Content</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollFadeContainer className="pr-2 max-h-[150px] overflow-y-auto">
                  <p className="text-sm text-muted-foreground">
                    {longTexts.description}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {longTexts.description}
                  </p>
                </ScrollFadeContainer>
              </CardContent>
            </Card>

            {/* Card with line clamp */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Line Clamp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {longTexts.description} {longTexts.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary">Category</Badge>
                  <span className="text-xs text-muted-foreground">2 min read</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Section C: Scrollable Panels */}
      <ShowcaseSection
        title="Scrollable Panels"
        description="Fixed-height panels with vertical scroll, scroll shadows, and sticky headers."
      >
        <CodeExample
          id="overflow"
          title="Scroll Area with Affordances"
          code={`<ScrollArea className="h-[300px] rounded-lg border">
  {/* Sticky header */}
  <div className="sticky top-0 bg-background border-b p-3 z-10">
    <h3>Panel Header</h3>
  </div>
  
  {/* Scrollable content */}
  <div className="p-3 space-y-2">
    {items.map(item => (
      <div key={item.id} className="p-3 border rounded-lg">
        {item.content}
      </div>
    ))}
  </div>
</ScrollArea>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Panel with sticky header */}
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  {/* Sticky header */}
                  <div className="sticky top-0 bg-card border-b p-3 z-10">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">Notifications</h3>
                      <Badge variant="secondary">{scrollableItems.length}</Badge>
                    </div>
                  </div>
                  
                  {/* Scrollable content */}
                  <div className="p-3 space-y-2">
                    {scrollableItems.slice(0, 15).map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{item.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Panel with scroll shadows (simulated) */}
            <Card>
              <CardContent className="p-0">
                <ScrollFadeContainer fades="both" className="h-[300px]">
                  <ScrollArea className="h-full">
                    <div className="p-4 pt-6 space-y-3">
                      {scrollableItems.slice(0, 12).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                            {item.id}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </ScrollFadeContainer>
              </CardContent>
            </Card>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Section D: Horizontal Overflow */}
      <ShowcaseSection
        title="Horizontal Overflow"
        description="Wide tables with horizontal scrolling and sticky first column."
      >
        <CodeExample
          id="overflow"
          title="Wide Table with Sticky Column"
          code={`<div className="overflow-x-auto">
  <table className="min-w-[1200px]">
    <thead>
      <tr>
        <th className="sticky left-0 bg-background z-10">ID</th>
        <th>Customer</th>
        <th>Email</th>
        {/* ... more columns */}
      </tr>
    </thead>
    <tbody>
      {data.map(row => (
        <tr key={row.id}>
          <td className="sticky left-0 bg-background">{row.id}</td>
          {/* ... more cells */}
        </tr>
      ))}
    </tbody>
  </table>
</div>`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Management (12 columns)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="sticky left-0 bg-muted/50 p-3 text-left text-xs font-medium z-10 border-r">Order ID</th>
                      <th className="p-3 text-left text-xs font-medium">Customer</th>
                      <th className="p-3 text-left text-xs font-medium">Email</th>
                      <th className="p-3 text-left text-xs font-medium">Product</th>
                      <th className="p-3 text-right text-xs font-medium">Qty</th>
                      <th className="p-3 text-right text-xs font-medium">Unit Price</th>
                      <th className="p-3 text-right text-xs font-medium">Discount</th>
                      <th className="p-3 text-right text-xs font-medium">Tax</th>
                      <th className="p-3 text-right text-xs font-medium">Shipping</th>
                      <th className="p-3 text-right text-xs font-medium">Total</th>
                      <th className="p-3 text-left text-xs font-medium">Status</th>
                      <th className="p-3 text-left text-xs font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wideTableData.map((row) => (
                      <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/30">
                        <td className="sticky left-0 bg-card p-3 text-sm font-mono z-10 border-r">{row.id}</td>
                        <td className="p-3 text-sm">{row.customer}</td>
                        <td className="p-3 text-sm text-muted-foreground">{row.email}</td>
                        <td className="p-3 text-sm">{row.product}</td>
                        <td className="p-3 text-sm text-right">{row.quantity}</td>
                        <td className="p-3 text-sm text-right">{row.unitPrice}</td>
                        <td className="p-3 text-sm text-right">{row.discount}</td>
                        <td className="p-3 text-sm text-right">{row.tax}</td>
                        <td className="p-3 text-sm text-right">{row.shipping}</td>
                        <td className="p-3 text-sm text-right font-medium">{row.total}</td>
                        <td className="p-3">
                          <Badge variant={row.status === 'Delivered' ? 'default' : row.status === 'Shipped' ? 'secondary' : 'outline'}>
                            {row.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">← Scroll horizontally to see all columns. First column is sticky.</p>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      {/* Section E: Overflow Actions */}
      <ShowcaseSection
        title="Overflow Actions"
        description="Action buttons collapsing into a 'More' menu when space is limited."
      >
        <CodeExample
          id="overflow"
          title="Overflow Menu Pattern"
          code={`{/* Visible actions + overflow menu */}
<div className="flex items-center gap-2">
  <Button size="sm">Edit</Button>
  <Button size="sm" variant="outline">View</Button>
  
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button size="sm" variant="ghost">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem>Copy</DropdownMenuItem>
      <DropdownMenuItem>Share</DropdownMenuItem>
      <DropdownMenuItem>Download</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Action Overflow Patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pattern 1: Primary + Secondary + Overflow */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Document.pdf</h4>
                    <p className="text-xs text-muted-foreground">2.4 MB • Updated 2 hours ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm">
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" /> Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share className="h-4 w-4 mr-2" /> Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Pattern 2: Icon-only with overflow */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Project Alpha</h4>
                    <p className="text-xs text-muted-foreground">12 members • Active</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Share className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" /> Export
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Pattern 3: Table row actions */}
              <div className="rounded-lg border">
                <div className="grid grid-cols-[1fr_1fr_120px] gap-4 p-3 border-b bg-muted/50 text-xs font-medium">
                  <div>Name</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>
                {['Item A', 'Item B', 'Item C'].map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_120px] gap-4 p-3 border-b last:border-b-0 items-center">
                    <div className="text-sm">{item}</div>
                    <Badge variant={i === 0 ? 'default' : 'secondary'}>{i === 0 ? 'Active' : 'Draft'}</Badge>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      {/* Section F: Long Forms */}
      <ShowcaseSection
        title="Long Forms"
        description="Multi-section forms with sticky footer action bar and scroll behavior."
      >
        <CodeExample
          id="overflow"
          title="Form with Sticky Footer"
          code={`<Card className="relative">
  <ScrollArea className="h-[400px]">
    <form className="p-6 space-y-6">
      {/* Form sections */}
      <section>
        <h3>Section 1</h3>
        <div className="grid gap-4">
          <Input />
          <Input />
        </div>
      </section>
      
      <Separator />
      
      <section>
        <h3>Section 2</h3>
        {/* ... more fields */}
      </section>
    </form>
  </ScrollArea>
  
  {/* Sticky footer */}
  <div className="sticky bottom-0 border-t bg-card p-4">
    <Button>Save Changes</Button>
    <Button variant="outline">Cancel</Button>
  </div>
</Card>`}
        >
          <Card className="relative">
            <ScrollArea className="h-[400px]">
              <form className="p-6 space-y-6">
                {/* Section 1: Basic Information */}
                <section>
                  <h3 className="font-semibold text-base mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input placeholder="Doe" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Email</Label>
                      <Input type="email" placeholder="john.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" />
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Section 2: Address */}
                <section>
                  <h3 className="font-semibold text-base mb-4">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Street Address</Label>
                      <Input placeholder="123 Main Street" />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input placeholder="New York" />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ny">New York</SelectItem>
                          <SelectItem value="ca">California</SelectItem>
                          <SelectItem value="tx">Texas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP Code</Label>
                      <Input placeholder="10001" />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Section 3: Preferences */}
                <section>
                  <h3 className="font-semibold text-base mb-4">Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="est">Eastern Time</SelectItem>
                          <SelectItem value="pst">Pacific Time</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                {/* Spacer for sticky footer */}
                <div className="h-16" />
              </form>
            </ScrollArea>
            
            {/* Sticky footer */}
            <div className="absolute bottom-0 left-0 right-0 border-t bg-card p-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">All fields are required unless marked optional.</p>
              <div className="flex gap-3">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default OverflowShowcasePage;

