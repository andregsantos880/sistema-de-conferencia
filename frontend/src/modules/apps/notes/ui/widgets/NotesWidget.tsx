import React from 'react';
import { StickyNote, Plus } from 'lucide-react';

const notes = [
  { id: 1, title: 'Project Ideas', date: '2 hours ago' },
  { id: 2, title: 'Meeting Notes', date: 'Yesterday' },
];

export const NotesWidget: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {notes.map(note => (
          <div key={note.id} className="p-3 rounded-xl bg-amber-100/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 space-y-2">
            <div className="size-6 bg-amber-500 rounded flex items-center justify-center text-white">
              <StickyNote className="size-3" />
            </div>
            <h4 className="text-[10px] font-bold uppercase tracking-tight line-clamp-2">{note.title}</h4>
            <span className="text-[9px] text-muted-foreground">{note.date}</span>
          </div>
        ))}
      </div>
      
      <button className="w-full py-2 bg-sidebar-surface border border-sidebar-border rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-sidebar-hover transition-all">
        <Plus className="size-3 inline-block mr-1" /> New Note
      </button>
    </div>
  );
};
