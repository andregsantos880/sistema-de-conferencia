import React, { useState } from 'react';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/shared/ui/shadcn/components/ui/collapsible';
import { Code, Copy, Check } from 'lucide-react';

interface RequestPreviewProps {
  data: any;
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}

export const RequestPreview: React.FC<RequestPreviewProps> = ({ 
  data, 
  title = "API Payload Preview",
  defaultOpen = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-end mb-2">
         <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs h-8 text-muted-foreground hover:text-foreground"
          >
            <Code className="mr-2 h-3 w-3" />
            {isOpen ? 'Hide' : 'Show'} {title}
          </Button>
      </div>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div className="rounded-lg border bg-muted/50 p-4 relative group">
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">JSON</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <pre className="text-xs overflow-x-auto text-muted-foreground font-mono leading-relaxed p-2">
              <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
