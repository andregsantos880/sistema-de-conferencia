import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ConversationList } from '../components/ConversationList';
import { MessageThread } from '../components/MessageThread';
import { ContactInfoPanel } from '../components/ContactInfoPanel';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { Card } from '@/shared/ui/shadcn/components/ui/card';

export function ChatPage() {
  const isMobile = !useMediaQuery('(min-width: 992px)');
  const [contactInfoOpen, setContactInfoOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract convId from pathname since useParams doesn't work with wildcard routes
  // Path format: /apps/chat/:convId or /apps/chat/:convId/info
  const pathParts = location.pathname.split('/').filter(Boolean);
  const convId = pathParts[2]; // Index 0: 'apps', 1: 'chat', 2: convId

  // Determine if we're on the contact info route
  const isContactInfoRoute = location.pathname.endsWith('/info');

  // Close contact info panel when switching to a different conversation
  // This ensures the panel doesn't persist when navigating between chats
  useEffect(() => {
    if (!isContactInfoRoute) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: close info panel when conversation changes for cleaner UX
      setContactInfoOpen(false);
    }
  }, [convId, isContactInfoRoute]);

  const handleAvatarClick = () => {
    if (isMobile) {
      navigate(`/apps/chat/${convId}/info`);
    } else {
      setContactInfoOpen(!contactInfoOpen);
    }
  };

  const handleCloseContactInfo = () => {
    if (isMobile) {
      navigate(`/apps/chat/${convId}`);
    } else {
      setContactInfoOpen(false);
    }
  };

  // Desktop layout - wrapped in a Card for the full-screen chat experience
  // The parent layout provides fixed-height behavior via layoutBehavior='fixed-height'
  if (!isMobile) {
    return (
      <div className="h-full">
        <Card className="flex h-full py-0 gap-0 flex-row overflow-hidden">
          {/* Left: Conversations */}
          <div className="w-80 flex-shrink-0 border-r h-full overflow-hidden bg-muted/30">
            <ConversationList activeConvId={convId} />
          </div>

          {/* Center: Thread - needs to be inside Routes to get params */}
          <div className="flex-1 min-w-0 bg-background h-full overflow-hidden">
            <Routes>
              <Route path="/" element={<MessageThread onAvatarClick={handleAvatarClick} />} />
              <Route path="/:convId" element={<MessageThread onAvatarClick={handleAvatarClick} />} />
              <Route path="/:convId/info" element={<MessageThread onAvatarClick={handleAvatarClick} />} />
            </Routes>
          </div>

          {/* Right: Contact Info - inline panel */}
          <ContactInfoPanel
            isOpen={contactInfoOpen}
            onClose={handleCloseContactInfo}
            convId={convId}
          />
        </Card>
      </div>
    );
  }

  // Mobile layout with route-based navigation - wrapped in Card for consistency
  return (
    <Card className="h-full relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* List View */}
          <Route
            path="/"
            element={
              <MobileScreen direction="left">
                <ConversationList />
              </MobileScreen>
            }
          />

          {/* Thread View */}
          <Route
            path="/:convId"
            element={
              <MobileScreen direction="left">
                <MessageThread onAvatarClick={handleAvatarClick} isMobile />
              </MobileScreen>
            }
          />

          {/* Contact Info View */}
          <Route
            path="/:convId/info"
            element={
              <MobileScreen direction="left">
                <ContactInfoPanel
                  isOpen={true}
                  onClose={handleCloseContactInfo}
                  isMobile
                />
              </MobileScreen>
            }
          />
        </Routes>
      </AnimatePresence>
    </Card>
  );
}

interface MobileScreenProps {
  children: React.ReactNode;
  direction: 'left' | 'right';
}

function MobileScreen({ children, direction }: MobileScreenProps) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return <div className="h-full">{children}</div>;
  }

  return (
    <motion.div
      initial={{ x: direction === 'left' ? '100%' : '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction === 'left' ? '-100%' : '100%', opacity: 0 }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="absolute inset-0"
    >
      {children}
    </motion.div>
  );
}
