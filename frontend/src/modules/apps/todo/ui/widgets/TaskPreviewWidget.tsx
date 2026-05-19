import React from 'react';
import { CheckCircle2, Circle, Plus } from 'lucide-react';

const tasks = [
  { id: 1, title: 'Respond to layout feedback', completed: true },
  { id: 2, title: 'Update documentation', completed: false },
  { id: 3, title: 'Fix sidebar overlapping', completed: false },
];

export const TaskPreviewWidget: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-surface border border-sidebar-border group hover:border-primary/30 transition-all cursor-pointer">
            {task.completed ? (
              <CheckCircle2 className="size-4 text-emerald-500" />
            ) : (
              <Circle className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
            <span className={`text-xs ${task.completed ? 'text-muted-foreground line-through' : 'font-medium'}`}>
              {task.title}
            </span>
          </div>
        ))}
      </div>
      
      <button className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-sidebar-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:border-primary/50 hover:text-primary transition-all">
        <Plus className="size-3" /> Add Task
      </button>
    </div>
  );
};
