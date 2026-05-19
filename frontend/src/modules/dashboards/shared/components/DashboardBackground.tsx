import { cn } from '@/shadcn/lib/utils';
import { useMemo } from 'react';

export type BackgroundVariant = 'ecommerce' | 'executive' | 'projects' | 'sales';

interface DashboardBackgroundProps {
  variant?: BackgroundVariant;
  className?: string;
}

export function DashboardBackground({ variant = 'ecommerce', className }: DashboardBackgroundProps) {
  const configs = useMemo(() => {
    switch (variant) {
      case 'ecommerce':
        return {
          blob1: 'bg-indigo-500/5 top-[-10%] left-[20%]',
          blob2: 'bg-purple-500/5 bottom-[-10%] right-[20%]',
        };
      case 'executive':
        return {
          blob1: 'bg-emerald-500/5 top-[10%] right-[10%]',
          blob2: 'bg-blue-500/5 bottom-[20%] left-[20%]',
        };
      case 'projects':
        return {
          blob1: 'bg-orange-500/5 top-[20%] left-[10%]',
          blob2: 'bg-blue-500/5 bottom-[20%] right-[10%]',
        };
      case 'sales':
        return {
          blob1: 'bg-red-500/5 top-[5%] left-[30%]',
          blob2: 'bg-amber-500/5 bottom-[10%] right-[20%]',
        };
      default:
        return {
          blob1: 'bg-primary/5 top-[-10%] left-[20%]',
          blob2: 'bg-primary/5 bottom-[-10%] right-[20%]',
        };
    }
  }, [variant]);

  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden pointer-events-none", className)}>
      <div className={cn("absolute w-[600px] h-[600px] rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob", configs.blob1)} />
      <div className={cn("absolute w-[500px] h-[500px] rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000", configs.blob2)} />
    </div>
  );
}
