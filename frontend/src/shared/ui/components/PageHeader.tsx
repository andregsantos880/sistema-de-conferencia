import React, { type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shadcn/lib/utils';
import { Button } from '@/shadcn/components/ui/button';

export interface PageHeaderProps {
  /**
   * Main title of the page
   */
  title?: string | ReactNode;
  
  /**
   * Optional subtitle or description text
   */
  subtitle?: string | ReactNode;
  
  /**
   * Optional back button configuration
   */
  backButton?: {
    /**
     * URL to navigate to when back button is clicked
     */
    to?: string;
    
    /**
     * Custom label for back button (defaults to "Regresar")
     */
    label?: string;
    
    /**
     * Custom onClick handler (if not provided, will navigate to "to" prop)
     */
    onClick?: () => void;
  };
  
  /**
   * Optional additional content to render in the right side of the header
   */
  actions?: ReactNode;
  
  /**
   * Optional additional className for the container
   */
  className?: string;
}

/**
 * PageHeader component for consistent page headers across the application
 * Includes title, optional description, back button, and action buttons
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title = '',
  subtitle,
  backButton,
  actions,
  className = '',
}) => {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    if (backButton?.onClick) {
      backButton.onClick();
    } else if (backButton?.to) {
      navigate(backButton.to);
    }
  };
  
  return (
    <div className={cn(
      'flex flex-col lg:flex-row lg:items-center justify-start md:justify-between gap-2 page-header',
      className
    )}>
      <div className="flex flex-row items-center">
        {backButton && (
          <Button
            onClick={handleBackClick}
            variant="ghost"
            className="rounded-4 mr-2 items-center text-foreground"
            size="sm"
            aria-label={backButton.label || "Regresar"}
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}
        
        <div className='flex flex-col align-start'>
          {title && (
            typeof title === 'string' ? (
              <h1 className="text-3xl font-semibold tracking-wide">{title}</h1>
            ) : title
          )}

          {subtitle && (
            typeof subtitle === 'string' 
              ? <p className="text-sm text-muted-foreground">{subtitle}</p>
              : subtitle
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex flex-wrap gap-3 items-center">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
