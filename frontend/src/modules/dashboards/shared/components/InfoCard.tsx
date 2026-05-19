import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';

export interface InfoCardProps {
  /** Card title */
  title: string;
  
  /** Icon component to display in header */
  icon: LucideIcon;
  
  /** Card content */
  children: ReactNode;
  
  /** Optional className for additional styling */
  className?: string;
  
  /** Variant for different color schemes */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  
  /** Optional custom icon background color */
  iconBgColor?: string;
  
  /** Optional custom icon color */
  iconColor?: string;
  
  /** Optional custom icon border color */
  iconBorderColor?: string;
  
  /** Optional custom accent color for hover effect */
  accentColor?: string;
}

const variantStyles = {
  default: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    iconBorder: '',
    accent: 'from-primary/5',
  },
  success: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBorder: 'border-emerald-500/20',
    accent: 'from-emerald-500/5',
  },
  warning: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBorder: 'border-amber-500/20',
    accent: 'from-amber-500/5',
  },
  danger: {
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
    iconBorder: 'border-rose-500/20',
    accent: 'from-rose-500/5',
  },
  info: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBorder: 'border-blue-500/20',
    accent: 'from-blue-500/5',
  },
};

/**
 * InfoCard Component
 * 
 * A reusable card component with glassmorphism effects, hover animations,
 * and customizable variants for different semantic meanings.
 * 
 * @example
 * ```tsx
 * <InfoCard
 *   title="Pipeline Summary"
 *   icon={CheckCircle}
 *   variant="default"
 * >
 *   <div>Card content here</div>
 * </InfoCard>
 * ```
 */
export function InfoCard({
  title,
  icon: Icon,
  children,
  className,
  variant = 'default',
  iconBgColor,
  iconColor,
  iconBorderColor,
  accentColor,
}: InfoCardProps) {
  const styles = variantStyles[variant];
  
  const finalIconBg = iconBgColor || styles.iconBg;
  const finalIconColor = iconColor || styles.iconColor;
  const finalIconBorder = iconBorderColor || styles.iconBorder;
  const finalAccent = accentColor || styles.accent;

  return (
    <div 
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4',
        'transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30',
        className
      )}
    >
      {/* Hover Accent */}
      <div 
        className={cn(
          'absolute top-0 right-0 w-24 h-24 bg-gradient-to-br to-transparent rounded-bl-full',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          finalAccent
        )} 
      />
      
      {/* Content */}
      <div className="relative space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div 
            className={cn(
              'p-2 rounded-lg',
              finalIconBg,
              finalIconBorder && `border ${finalIconBorder}`
            )}
          >
            <Icon className={cn('h-4 w-4', finalIconColor)} />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            {title}
          </h4>
        </div>
        
        {/* Body */}
        <div className="space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
}
