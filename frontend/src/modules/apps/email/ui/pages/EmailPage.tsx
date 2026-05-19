import { useState } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { FolderList } from '../components/FolderList';
import { MessageList } from '../components/MessageList';
import { ComposeModal } from '../components/ComposeModal';
import { EmailListView } from '../components/EmailListView';
import { EmailDetailView } from '../components/EmailDetailView';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { Drawer, DrawerContent, DrawerTrigger } from '@/shared/ui/shadcn/components/ui/drawer';
import { Card } from '@/shared/ui/shadcn/components/ui/card';
import type { MailTray } from '../../domain/models/Email';

export function EmailPage() {
  const isMobile = !useMediaQuery('(min-width: 768px)');
  const location = useLocation();
  const [composeOpen, setComposeOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  // Extract tray and messageId from pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const tray = (pathParts[2] || 'inbox') as MailTray;

  const handleSelectMessage = (id: string) => {
    setSelectedMessageId(id);
  };

  const handleBackToList = () => {
    setSelectedMessageId(null);
  };

  // Desktop layout - two columns: sidebar + content area with sliding animation
  if (!isMobile) {
    return (
      <>
        <div className="h-full">
          <Card className="flex h-full py-0 gap-0 flex-row overflow-hidden">
            {/* Left: Folders sidebar */}
            <div className="w-56 flex-shrink-0 border-r h-full overflow-hidden bg-muted/30">
              <FolderList
                activeTray={tray}
                onNewMessage={() => setComposeOpen(true)}
              />
            </div>

            {/* Right: Content area - email list or detail view with sliding animation */}
            <div className="flex-1 min-w-0 bg-background h-full overflow-hidden relative">
              <AnimatePresence mode="wait" initial={false}>
                {selectedMessageId ? (
                  <motion.div
                    key="detail"
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    <EmailDetailView
                      messageId={selectedMessageId}
                      onBack={handleBackToList}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '-100%', opacity: 0 }}
                    transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    <EmailListView
                      tray={tray}
                      onSelectMessage={handleSelectMessage}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        <ComposeModal isOpen={composeOpen} onClose={() => setComposeOpen(false)} />
      </>
    );
  }

  // Mobile layout - wrapped in Card for consistency
  return (
    <>
      <Card className="h-full relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            {/* List View */}
            <Route
              path="/"
              element={
                <MobileScreen>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 p-4 border-b">
                      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                        <DrawerTrigger asChild>
                          <button className="p-2 hover:bg-accent rounded-lg">
                            <Menu className="size-5" />
                          </button>
                        </DrawerTrigger>
                        <DrawerContent className="p-0">
                          <FolderList
                            activeTray={tray}
                            onNewMessage={() => {
                              setComposeOpen(true);
                              setDrawerOpen(false);
                            }}
                            onClose={() => setDrawerOpen(false)}
                          />
                        </DrawerContent>
                      </Drawer>
                      <h1 className="text-xl font-semibold">Email</h1>
                    </div>
                    <MessageList tray="inbox" />
                  </div>
                </MobileScreen>
              }
            />

            <Route
              path="/:tray"
              element={
                <MobileScreen>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 p-4 border-b">
                      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                        <DrawerTrigger asChild>
                          <button className="p-2 hover:bg-accent rounded-lg">
                            <Menu className="size-5" />
                          </button>
                        </DrawerTrigger>
                        <DrawerContent className="p-0">
                          <FolderList
                            activeTray={tray}
                            onNewMessage={() => {
                              setComposeOpen(true);
                              setDrawerOpen(false);
                            }}
                            onClose={() => setDrawerOpen(false)}
                          />
                        </DrawerContent>
                      </Drawer>
                      <h1 className="text-xl font-semibold capitalize">{tray}</h1>
                    </div>
                    <MessageList tray={tray} />
                  </div>
                </MobileScreen>
              }
            />

            <Route
              path="/:tray/:id"
              element={
                <MobileScreen>
                  <MobileEmailDetail />
                </MobileScreen>
              }
            />
          </Routes>
        </AnimatePresence>
      </Card>

      <ComposeModal isOpen={composeOpen} onClose={() => setComposeOpen(false)} />
    </>
  );
}

// Wrapper component for mobile email detail that handles URL-based navigation
function MobileEmailDetail() {
  const { tray, id } = useParams<{ tray: string; id: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/apps/email/${tray || 'inbox'}`);
  };

  if (!id) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No message selected</div>;
  }

  return <EmailDetailView messageId={id} onBack={handleBack} />;
}

function MobileScreen({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return <div className="h-full">{children}</div>;
  }

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="absolute inset-0"
    >
      {children}
    </motion.div>
  );
}
