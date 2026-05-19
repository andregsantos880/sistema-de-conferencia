import React from 'react';
import { toast } from 'sonner';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Button } from '@/shared/ui/shadcn/components/ui/button';

const ToastsShowcasePage: React.FC = () => {
  return (
    <ShowcasePage
      title="Toasts"
      description="Toast notifications for temporary feedback messages."
    >
      <ShowcaseSection
        title="Toast Types"
        description="Different toast styles for various feedback types."
      >
        <CodeExample
          id="toasts"
          title="Toast Notifications"
          code={`import { toast } from 'sonner';

// Default toast
toast('Event has been created');

// Success toast
toast.success('Successfully saved!');

// Error toast
toast.error('Something went wrong');

// Info toast
toast.info('Did you know?');

// Warning toast
toast.warning('Please be careful');`}
        >
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => toast('Event has been created')}
            >
              Default
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success('Successfully saved!')}
            >
              Success
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.error('Something went wrong')}
            >
              Error
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info('Did you know?')}
            >
              Info
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.warning('Please be careful')}
            >
              Warning
            </Button>
          </div>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Toast with Description"
        description="Toasts can include additional description text."
      >
        <CodeExample
          id="toasts-description"
          title="Toast with Description"
          code={`toast.success('File uploaded', {
  description: 'Your file has been uploaded successfully.',
});`}
        >
          <Button
            onClick={() =>
              toast.success('File uploaded', {
                description: 'Your file has been uploaded successfully.',
              })
            }
          >
            Show Toast with Description
          </Button>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default ToastsShowcasePage;

