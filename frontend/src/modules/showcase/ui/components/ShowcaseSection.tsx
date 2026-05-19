import { cn } from '@/shadcn/lib/utils';
import React, { useState, useId } from 'react';
import { useShowcaseContext } from './useShowcaseContext';
import { ChevronDown } from 'lucide-react';

export interface ShowcaseSectionProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  /**
   * Default collapsed state (optional)
   * @default false
   */
  defaultCollapsed?: boolean;
}

const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({
  title,
  description,
  className,
  children,
  defaultCollapsed = false,
}) => {
  const sectionId = useId();
  const context = useShowcaseContext();
  
  // Local state for when context is not available (backward compatibility)
  const [localCollapsed, setLocalCollapsed] = useState(defaultCollapsed);

  // Determine if this section should be collapsed
  const isCollapsed = context
    ? (context.collapseAll && !context.expandedSections.has(sectionId)) || 
      context.collapsedSections.has(sectionId)
    : localCollapsed;

  // Toggle handler
  const handleToggle = () => {
    if (context) {
      context.toggleSection(sectionId);
    } else {
      setLocalCollapsed(prev => !prev);
    }
  };

  return (
    <section className="space-y-4 showcase-section-wrapper">
      <div className='showcase-section-header'>
        <button
          onClick={handleToggle}
          className="group flex items-start gap-2 w-full text-left hover:opacity-80 transition-opacity cursor-pointer"
          aria-expanded={!isCollapsed}
        >
          <span className={cn(
            "mt-1 text-muted-foreground transition-transform duration-200",
            !isCollapsed && "rotate-0",
            isCollapsed && "-rotate-90"
          )}>
            <ChevronDown className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <h2 className="text-xl font-semibold tracking-tight transition-colors">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </button>
      </div>
      
      <div
        className={cn(
          "showcase-section-content transition-all duration-300 ease-in-out",
          isCollapsed 
            ? "max-h-0 opacity-0 overflow-hidden" 
            : "max-h-[5000px] opacity-100"
        )}
      >
        <div className={cn("p-2 pt-0 showcase-section", className)}>
          {children}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
