import React, { useState } from 'react';
import { Check, Loader2, Download, Send, Heart, Plus, Trash2 } from 'lucide-react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { cn } from '@/shadcn/lib/utils';

const MicroButtonsShowcasePage: React.FC = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [successStates, setSuccessStates] = useState<Record<string, boolean>>({});
  const [likedStates, setLikedStates] = useState<Record<string, boolean>>({});

  const simulateAction = (id: string, duration = 1500) => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }));
    setSuccessStates((prev) => ({ ...prev, [id]: false }));

    setTimeout(() => {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
      setSuccessStates((prev) => ({ ...prev, [id]: true }));

      setTimeout(() => {
        setSuccessStates((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    }, duration);
  };

  const toggleLike = (id: string) => {
    setLikedStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ShowcasePage
      title="Buttons & Actions"
      description="Demonstrate subtle, polished micro-interactions for buttons - hover states, press feedback, loading transitions, and success confirmations."
    >
      <ShowcaseSection
        title="Hover & Press States"
        description="Buttons respond immediately to hover and press with subtle visual feedback."
      >
        <CodeExample
          id="micro-interactions"
          title="Hover & Active States"
          code={`// CSS transitions handle hover/active states automatically
// Tailwind classes: hover:bg-primary/90 active:scale-[0.98]

<Button className="transition-all duration-150 active:scale-[0.98]">
  Default Button
</Button>

<Button variant="outline" className="transition-all duration-150 hover:bg-accent active:scale-[0.98]">
  Outline Button
</Button>

<Button variant="ghost" className="transition-all duration-150 active:scale-[0.98]">
  Ghost Button
</Button>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Hover & Press Feedback</CardTitle>
              <p className="text-sm text-muted-foreground">Hover and click to see the subtle feedback</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button className="transition-all duration-150 active:scale-[0.98]">
                Default Button
              </Button>
              <Button variant="outline" className="transition-all duration-150 active:scale-[0.98]">
                Outline Button
              </Button>
              <Button variant="secondary" className="transition-all duration-150 active:scale-[0.98]">
                Secondary Button
              </Button>
              <Button variant="ghost" className="transition-all duration-150 active:scale-[0.98]">
                Ghost Button
              </Button>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Loading Transitions"
        description="Smooth transitions from idle to loading state with spinner animation."
      >
        <CodeExample
          id="micro-interactions"
          title="Loading Button States"
          code={`const [isLoading, setIsLoading] = useState(false);

const handleClick = () => {
  setIsLoading(true);
  setTimeout(() => setIsLoading(false), 1500);
};

<Button onClick={handleClick} disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Loading States</CardTitle>
              <p className="text-sm text-muted-foreground">Click buttons to see loading transitions</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button
                onClick={() => simulateAction('save')}
                disabled={loadingStates.save}
                className="min-w-[120px] transition-all duration-150"
              >
                {loadingStates.save ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : successStates.save ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => simulateAction('download')}
                disabled={loadingStates.download}
                className="min-w-[140px] transition-all duration-150"
              >
                {loadingStates.download ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : successStates.download ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={() => simulateAction('send')}
                disabled={loadingStates.send}
                className="min-w-[100px] transition-all duration-150"
              >
                {loadingStates.send ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : successStates.send ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Success Confirmation"
        description="Visual confirmation when an action completes successfully."
      >
        <CodeExample
          id="micro-interactions"
          title="Success Feedback"
          code={`const [success, setSuccess] = useState(false);

const handleAction = () => {
  // Perform action...
  setSuccess(true);
  setTimeout(() => setSuccess(false), 2000);
};

<Button
  onClick={handleAction}
  className={cn(
    "transition-all duration-200",
    success && "bg-green-600 hover:bg-green-600"
  )}
>
  {success ? (
    <>
      <Check className="h-4 w-4 mr-2" />
      Done!
    </>
  ) : (
    'Confirm Action'
  )}
</Button>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Success Confirmation</CardTitle>
              <p className="text-sm text-muted-foreground">Click to see success feedback</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button
                onClick={() => simulateAction('confirm', 500)}
                disabled={loadingStates.confirm}
                className={cn(
                  "min-w-[140px] transition-all duration-200",
                  successStates.confirm && "bg-green-600 hover:bg-green-600"
                )}
              >
                {loadingStates.confirm ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : successStates.confirm ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Confirmed!
                  </>
                ) : (
                  'Confirm Action'
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => simulateAction('add', 300)}
                disabled={loadingStates.add}
                className={cn(
                  "min-w-[100px] transition-all duration-200",
                  successStates.add && "border-green-600 text-green-600"
                )}
              >
                {successStates.add ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Added!
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Toggle Actions"
        description="Buttons that toggle state with immediate visual feedback."
      >
        <CodeExample
          id="micro-interactions"
          title="Toggle Button States"
          code={`const [liked, setLiked] = useState(false);

<Button
  variant={liked ? "default" : "outline"}
  onClick={() => setLiked(!liked)}
  className="transition-all duration-150"
>
  <Heart className={cn("h-4 w-4 mr-2", liked && "fill-current")} />
  {liked ? 'Liked' : 'Like'}
</Button>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Toggle Actions</CardTitle>
              <p className="text-sm text-muted-foreground">Click to toggle state</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button
                variant={likedStates.heart1 ? "default" : "outline"}
                onClick={() => toggleLike('heart1')}
                className="transition-all duration-150 active:scale-[0.95]"
              >
                <Heart className={cn("h-4 w-4 mr-2 transition-all", likedStates.heart1 && "fill-current")} />
                {likedStates.heart1 ? 'Liked' : 'Like'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleLike('heart2')}
                className={cn(
                  "transition-all duration-150 active:scale-[0.9]",
                  likedStates.heart2 && "text-red-500"
                )}
              >
                <Heart className={cn("h-5 w-5 transition-all", likedStates.heart2 && "fill-current")} />
              </Button>

              <Button
                variant={likedStates.follow ? "secondary" : "outline"}
                onClick={() => toggleLike('follow')}
                className="transition-all duration-150"
              >
                {likedStates.follow ? 'Following' : 'Follow'}
              </Button>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>

      <ShowcaseSection
        title="Destructive Actions"
        description="Careful feedback for destructive actions to prevent mistakes."
      >
        <CodeExample
          id="micro-interactions"
          title="Destructive Button Feedback"
          code={`<Button
  variant="outline"
  className="text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-150"
>
  <Trash2 className="h-4 w-4 mr-2" />
  Delete
</Button>`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Destructive Actions</CardTitle>
              <p className="text-sm text-muted-foreground">Hover to see warning feedback</p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-150 active:scale-[0.98]"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 transition-all duration-150 active:scale-[0.95]"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default MicroButtonsShowcasePage;
