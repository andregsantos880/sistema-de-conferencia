/**
 * Simple Repeatable Demo
 * 
 * Demonstrates the useRepeatable hook and Repeatable component
 * in a simple todo list context without form integration.
 */

import { useState } from 'react';
import { useRepeatable } from '@/shared/hooks/useRepeatable';
import { Repeatable } from '@/shared/ui/components/repeatable';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Input } from '@/shared/ui/shadcn/components/ui/input';
import { Checkbox } from '@/shared/ui/shadcn/components/ui/checkbox';
import { RequestPreview } from '../../../components/RequestPreview';
import { Plus, Trash2, ChevronUp, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

let todoIdCounter = 0;
const generateTodoId = () => `todo-${Date.now()}-${todoIdCounter++}`;

export const SimpleRepeatableDemo: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // We need to access todos inside handleSave, so we'll define it after useRepeatable
  // But useRepeatable is defined right here. 
  // Let's rely on hoisting or just move the definition down.
  // Actually, useRepeatable returns 'todos' object. handleSave needs 'todos'.
  // So I can't define handleSave before 'todos'.
  // I will define 'todos' first, then 'handleSave'.

  const todos = useRepeatable<TodoItem>({
    initialItems: [
      { id: generateTodoId(), text: 'Learn useRepeatable hook', completed: true },
      { id: generateTodoId(), text: 'Build amazing UI', completed: false },
      { id: generateTodoId(), text: 'Test the form', completed: false },
    ],
    minItems: 0,
    maxItems: 20,
    createItem: () => ({
      id: generateTodoId(),
      text: '',
      completed: false,
    }),
    validateItem: (item) => {
      if (!item.text.trim()) {
        return 'Todo text is required';
      }
      return null;
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Todos saved:', todos.items);
    setIsSaving(false);
    setSaveSuccess(true);
    
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Todo List</h3>
          <p className="text-sm text-muted-foreground">
            Simple example using useRepeatable and Repeatable component
          </p>
        </div>
        <Button
          onClick={() => todos.addItem()}
          disabled={!todos.canAdd}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Todo
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Total: {todos.items.length}</span>
        <span>Completed: {todos.items.filter(t => t.completed).length}</span>
        {todos.hasErrors && <span className="text-destructive">Has Errors</span>}
        {todos.isDirty && <span className="text-primary">Modified</span>}
      </div>

      {/* Todo List */}
      <Repeatable
        items={todos.items}
        onAdd={todos.addItem}
        onRemove={todos.removeItem}
        onUpdate={todos.updateItem}
        onMove={todos.moveItem}
        canAdd={todos.canAdd}
        canRemove={todos.canRemove}
        emptyState={
          <div className="p-8 text-center text-muted-foreground border rounded-lg">
            No todos yet. Click "Add Todo" to get started.
          </div>
        }
        className="space-y-2"
      >
        {(todo, index, { update, remove, moveUp, moveDown }) => (
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-card group">
            {/* Checkbox */}
            <Checkbox
              checked={todo.completed}
              onCheckedChange={(checked) => update({ completed: !!checked })}
            />

            {/* Text Input */}
            <Input
              value={todo.text}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="Enter todo text..."
              className={`flex-1 ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
            />

            {/* Error */}
            {todos.errors[index] && (
              <span className="text-xs text-destructive">
                {todos.errors[index]}
              </span>
            )}

            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={moveUp}
                disabled={index === 0}
                className="h-8 w-8"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={moveDown}
                disabled={index === todos.items.length - 1}
                className="h-8 w-8"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={remove}
                disabled={!todos.canRemove}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Repeatable>

      {/* Actions */}
      {/* Save Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || todos.items.length === 0}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : (
              'Save List'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={todos.clear}
            disabled={todos.items.length === 0 || isSaving}
          >
            Clear All
          </Button>
        </div>
      </div>

      <RequestPreview data={todos.items} title="Request Payload" />
    </div>
  );
};
