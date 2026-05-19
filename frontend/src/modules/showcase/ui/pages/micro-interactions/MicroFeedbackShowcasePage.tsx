import React, { useState } from 'react';
import { Check, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Progress } from '@/shared/ui/shadcn/components/ui/progress';
import { cn } from '@/shadcn/lib/utils';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const icons = {
    success: <Check className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 border rounded-lg shadow-lg',
        'animate-in slide-in-from-top-2 fade-in-0 duration-300',
        colors[type]
      )}
    >
      {icons[type]}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const MicroFeedbackShowcasePage: React.FC = () => {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const [inlineSuccess, setInlineSuccess] = useState(false);
  const [inlineError, setInlineError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProgressing, setIsProgressing] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerInlineSuccess = () => {
    setInlineSuccess(true);
    setTimeout(() => setInlineSuccess(false), 2000);
  };

  const triggerInlineError = () => {
    setInlineError(true);
    setTimeout(() => setInlineError(false), 3000);
  };

  const startProgress = () => {
    setProgress(0);
    setIsProgressing(true);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProgressing(false);
          showToast('Upload complete!', 'success');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <ShowcasePage
      title="Feedback & Status"
      description="Demonstrate polished feedback interactions - toast notifications, inline indicators, and progress transitions."
    >
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <ShowcaseSection
        title="Toast Notifications"
        description="Toast notifications slide in smoothly and auto-dismiss after a delay."
      >
        <CodeExample
          id="micro-interactions"
          title="Toast Entrance/Exit"
          code={`const [toasts, setToasts] = useState([]);

const showToast = (message, type) => {
  const id = Date.now();
  setToasts(prev => [...prev, { id, message, type }]);
  setTimeout(() => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, 3000);
};

// Toast component with animation
<div className={cn(
  "flex items-center gap-3 px-4 py-3 border rounded-lg shadow-lg",
  "animate-in slide-in-from-top-2 fade-in-0 duration-300",
  type === 'success' && "bg-green-50 border-green-200 text-green-800"
)}>
  <Check className="h-4 w-4" />
  <span>{message}</span>
  <button onClick={onClose}><X className="h-4 w-4" /></button>
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Toast Notifications</CardTitle>
              <p className="text-sm text-muted-foreground">Click buttons to trigger toast notifications</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => showToast('Changes saved successfully!', 'success')}
                className="transition-all duration-150 active:scale-[0.98]"
              >
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Success Toast
              </Button>
              <Button
                variant="outline"
                onClick={() => showToast('Something went wrong. Please try again.', 'error')}
                className="transition-all duration-150 active:scale-[0.98]"
              >
                <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                Error Toast
              </Button>
              <Button
                variant="outline"
                onClick={() => showToast('Your session will expire in 5 minutes.', 'info')}
                className="transition-all duration-150 active:scale-[0.98]"
              >
                <Info className="h-4 w-4 mr-2 text-blue-600" />
                Info Toast
              </Button>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Inline Success Indicators"
        description="Inline feedback that appears next to the action without disrupting flow."
      >
        <CodeExample
          id="micro-interactions"
          title="Inline Success Feedback"
          code={`const [showSuccess, setShowSuccess] = useState(false);

const handleSave = () => {
  // Save action...
  setShowSuccess(true);
  setTimeout(() => setShowSuccess(false), 2000);
};

<div className="flex items-center gap-3">
  <Button onClick={handleSave}>Save</Button>
  {showSuccess && (
    <span className="flex items-center gap-1 text-sm text-green-600 animate-in fade-in-0 duration-200">
      <Check className="h-4 w-4" />
      Saved!
    </span>
  )}
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Inline Success</CardTitle>
              <p className="text-sm text-muted-foreground">Click to see inline success feedback</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Button onClick={triggerInlineSuccess} className="transition-all duration-150 active:scale-[0.98]">
                  Save Changes
                </Button>
                {inlineSuccess && (
                  <span className="flex items-center gap-1 text-sm text-green-600 animate-in fade-in-0 slide-in-from-left-2 duration-200">
                    <Check className="h-4 w-4" />
                    Saved successfully!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={triggerInlineError} className="transition-all duration-150 active:scale-[0.98]">
                  Submit Form
                </Button>
                {inlineError && (
                  <span className="flex items-center gap-1 text-sm text-red-600 animate-in fade-in-0 slide-in-from-left-2 duration-200">
                    <AlertCircle className="h-4 w-4" />
                    Please fix errors above
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Error Callout Reveal"
        description="Error messages that appear with smooth animation to draw attention."
      >
        <CodeExample
          id="micro-interactions"
          title="Error Callout Animation"
          code={`const [showError, setShowError] = useState(false);

{showError && (
  <div className={cn(
    "p-4 border border-red-200 bg-red-50 rounded-lg",
    "animate-in fade-in-0 slide-in-from-top-2 duration-300"
  )}>
    <div className="flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
      <div>
        <h4 className="font-medium text-red-800">Error</h4>
        <p className="text-sm text-red-700">Something went wrong.</p>
      </div>
    </div>
  </div>
)}`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Error Callout</CardTitle>
              <p className="text-sm text-muted-foreground">Click to toggle error callout</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={() => setInlineError(!inlineError)}
                className="transition-all duration-150 active:scale-[0.98]"
              >
                {inlineError ? 'Hide Error' : 'Show Error'}
              </Button>

              {inlineError && (
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-800">Validation Error</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Please correct the following issues before submitting:
                      </p>
                      <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
                        <li>Email address is required</li>
                        <li>Password must be at least 8 characters</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Progress Indicator Transitions"
        description="Smooth progress bar animations for upload and processing tasks."
      >
        <CodeExample
          id="micro-interactions"
          title="Progress Bar Animation"
          code={`const [progress, setProgress] = useState(0);
const [isProgressing, setIsProgressing] = useState(false);

const startProgress = () => {
  setProgress(0);
  setIsProgressing(true);
  const interval = setInterval(() => {
    setProgress(prev => {
      if (prev >= 100) {
        clearInterval(interval);
        setIsProgressing(false);
        return 100;
      }
      return prev + 10;
    });
  }, 300);
};

<div className="space-y-2">
  <Progress value={progress} className="transition-all duration-300" />
  <p className="text-sm text-muted-foreground">
    {progress}% complete
  </p>
</div>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Progress Indicators</CardTitle>
              <p className="text-sm text-muted-foreground">Click to start progress animation</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Upload Progress</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 transition-all duration-300" />
                <Button
                  onClick={startProgress}
                  disabled={isProgressing}
                  className="transition-all duration-150 active:scale-[0.98]"
                >
                  {isProgressing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : progress === 100 ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Complete!
                    </>
                  ) : (
                    'Start Upload'
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse w-full" />
                </div>
                <p className="text-xs text-muted-foreground">Indeterminate progress indicator</p>
              </div>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default MicroFeedbackShowcasePage;
