import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';

type ColorSwatchProps = {
  name: string;
  cssVar: string;
  textClass?: string;
};

const ColorSwatch = ({ name, cssVar, textClass = 'text-foreground' }: ColorSwatchProps) => (
  <div className="flex flex-col">
    <div
      className="h-16 w-full rounded-lg border shadow-sm"
      style={{ backgroundColor: `var(${cssVar})` }}
    />
    <div className="mt-2">
      <p className={`text-sm font-medium ${textClass}`}>{name}</p>
      <p className="text-xs text-muted-foreground font-mono">{cssVar}</p>
    </div>
  </div>
);

const ColorPair = ({ name, bgVar, fgVar }: { name: string; bgVar: string; fgVar: string }) => (
  <div className="flex flex-col">
    <div
      className="h-16 w-full rounded-lg border shadow-sm flex items-center justify-center"
      style={{ backgroundColor: `var(${bgVar})`, color: `var(${fgVar})` }}
    >
      <span className="text-sm font-medium">Aa</span>
    </div>
    <div className="mt-2">
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-muted-foreground font-mono">{bgVar}</p>
    </div>
  </div>
);

const ColorsShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Colors"
      description="The complete color system for the Katalyst Design System, including brand colors, semantic tokens, and gradients."
    >
      {/* Brand Palette */}
      <ShowcaseSection
        title="Brand Palette"
        description="Core brand colors used throughout the application."
      >
        <CodeExample
          id="colors"
          title="Primary & Secondary"
          code={`// CSS Variables
--primary: oklch(0.488 0.243 264.38);
--primary-foreground: oklch(0.985 0 0);
--secondary: oklch(0.96 0.02 264.38);
--secondary-foreground: oklch(0.205 0 0);

// Usage in Tailwind
<div className="bg-primary text-primary-foreground">Primary</div>
<div className="bg-secondary text-secondary-foreground">Secondary</div>`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <ColorPair name="Primary" bgVar="--primary" fgVar="--primary-foreground" />
            <ColorPair name="Secondary" bgVar="--secondary" fgVar="--secondary-foreground" />
            <ColorPair name="Accent" bgVar="--accent" fgVar="--accent-foreground" />
            <ColorPair name="Muted" bgVar="--muted" fgVar="--muted-foreground" />
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Background & Surface */}
      <ShowcaseSection
        title="Background & Surface"
        description="Background tokens for different elevation levels."
      >
        <CodeExample
          id="colors"
          title="Surface Colors"
          code={`--background: oklch(98.5% 0.002 247.839);
--card: oklch(1 0 0);
--popover: oklch(1 0 0);

// Usage
<div className="bg-background">Page background</div>
<div className="bg-card">Card surface</div>
<div className="bg-popover">Popover surface</div>`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <ColorSwatch name="Background" cssVar="--background" />
            <ColorSwatch name="Card" cssVar="--card" />
            <ColorSwatch name="Popover" cssVar="--popover" />
            <ColorSwatch name="Muted" cssVar="--muted" />
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Semantic Colors */}
      <ShowcaseSection
        title="Semantic Colors"
        description="Status and feedback colors for user interactions."
      >
        <CodeExample
          id="colors"
          title="Status Colors"
          code={`--info: oklch(0.623 0.214 259.815);
--success: oklch(0.7205 0.192 149.49);
--warning: oklch(0.7697 0.1645 70.61);
--destructive: oklch(0.6356 0.2082 25.38);

// Usage
<Badge className="bg-info text-info-foreground">Info</Badge>
<Badge className="bg-success text-success-foreground">Success</Badge>
<Badge className="bg-warning text-warning-foreground">Warning</Badge>
<Badge className="bg-destructive text-white">Error</Badge>`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            <ColorPair name="Info" bgVar="--info" fgVar="--info-foreground" />
            <ColorPair name="Success" bgVar="--success" fgVar="--success-foreground" />
            <ColorPair name="Warning" bgVar="--warning" fgVar="--warning-foreground" />
            <ColorPair name="Destructive" bgVar="--destructive" fgVar="--primary-foreground" />
            <ColorPair name="Danger" bgVar="--danger" fgVar="--primary-foreground" />
          </div>
        </CodeExample>

        <CodeExample
          id="colors"
          title="Border & Input"
          code={`--border: oklch(0.922 0 0);
--input: oklch(0.922 0 0);
--ring: oklch(0.708 0 0);`}
        >
          <div className="grid grid-cols-3 gap-6">
            <ColorSwatch name="Border" cssVar="--border" />
            <ColorSwatch name="Input" cssVar="--input" />
            <ColorSwatch name="Ring" cssVar="--ring" />
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Chart Colors */}
      <ShowcaseSection
        title="Chart Colors"
        description="Data visualization color palette."
      >
        <CodeExample
          id="colors"
          title="Chart Palette"
          code={`--chart-1: oklch(0.488 0.243 264.38);
--chart-2: oklch(0.60 0.20 280);
--chart-3: oklch(0.65 0.20 320);
--chart-4: oklch(0.70 0.18 360);
--chart-5: oklch(0.75 0.16 40);

// Usage with Recharts
<Line stroke="var(--chart-1)" />
<Bar fill="var(--chart-2)" />`}
        >
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            <ColorSwatch name="Chart 1" cssVar="--chart-1" />
            <ColorSwatch name="Chart 2" cssVar="--chart-2" />
            <ColorSwatch name="Chart 3" cssVar="--chart-3" />
            <ColorSwatch name="Chart 4" cssVar="--chart-4" />
            <ColorSwatch name="Chart 5" cssVar="--chart-5" />
            <ColorSwatch name="Chart 6" cssVar="--chart-6" />
            <ColorSwatch name="Chart 7" cssVar="--chart-7" />
            <ColorSwatch name="Chart 8" cssVar="--chart-8" />
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Sidebar Colors */}
      <ShowcaseSection
        title="Sidebar Colors"
        description="Dedicated color tokens for the sidebar navigation."
      >
        <CodeExample
          id="colors"
          title="Sidebar Palette"
          code={`--sidebar: oklch(0.985 0 0);
--sidebar-foreground: oklch(0.145 0 0);
--sidebar-primary: oklch(0.205 0 0);
--sidebar-accent: oklch(0.97 0 0);`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <ColorPair name="Sidebar" bgVar="--sidebar" fgVar="--sidebar-foreground" />
            <ColorPair name="Sidebar Primary" bgVar="--sidebar-primary" fgVar="--sidebar-primary-foreground" />
            <ColorPair name="Sidebar Accent" bgVar="--sidebar-accent" fgVar="--sidebar-accent-foreground" />
            <ColorSwatch name="Sidebar Border" cssVar="--sidebar-border" />
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Gradients */}
      <ShowcaseSection
        title="Gradients"
        description="Gradient combinations for visual interest."
      >
        <CodeExample
          id="colors"
          title="Linear Gradients"
          code={`// Primary gradient
<div className="bg-gradient-to-r from-primary to-primary/60" />

// Accent gradient
<div className="bg-gradient-to-br from-chart-1 to-chart-4" />

// Subtle gradient
<div className="bg-gradient-to-b from-background to-muted" />`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="h-24 rounded-lg bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
              <span className="text-primary-foreground font-medium">Primary Gradient</span>
            </div>
            <div className="h-24 rounded-lg bg-gradient-to-br from-[var(--chart-1)] to-[var(--chart-4)] flex items-center justify-center">
              <span className="text-white font-medium">Chart Gradient</span>
            </div>
            <div className="h-24 rounded-lg bg-gradient-to-b from-background to-muted border flex items-center justify-center">
              <span className="text-foreground font-medium">Subtle Gradient</span>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Opacity Variants */}
      <ShowcaseSection
        title="Opacity Variants"
        description="Color opacity variations for overlays and backgrounds."
      >
        <CodeExample
          id="colors"
          title="Opacity Scale"
          code={`// Tailwind opacity utilities
<div className="bg-primary/10" />
<div className="bg-primary/25" />
<div className="bg-primary/50" />
<div className="bg-primary/75" />
<div className="bg-primary/100" />`}
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              {[10, 25, 50, 75, 100].map((opacity) => (
                <div key={opacity} className="flex-1 flex flex-col items-center">
                  <div
                    className="h-12 w-full rounded-lg border"
                    style={{ backgroundColor: `oklch(0.488 0.243 264.38 / ${opacity}%)` }}
                  />
                  <span className="text-xs text-muted-foreground mt-1">{opacity}%</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {[10, 25, 50, 75, 100].map((opacity) => (
                <div key={opacity} className="flex-1 flex flex-col items-center">
                  <div
                    className="h-12 w-full rounded-lg border"
                    style={{ backgroundColor: `oklch(0.60 0.20 280 / ${opacity}%)` }}
                  />
                  <span className="text-xs text-muted-foreground mt-1">{opacity}%</span>
                </div>
              ))}
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Glassmorphism & Spotlights */}
      <ShowcaseSection
        title="Spotlights & Glassmorphism"
        description="Advanced visual effects for modern UI."
      >
        <CodeExample
          id="colors"
          title="Glass Effects"
          code={`// Glassmorphism
<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl" />

// Spotlight effect
<div className="relative overflow-hidden">
  <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
</div>`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Glassmorphism */}
            <div className="relative h-40 rounded-xl bg-gradient-to-br from-[var(--chart-1)] to-[var(--chart-4)] p-4 overflow-hidden">
              <div className="absolute inset-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-medium">Glassmorphism</span>
              </div>
            </div>
            {/* Spotlight */}
            <div className="relative h-40 rounded-xl bg-card border overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--chart-1)]/20 rounded-full blur-3xl" />
              <div className="relative h-full flex items-center justify-center">
                <span className="text-foreground font-medium">Spotlight Effect</span>
              </div>
            </div>
          </div>
        </CodeExample>

        <CodeExample
          id="colors"
          title="Overlay Variants"
          code={`// Dark overlay
<div className="bg-black/50" />

// Light overlay
<div className="bg-white/50" />

// Colored overlay
<div className="bg-primary/30" />`}
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="relative h-24 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--chart-1)] to-[var(--chart-2)]" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-sm font-medium">Dark Overlay</span>
              </div>
            </div>
            <div className="relative h-24 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--chart-3)] to-[var(--chart-4)]" />
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <span className="text-foreground text-sm font-medium">Light Overlay</span>
              </div>
            </div>
            <div className="relative h-24 rounded-lg overflow-hidden border">
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <span className="text-foreground text-sm font-medium">Tinted Overlay</span>
              </div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default ColorsShowcasePage;

