import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';

interface NavigationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconGradient?: string;
  badges?: Array<{ label: string; className?: string }>;
  onClick: () => void;
}

export function NavigationCard({
  title,
  description,
  icon: Icon,
  iconGradient = 'from-primary to-primary/70',
  badges,
  onClick,
}: NavigationCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div
            className={cn(
              'h-12 w-12 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg',
              iconGradient
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {badges && badges.length > 0 && (
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <Badge key={index} variant="secondary" className={badge.className}>
                {badge.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default NavigationCard;
