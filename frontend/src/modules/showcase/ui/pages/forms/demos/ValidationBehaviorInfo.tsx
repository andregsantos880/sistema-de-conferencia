import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/shadcn/components/ui/card';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { Zap } from 'lucide-react';

export const ValidationBehaviorInfo: React.FC = () => {
  return (
    <Card className="bg-muted/30 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Validation Behavior
        </CardTitle>
        <CardDescription>
          Best practices implemented in these demos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex gap-3 items-start">
          <Badge variant="outline" className="mt-0.5 shrink-0">Trigger</Badge>
          <div>
            <p className="font-medium">onChange vs onBlur</p>
            <p className="text-muted-foreground text-xs mt-1">
              Field-level validation runs <code>onChange</code> for immediate feedback, while form-level submission handles the rest.
            </p>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <Badge variant="outline" className="mt-0.5 shrink-0">Schema</Badge>
          <div>
            <p className="font-medium">Zod Definitions</p>
            <p className="text-muted-foreground text-xs mt-1">
              Validation logic is decoupled from UI using Zod schemas, ensuring consistency and reusability.
            </p>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <Badge variant="outline" className="mt-0.5 shrink-0">Status</Badge>
          <div>
            <p className="font-medium">Visual Feedback</p>
            <p className="text-muted-foreground text-xs mt-1">
              Fields use color-coded borders and icons (Success/Error/Warning) to communicate state clearly.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
