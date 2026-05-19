import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';
import type { NavAction } from '@/app/config/navigation';

interface SidebarGroupProps {
  title?: string;
  collapsed: boolean;
  headerAction?: NavAction;
  children: React.ReactNode;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({ title, collapsed, headerAction, children }) => {
  return (
    <div className="space-y-2" data-sidebar-group>
      {title && !collapsed && (
        <div className="flex items-center justify-between group/group-header pr-2">
          <div className={cn(
            'text-[10px] font-bold uppercase tracking-widest',
            'text-sidebar-muted',
            'transition-opacity duration-300'
          )}>
            {title}
          </div>
          
          {headerAction && (
             <button 
              onClick={headerAction.onClick}
              title={headerAction.label}
              className="opacity-0 group-hover/group-header:opacity-100 p-1 hover:bg-sidebar-hover rounded-md transition-all text-sidebar-muted active:scale-95"
            >
              <Plus className="size-3" />
            </button>
          )}
        </div>
      )}

      <div>
        {children}
      </div>
    </div>
  );
};
