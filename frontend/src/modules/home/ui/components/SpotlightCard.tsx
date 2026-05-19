import React from "react";
import { Card } from "@/shared/ui/shadcn/components/ui/card";
import { cn } from "@/shadcn/lib/utils";

interface SpotlightCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode;
}

export function SpotlightCard({ className, children, ...props }: SpotlightCardProps) {
  return <Card 
      className={cn(
        // 1. Layout & Overflow
        "relative overflow-hidden border-0",

        // 2. Base Background Colors (Light vs Dark)
        "bg-slate-100",
        "dark:bg-card",

        // 3. Halo Effect (Ring + Colored Shadow)
        // Light Theme: Soft, tenuous glow
        "ring-1 ring-slate-400/20 shadow-sm",

        // Dark Theme: Stronger, more defined halo
        "dark:ring-white/5",
        "dark:border dark:border-white/10", // Subtle transparent border

        // 4. Spotlight Gradient (Top-Left)
        // Uses a pseudo-element (before) so it doesn't interfere with content
        "before:absolute before:inset-0 before:pointer-events-none",
        
        // Light Spotlight: Very subtle purple/indigo top-left
        "before:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08)_0%,transparent_40%)]",
        
        // Dark Spotlight: Brighter, deeper top-left glow matching reference
        "dark:before:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15)_0%,transparent_50%)]",

        className
      )}
      {...props}
    >
        <div className="relative z-10 h-full">
            {children}
        </div>
    </Card>
};

export default SpotlightCard;
