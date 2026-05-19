import React, { useState } from 'react';
import { Eye, Trash2, Copy, MoreHorizontal } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { cn } from '@/shadcn/lib/utils';
import { InlineReveal } from '@/shared/ui/components/InlineReveal';
import { InlineEditableField } from '@/components/editable/InlineEditableField';

// Sample data
const articles = [
  {
    id: 1,
    title: 'Getting Started with React',
    excerpt: 'Learn the fundamentals of React including components, props, and state management. This comprehensive guide covers everything you need to know to build modern web applications.',
    fullContent: 'React is a JavaScript library for building user interfaces. It was developed by Facebook and has become one of the most popular front-end frameworks. In this article, we will explore the core concepts of React, including JSX, components, props, state, and the virtual DOM. We will also look at best practices for structuring your React applications and managing complex state with hooks.',
    author: 'Alice Johnson',
    date: 'Dec 10, 2024',
  },
  {
    id: 2,
    title: 'TypeScript Best Practices',
    excerpt: 'Discover advanced TypeScript patterns and techniques for writing type-safe code. From generics to conditional types, master the tools that make TypeScript powerful.',
    fullContent: 'TypeScript adds static typing to JavaScript, enabling developers to catch errors early and write more maintainable code. This article covers advanced patterns including discriminated unions, mapped types, conditional types, and template literal types. We will also discuss how to effectively use generics to create reusable, type-safe abstractions.',
    author: 'Bob Smith',
    date: 'Dec 8, 2024',
  },
];

const editableFields = [
  { id: 'name', label: 'Name', value: 'John Doe' },
  { id: 'email', label: 'Email', value: 'john@example.com' },
  { id: 'company', label: 'Company', value: 'Acme Inc.' },
  { id: 'role', label: 'Role', value: 'Senior Developer' },
];

const InlineRevealShowcasePage: React.FC = () => {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    Object.fromEntries(editableFields.map((f) => [f.id, f.value]))
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editedFields, setEditedFields] = useState<Record<string, boolean>>({});
  const [savingField, setSavingField] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  // Sample list items for hover actions
  const listItems = [
    { id: 1, name: 'Project Alpha', status: 'Active', members: 5 },
    { id: 2, name: 'Project Beta', status: 'Paused', members: 3 },
    { id: 3, name: 'Project Gamma', status: 'Active', members: 8 },
    { id: 4, name: 'Project Delta', status: 'Completed', members: 4 },
  ];

  return (
    <ShowcasePage
      title="Inline Reveal"
      description="Demonstrate progressive disclosure patterns that reveal content or actions inline - minimal UI until interaction."
    >
      <ShowcaseSection
        title="Show More / Show Less"
        description="Truncated content with a 'Show more' toggle to reveal the full text."
      >
        <CodeExample
          id="progressive"
          title="Expandable Text Blocks"
          code={`<InlineReveal
  preview={article.excerpt}
  full={article.fullContent}
  clampLines={2}
  animateHeight
  collapsedMaxHeight={200}
  showGradient
/>

<InlineReveal
  preview={<p className="text-sm text-muted-foreground">{article.excerpt}</p>}
  full={<p className="text-sm text-muted-foreground">{article.fullContent}</p>}
  showMoreLabel={<>Show more details</>}
  showLessLabel={<>Show less</>}
/>`}
        >
          <div className="space-y-4">
            {articles.map((article) => {
              return (
                <Card key={article.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{article.title}</h3>
                      <Badge variant="outline" className="text-xs shrink-0 ml-2">
                        {article.date}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">By {article.author}</p>
                    <InlineReveal
                      preview={article.excerpt}
                      full={article.fullContent}
                      clampLines={2}
                      animateHeight
                      collapsedMaxHeight={200}
                      showGradient
                      contentClassName="text-sm text-muted-foreground transition-all"
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Hover-to-Reveal Actions"
        description="Action buttons that appear only when hovering over a list item."
      >
        <CodeExample
          id="progressive"
          title="Hover Actions Pattern"
          code={`const [hoveredItem, setHoveredItem] = useState<number | null>(null);

<div
  onMouseEnter={() => setHoveredItem(item.id)}
  onMouseLeave={() => setHoveredItem(null)}
  className="flex items-center justify-between p-3 border rounded-lg"
>
  <div>
    <p className="font-medium">{item.name}</p>
    <p className="text-sm text-muted-foreground">{item.status}</p>
  </div>
  
  {/* Actions revealed on hover */}
  <div className={cn(
    "flex gap-1 transition-opacity",
    hoveredItem === item.id ? "opacity-100" : "opacity-0"
  )}>
    <Button variant="ghost" size="sm"><Eye /></Button>
    <Button variant="ghost" size="sm"><Edit2 /></Button>
    <Button variant="ghost" size="sm"><Trash2 /></Button>
  </div>
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Projects</CardTitle>
              <p className="text-sm text-muted-foreground">Hover over items to reveal actions</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {listItems.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {item.name.charAt(8)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.members} members • {item.status}
                      </p>
                    </div>
                  </div>

                  {/* Actions - revealed on hover */}
                  <div
                    className={cn(
                      "flex gap-1 transition-opacity duration-150",
                      hoveredItem === item.id ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                  >
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Fallback for touch devices - always visible more button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 md:hidden",
                      hoveredItem === item.id && "hidden"
                    )}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Click-to-Edit Fields"
        description="Display values that transform into editable inputs when clicked."
      >
        <CodeExample
          id="progressive"
          title="Inline Edit Pattern"
          code={`<InlineEditableField
  id={field.id}
  label={field.label}
  value={fieldValues[field.id]}
  edited={editedFields[field.id]}
  showEditedBadge
  isSaving={savingField === field.id}
  error={fieldErrors[field.id]}
  onSave={async (next) => {
    if (!next.trim()) {
      setFieldErrors((prev) => ({ ...prev, [field.id]: 'Value required' }));
      return;
    }
    setSavingField(field.id);
    await new Promise((res) => setTimeout(res, 500));
    setFieldErrors((prev) => ({ ...prev, [field.id]: '' }));
    setFieldValues((prev) => ({ ...prev, [field.id]: next }));
    setEditedFields((prev) => ({ ...prev, [field.id]: true }));
    setSavingField(null);
  }}
/>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Profile Information</CardTitle>
              <p className="text-sm text-muted-foreground">Click on any field to edit</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {editableFields.map((field) => (
                  <InlineEditableField
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    value={fieldValues[field.id]}
                    edited={editedFields[field.id]}
                    showEditedBadge
                    isSaving={savingField === field.id}
                    error={fieldErrors[field.id]}
                    onSave={async (next) => {
                      if (!next.trim()) {
                        setFieldErrors((prev) => ({ ...prev, [field.id]: 'Value required' }));
                        return;
                      }

                      setSavingField(field.id);
                      await new Promise((res) => setTimeout(res, 500));
                      setFieldErrors((prev) => ({ ...prev, [field.id]: '' }));
                      setFieldValues((prev) => ({ ...prev, [field.id]: next }));
                      setEditedFields((prev) => ({ ...prev, [field.id]: true }));
                      setSavingField(null);
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default InlineRevealShowcasePage;
