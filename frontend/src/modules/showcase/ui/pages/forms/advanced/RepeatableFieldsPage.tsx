import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { 
  InvoiceExample, 
  TeamExample, 
  TodoExample, 
  NotesExample 
} from '../demos/RepeatablePluginsDemo';

const RepeatableFieldsPage: React.FC = () => {
  return (
    <ShowcasePage
      title="Repeatable & Sortable"
      description="Advanced list management with drag-and-drop reordering, collection-level validation, and dynamic item creation."
    >
      <ShowcaseSection
        title="Invoice & Line Items"
        description="Complex item management with drag-and-drop reordering and individual item validation using Zod."
        defaultCollapsed={false}
      >
        <CodeExample
          id="repeatable-sortable-invoice"
          title="Dynamic Invoice Editor"
          description="Drag to reorder items. Features instant total calculation and validation feedback."
          code={`<RepeatableSortable
  items={items}
  onMove={moveItem}
  getItemId={(item) => item.id}
>
  {(item, index) => (
    <div className="flex items-center gap-3">
      <SortableHandle /><Input />...
    </div>
  )}
</RepeatableSortable>`}
        >
          <InvoiceExample />
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Team Membership"
        description="Collection-level rules such as unique fields (emails) and minimum member requirements."
        defaultCollapsed={true}
      >
        <CodeExample
          id="repeatable-team"
          title="Team Management"
          description="Standard repeatable list without sorting. Validates that all emails in the collection are unique."
          code={`const teamSchema = z.array(memberSchema).refine((items) => {
  const emails = items.map(i => i.email);
  return new Set(emails).size === emails.length;
}, "Emails must be unique");

<Repeatable items={items} onRemove={removeItem}>
  {(item, index, { remove }) => (
     <MemberRow item={item} onRemove={remove} />
  )}
</Repeatable>`}
        >
          <TeamExample />
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Interactive Task List"
        description="Lightweight sortable lists for everyday task management and simple reordering."
        defaultCollapsed={true}
      >
        <CodeExample
          id="repeatable-todo"
          title="Sortable Todo List"
          description="Minimal interface focusing on smooth drag-and-drop interactions and status toggling."
          code={`<RepeatableSortable
  items={todos}
  onMove={moveTodo}
  getItemId={(item) => item.id}
>
  {/* Render Todo Item */}
</RepeatableSortable>`}
        >
          <TodoExample />
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Grid-Based Workspace"
        description="Sorting items in a 2D grid layout. Perfect for dashboards, galleries, or notes."
        defaultCollapsed={true}
      >
        <CodeExample
          id="repeatable-grid"
          title="Sticky Notes Grid"
          description="Demonstrates the 'grid' strategy for RepeatableSortable, allowing reordering in multiple columns."
          code={`<RepeatableSortable
  items={notes}
  onMove={moveNote}
  getItemId={(item) => item.id}
  strategy="grid"
  className="grid grid-cols-3 gap-4"
>
  {/* Render Sticky Note */}
</RepeatableSortable>`}
        >
          <NotesExample />
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default RepeatableFieldsPage;
