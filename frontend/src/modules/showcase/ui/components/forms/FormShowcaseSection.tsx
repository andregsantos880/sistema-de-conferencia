import React from 'react';
import { cn } from '@/shadcn/lib/utils';
import { Card, CardContent, CardHeader } from '@/shadcn/components/ui/card';

// ============================================================================
// FORM SHOWCASE SECTION
// ============================================================================

interface FormShowcaseSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormShowcaseSection: React.FC<FormShowcaseSectionProps> = ({
  title,
  description,
  children,
  className,
}) => (
  <section className={cn('flex flex-col space-y-6', className)}>
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground max-w-3xl">{description}</p>
      )}
    </div>
    <div className="flex-1">{children}</div>
  </section>
);

// ============================================================================
// PRIMITIVE GRID - For displaying form primitives in a grid
// ============================================================================

interface PrimitiveGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const PrimitiveGrid: React.FC<PrimitiveGridProps> = ({
  children,
  columns = 2,
  className,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-8', gridCols[columns], className)}>
      {children}
    </div>
  );
};

// ============================================================================
// PRIMITIVE CARD - Individual card for each primitive
// ============================================================================

interface PrimitiveCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const PrimitiveCard: React.FC<PrimitiveCardProps> = ({
  title,
  description,
  children,
  className,
}) => (
  <Card className={cn('h-full', className)}>
    <CardHeader className="space-y-1 pb-4">
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </CardHeader>
    <CardContent className="space-y-6">{children}</CardContent>
  </Card>
);

// ============================================================================
// STATE DEMO - For showing different states of a component (Style Guide approach)
// ============================================================================

interface StateDemoProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  note?: string;
}

export const StateDemo: React.FC<StateDemoProps> = ({
  label,
  children,
  className,
  note,
}) => (
  <div className={cn('space-y-3', className)}>
    <div className="flex items-baseline justify-between">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      {note && (
        <div className="text-xs text-muted-foreground italic">
          {note}
        </div>
      )}
    </div>
    <div>{children}</div>
  </div>
);

// ============================================================================
// DIVIDER
// ============================================================================

export const FormDivider: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('border-t border-border', className)} />
);
