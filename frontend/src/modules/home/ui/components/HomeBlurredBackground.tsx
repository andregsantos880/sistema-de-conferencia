import { cn } from '@/shadcn/lib/utils';

interface HomeBlurredBackgroundProps {
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  variant?: 'blue' | 'purple' | 'indigo' | 'default';
}

export function HomeBlurredBackground({ 
  className, 
  intensity = 'medium',
  variant = 'default'
}: HomeBlurredBackgroundProps) {
  
  const opacityMap = {
    low: 'opacity-20',
    medium: 'opacity-30',
    high: 'opacity-40',
  };

  const colorMap = {
    default: 'from-primary/30 to-purple-500/30',
    blue: 'from-blue-500/30 to-cyan-500/30',
    purple: 'from-purple-500/30 to-pink-500/30',
    indigo: 'from-indigo-500/30 to-blue-500/30',
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Top Left Blob */}
      <div className={cn(
        "absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl",
        "bg-gradient-to-br",
        colorMap[variant],
        opacityMap[intensity]
      )} />
      
      {/* Bottom Right Blob - smaller */}
      <div className={cn(
        "absolute -bottom-12 -right-12 w-64 h-64 rounded-full blur-2xl",
        "bg-gradient-to-tl from-white/5 to-white/0", // Subtle highlight
        opacityMap['low']
      )} />
    </div>
  );
}

export default HomeBlurredBackground;
