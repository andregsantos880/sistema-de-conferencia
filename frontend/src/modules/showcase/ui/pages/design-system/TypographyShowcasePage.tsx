import React from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';

const TypographyShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Typography"
      description="Type scale, text styles, and formatting guidelines for the Katalyst Design System."
    >
      {/* Headings */}
      <ShowcaseSection
        title="Headings"
        description="Heading hierarchy from h1 to h6."
      >
        <CodeExample
          id="typography"
          title="Heading Scale"
          code={`<h1 className="text-4xl font-bold">Heading 1</h1>
<h2 className="text-3xl font-semibold">Heading 2</h2>
<h3 className="text-2xl font-semibold">Heading 3</h3>
<h4 className="text-xl font-semibold">Heading 4</h4>
<h5 className="text-lg font-medium">Heading 5</h5>
<h6 className="text-base font-medium">Heading 6</h6>`}
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Heading 1 — The quick brown fox</h1>
            <h2 className="text-3xl font-semibold tracking-tight">Heading 2 — The quick brown fox</h2>
            <h3 className="text-2xl font-semibold">Heading 3 — The quick brown fox</h3>
            <h4 className="text-xl font-semibold">Heading 4 — The quick brown fox</h4>
            <h5 className="text-lg font-medium">Heading 5 — The quick brown fox</h5>
            <h6 className="text-base font-medium">Heading 6 — The quick brown fox</h6>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Body Text */}
      <ShowcaseSection
        title="Body Text"
        description="Paragraph styles for different contexts."
      >
        <CodeExample
          id="typography"
          title="Paragraph Styles"
          code={`// Lead text
<p className="text-xl text-muted-foreground">Lead paragraph...</p>

// Regular body
<p className="text-base">Regular paragraph...</p>

// Small text
<p className="text-sm text-muted-foreground">Small text...</p>

// Extra small
<p className="text-xs text-muted-foreground">Extra small...</p>`}
        >
          <div className="space-y-6 max-w-2xl">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Lead Text (text-xl)</span>
              <p className="text-xl text-muted-foreground mt-1">
                This is lead text, typically used for introductory paragraphs or hero sections. It provides emphasis and draws the reader's attention.
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Body (text-base)</span>
              <p className="text-base mt-1">
                This is regular body text used for most content throughout the application. It maintains optimal readability at standard viewing distances and works well for longer passages of text.
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Small (text-sm)</span>
              <p className="text-sm text-muted-foreground mt-1">
                Small text is used for secondary information, captions, and helper text. It provides supporting context without competing with primary content.
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Extra Small (text-xs)</span>
              <p className="text-xs text-muted-foreground mt-1">
                Extra small text for labels, timestamps, and metadata. Use sparingly and ensure sufficient contrast.
              </p>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Inline Elements */}
      <ShowcaseSection
        title="Inline Elements"
        description="Text formatting for links, emphasis, and inline code."
      >
        <CodeExample
          id="typography"
          title="Text Formatting"
          code={`// Links
<a href="#" className="text-primary underline underline-offset-4 hover:text-primary/80">Link text</a>

// Bold
<strong className="font-semibold">Bold text</strong>

// Italic
<em className="italic">Italic text</em>

// Inline code
<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">code</code>

// Strikethrough
<del className="line-through">Deleted text</del>`}
        >
          <div className="space-y-4">
            <p>
              This is a paragraph with a{' '}
              <a href="#" className="text-primary underline underline-offset-4 hover:text-primary/80">
                link to somewhere
              </a>{' '}
              embedded in the text.
            </p>
            <p>
              You can use <strong className="font-semibold">bold text</strong> for emphasis or{' '}
              <em className="italic">italic text</em> for titles and foreign words.
            </p>
            <p>
              Use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">inline code</code> for
              variable names like <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">useState</code>.
            </p>
            <p>
              Mark removed content with <del className="line-through text-muted-foreground">strikethrough</del> and
              new content with <mark className="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">highlight</mark>.
            </p>
          </div>
        </CodeExample>

        <CodeExample
          id="typography"
          title="Blockquote"
          code={`<blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
  "Design is not just what it looks like and feels like. Design is how it works."
  <footer className="mt-2 text-sm">— Steve Jobs</footer>
</blockquote>`}
        >
          <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
            "Design is not just what it looks like and feels like. Design is how it works."
            <footer className="mt-2 text-sm not-italic">— Steve Jobs</footer>
          </blockquote>
        </CodeExample>
      </ShowcaseSection>

      {/* Lists */}
      <ShowcaseSection
        title="Lists"
        description="Ordered, unordered, and nested list styles."
      >
        <CodeExample
          id="typography"
          title="Unordered List"
          code={`<ul className="list-disc list-inside space-y-1">
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ul>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-medium mb-3">Unordered List</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Design system components</li>
                <li>Reusable UI patterns</li>
                <li>Consistent styling</li>
                <li>Accessible by default</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Ordered List</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Plan the feature</li>
                <li>Design the interface</li>
                <li>Implement the code</li>
                <li>Test and iterate</li>
              </ol>
            </div>
          </div>
        </CodeExample>

        <CodeExample
          id="typography"
          title="Nested Lists"
          code={`<ul className="list-disc list-inside space-y-2">
  <li>Parent item
    <ul className="list-circle list-inside ml-4 mt-1 space-y-1">
      <li>Child item</li>
      <li>Child item</li>
    </ul>
  </li>
</ul>`}
        >
          <ul className="space-y-2">
            <li className="flex flex-col">
              <span>Components</span>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-muted-foreground">
                <li>Buttons</li>
                <li>Forms</li>
                <li>Tables</li>
              </ul>
            </li>
            <li className="flex flex-col">
              <span>Primitives</span>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-muted-foreground">
                <li>Input</li>
                <li>Select</li>
                <li>Checkbox</li>
              </ul>
            </li>
          </ul>
        </CodeExample>

        <CodeExample
          id="typography"
          title="Description List"
          code={`<dl className="space-y-4">
  <div>
    <dt className="font-medium">Term</dt>
    <dd className="text-muted-foreground">Definition</dd>
  </div>
</dl>`}
        >
          <dl className="space-y-4">
            <div>
              <dt className="font-medium">Component</dt>
              <dd className="text-muted-foreground">A reusable piece of UI that encapsulates structure, style, and behavior.</dd>
            </div>
            <div>
              <dt className="font-medium">Primitive</dt>
              <dd className="text-muted-foreground">A low-level building block that provides basic functionality without opinions.</dd>
            </div>
            <div>
              <dt className="font-medium">Token</dt>
              <dd className="text-muted-foreground">A named value representing a design decision, such as a color or spacing unit.</dd>
            </div>
          </dl>
        </CodeExample>
      </ShowcaseSection>

      {/* Code Blocks */}
      <ShowcaseSection
        title="Code Blocks"
        description="Formatted code snippets with syntax highlighting."
      >
        <CodeExample
          id="typography"
          title="Code Block"
          code={`<pre className="bg-muted p-4 rounded-lg overflow-x-auto">
  <code className="text-sm font-mono">
    {codeString}
  </code>
</pre>`}
        >
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code className="text-sm font-mono text-foreground">{`import { Button } from '@/shared/ui/shadcn/components/ui/button';

export function MyComponent() {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return (
    <Button onClick={handleClick}>
      Click me
    </Button>
  );
}`}</code>
          </pre>
        </CodeExample>
      </ShowcaseSection>

      {/* Font Weights */}
      <ShowcaseSection
        title="Font Weights"
        description="Available font weight variations."
      >
        <CodeExample
          id="typography"
          title="Weight Scale"
          code={`<span className="font-thin">Thin (100)</span>
<span className="font-light">Light (300)</span>
<span className="font-normal">Normal (400)</span>
<span className="font-medium">Medium (500)</span>
<span className="font-semibold">Semibold (600)</span>
<span className="font-bold">Bold (700)</span>
<span className="font-extrabold">Extrabold (800)</span>`}
        >
          <div className="space-y-2 text-lg">
            <p className="font-thin">Thin (100) — The quick brown fox jumps over the lazy dog</p>
            <p className="font-light">Light (300) — The quick brown fox jumps over the lazy dog</p>
            <p className="font-normal">Normal (400) — The quick brown fox jumps over the lazy dog</p>
            <p className="font-medium">Medium (500) — The quick brown fox jumps over the lazy dog</p>
            <p className="font-semibold">Semibold (600) — The quick brown fox jumps over the lazy dog</p>
            <p className="font-bold">Bold (700) — The quick brown fox jumps over the lazy dog</p>
            <p className="font-extrabold">Extrabold (800) — The quick brown fox jumps over the lazy dog</p>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Text Colors */}
      <ShowcaseSection
        title="Text Colors"
        description="Semantic text color tokens."
      >
        <CodeExample
          id="typography"
          title="Color Variants"
          code={`<p className="text-foreground">Primary text</p>
<p className="text-muted-foreground">Muted text</p>
<p className="text-primary">Primary color</p>
<p className="text-destructive">Destructive</p>`}
        >
          <div className="space-y-2">
            <p className="text-foreground">text-foreground — Primary text for headings and body</p>
            <p className="text-muted-foreground">text-muted-foreground — Secondary text for descriptions</p>
            <p className="text-primary">text-primary — Accent text for links and emphasis</p>
            <p className="text-destructive">text-destructive — Error and warning messages</p>
            <p className="text-success">text-success — Success messages and confirmations</p>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default TypographyShowcasePage;

