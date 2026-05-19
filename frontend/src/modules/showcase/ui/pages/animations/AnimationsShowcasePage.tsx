import React, { useState } from 'react';
import { ShowcasePage, ShowcaseSection } from '../../components';
import CodeExample from '@/shared/ui/components/CodeExample';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/shadcn/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/components/ui/card';
import { Play, RotateCcw, Home, Settings, Users, BarChart3 } from 'lucide-react';

const AnimationsShowcasePage: React.FC = () => {
  const [fadeKey, setFadeKey] = useState(0);
  const [staggerKey, setStaggerKey] = useState(0);
  const [selectedNav, setSelectedNav] = useState('home');
  const [currentPage, setCurrentPage] = useState(0);

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const slideVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const pages = ['Dashboard', 'Profile', 'Settings'];

  return (
    <ShowcasePage
      title="Animations"
      description="Motion and animation patterns using Framer Motion for smooth, performant UI transitions."
    >
      {/* Fade, Slide, Scale */}
      <ShowcaseSection
        title="Fade, Slide, Scale Variants"
        description="Basic animation variants for entering elements."
      >
        <CodeExample
          id="animations"
          title="Entry Animations"
          code={`const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const slideVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

<motion.div
  key={key}
  initial="hidden"
  animate="visible"
  variants={fadeVariants}
>
  Content
</motion.div>`}
        >
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => setFadeKey((k) => k + 1)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Replay Animations
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                key={`fade-${fadeKey}`}
                initial="hidden"
                animate="visible"
                variants={fadeVariants}
                className="p-6 border rounded-lg bg-card text-center"
              >
                <p className="font-medium">Fade In</p>
                <p className="text-sm text-muted-foreground">opacity: 0 → 1</p>
              </motion.div>
              <motion.div
                key={`slide-${fadeKey}`}
                initial="hidden"
                animate="visible"
                variants={slideVariants}
                className="p-6 border rounded-lg bg-card text-center"
              >
                <p className="font-medium">Slide In</p>
                <p className="text-sm text-muted-foreground">x: -20 → 0</p>
              </motion.div>
              <motion.div
                key={`scale-${fadeKey}`}
                initial="hidden"
                animate="visible"
                variants={scaleVariants}
                className="p-6 border rounded-lg bg-card text-center"
              >
                <p className="font-medium">Scale In</p>
                <p className="text-sm text-muted-foreground">scale: 0.8 → 1</p>
              </motion.div>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Staggered Animation */}
      <ShowcaseSection
        title="Staggered List Animation"
        description="Sequential animations for lists and grids."
      >
        <CodeExample
          id="animations"
          title="Stagger Children"
          code={`const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.ul variants={container} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.li key={item} variants={item}>
      {item}
    </motion.li>
  ))}
</motion.ul>`}
        >
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => setStaggerKey((k) => k + 1)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Replay Animation
            </Button>
            <motion.div
              key={staggerKey}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="p-4 border rounded-lg bg-card text-center"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 mx-auto mb-2 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{i}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Item {i}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Card Hover Animations */}
      <ShowcaseSection
        title="Card Hover Animations"
        description="Interactive hover effects for cards and clickable elements."
      >
        <CodeExample
          id="animations"
          title="Hover Effects"
          code={`<motion.div
  whileHover={{ scale: 1.02, y: -4 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 300 }}
  className="cursor-pointer"
>
  <Card>...</Card>
</motion.div>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="cursor-pointer"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Scale & Lift</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Hover to see scale and lift effect
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)' }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">Shadow Elevation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Hover to see shadow effect
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ borderColor: 'var(--primary)' }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer border-2 border-transparent rounded-lg"
            >
              <Card className="h-full border-0">
                <CardHeader>
                  <CardTitle className="text-base">Border Highlight</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Hover to see border effect
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Interactive Motion */}
      <ShowcaseSection
        title="Interactive Motion"
        description="Micro-interactions for buttons and icons."
      >
        <CodeExample
          id="animations"
          title="Button & Icon Animations"
          code={`<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>

<motion.div
  animate={{ rotate: isActive ? 180 : 0 }}
  transition={{ duration: 0.3 }}
>
  <Icon />
</motion.div>`}
        >
          <div className="flex flex-wrap gap-4 items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button>Bouncy Button</Button>
            </motion.div>
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Button variant="ghost" size="icon" className="text-destructive">
                <Play className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Button variant="link">
                Learn more →
              </Button>
            </motion.div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* NavRail Hover/Active Motion */}
      <ShowcaseSection
        title="NavRail Hover/Active Motion"
        description="Animated selection indicator for navigation."
      >
        <CodeExample
          id="animations"
          title="Navigation Indicator"
          code={`<nav className="relative">
  {items.map((item) => (
    <button key={item.id} onClick={() => setSelected(item.id)}>
      {selected === item.id && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-primary/10 rounded-lg"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <span className="relative z-10">{item.label}</span>
    </button>
  ))}
</nav>`}
        >
          <div className="flex justify-center">
            <nav className="flex gap-1 p-1 bg-muted rounded-lg">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedNav(item.id)}
                  className="relative px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {selectedNav === item.id && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-background shadow-sm rounded-md"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-2 ${selectedNav === item.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Page Transitions */}
      <ShowcaseSection
        title="Page Transitions"
        description="Simulated route transitions with AnimatePresence."
      >
        <CodeExample
          id="animations"
          title="Route Animation"
          code={`<AnimatePresence mode="wait">
  <motion.div
    key={currentPage}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2 }}
  >
    {pages[currentPage]}
  </motion.div>
</AnimatePresence>`}
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              {pages.map((page, index) => (
                <Button
                  key={page}
                  variant={currentPage === index ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(index)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <div className="border rounded-lg p-6 min-h-[150px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-semibold mb-2">{pages[currentPage]}</h3>
                  <p className="text-muted-foreground">
                    This is the {pages[currentPage].toLowerCase()} page content. Click the buttons above to see the page transition animation.
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>

      {/* Spring Physics */}
      <ShowcaseSection
        title="Spring Physics"
        description="Natural motion with spring-based animations."
      >
        <CodeExample
          id="animations"
          title="Spring Configurations"
          code={`// Bouncy spring
transition={{ type: "spring", stiffness: 500, damping: 15 }}

// Smooth spring
transition={{ type: "spring", stiffness: 300, damping: 30 }}

// Gentle spring
transition={{ type: "spring", stiffness: 100, damping: 20 }}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium mb-3">Bouncy</p>
              <motion.div
                className="h-16 w-16 bg-primary rounded-lg mx-auto cursor-pointer"
                whileHover={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              />
              <p className="text-xs text-muted-foreground mt-2">stiffness: 500, damping: 15</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium mb-3">Smooth</p>
              <motion.div
                className="h-16 w-16 bg-primary rounded-lg mx-auto cursor-pointer"
                whileHover={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <p className="text-xs text-muted-foreground mt-2">stiffness: 300, damping: 30</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium mb-3">Gentle</p>
              <motion.div
                className="h-16 w-16 bg-primary rounded-lg mx-auto cursor-pointer"
                whileHover={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              />
              <p className="text-xs text-muted-foreground mt-2">stiffness: 100, damping: 20</p>
            </div>
          </div>
        </CodeExample>
      </ShowcaseSection>
    </ShowcasePage>
  );
};

export default AnimationsShowcasePage;

