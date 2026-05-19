/**
 * Navigation Data – Identity Only
 *
 * RULES:
 * - Structure only (NO layout, NO styling)
 * - If `children` exists → item is hierarchical
 * - Parents with children MUST NOT define `to`
 * - Icons are OPTIONAL
 * - Widgets are declared via navRole = 'widget'
 */

export type SidebarIconKey =
  | 'home'
  | 'layout-dashboard'
  | 'bar-chart'
  | 'pie-chart'
  | 'calendar'
  | 'mail'
  | 'message-circle'
  | 'kanban'
  | 'file-text'
  | 'users'
  | 'settings'
  | 'plug'
  | 'bell'
  | 'palette'
  | 'type'
  | 'component'
  | 'table'
  | 'layout-grid'
  | 'layers'
  | 'alert-triangle'
  | 'sparkles'
  | 'zap'
  | 'command'
  | 'badge'
  | 'keyboard'
  | 'lock'
  | 'shield-check'
  | 'book-open'
  | 'loader'
  | 'search'
  | 'columns'
  | 'git-commit'
  | 'truck'
  // New icons
  | 'pencil'
  | 'mouse-pointer'
  | 'chevron-down-square'
  | 'accessibility'
  | 'move'
  | 'align-left'
  | 'boxes'
  | 'combine'
  | 'sliders'
  | 'toggle'
  | 'eye'
  | 'list-ordered';

export type NavBadge = {
  type: 'count' | 'dot' | 'label' | 'icon' | 'emoji';
  value?: number | string;
  label?: 'popular' | 'featured' | 'new' | 'premium';
  icon?: SidebarIconKey;
  color?: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'slate' | 'orange';
};

export type NavRole = 'main' | 'primary' | 'secondary' | 'utility' | 'widget';

/**
 * Visual accent colors for enhanced navigation items
 * Used by megamenu to apply theme-aware color styling
 */
export type NavAccentColor = 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'slate';

/**
 * Icon color for sidebar items
 * Maps to Tailwind color classes
 */
export type NavIconColor = 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'slate' | 'cyan' | 'orange';

export type NavAction = {
  id: string;
  icon: SidebarIconKey;
  label?: string;
  onClick: (e: React.MouseEvent) => void;
};

export type NavItem = {
  id: string;
  icon?: SidebarIconKey;
  iconColor?: NavIconColor;
  to?: string;
  target?: React.HTMLAttributeAnchorTarget;
  badge?: NavBadge;
  navRole?: NavRole;
  defaultOpen?: boolean;
  children?: NavItem[];
  
  // Visual enhancement flags (text comes from i18n)
  // If true, renderer will look up `descriptions.{parentId}.{id}` or `descriptions.{id}`
  hasDescription?: boolean;
  // Thumbnail image path for featured items (optional)
  thumbnail?: string;
  // Accent color for visual styling
  accent?: NavAccentColor;
  // Mark as featured item (displayed prominently in megamenu)
  featured?: boolean;
  // If true, renders a visual separator after this item in sidebar
  hasSeparatorAfter?: boolean;

  // Contextual actions for the item (e.g. dotted menu)
  actions?: NavAction[];
};

/**
 * Megamenu-specific presentation configuration
 */
export interface MegaPresentation {
  // Layout component to use (e.g., 'showcase', 'tabbed', 'columns', 'default')
  component?: string;
  // Item IDs to display in featured zone (hero cards with images)
  featuredItems?: string[];
  // Item IDs for quick links bar
  quickLinks?: string[];
  // Number of columns for main grid (default: 5)
  columns?: number;
  // Show descriptions for items (requires hasDescription on items)
  showDescriptions?: boolean;
  // CTA button config (label comes from i18n: `mega.{groupId}.cta`)
  cta?: {
    to: string;
    accent?: NavAccentColor;
  };
}

export type NavGroup = {
  id: string;
  presentation?: NavPresentation;
  items: NavItem[];

  // Optional action next to group title (e.g. "+" button)
  headerAction?: NavAction;
};

export interface NavPresentation {
  layout?: 'list' | 'columns' | 'mega';
  // Mega-specific configuration
  mega?: MegaPresentation;
}

export const navigationSections: NavGroup[] = [
  /* ───────── Home ───────── */
  {
    id: 'home',
    items: [
      { id: 'admin-control', icon: 'home', to: '/', navRole: 'primary' },
      { id: 'guided-workspace', icon: 'sparkles', to: '/home/setup', navRole: 'primary' },
      { id: 'activity-hub', icon: 'layout-dashboard', to: '/home/activity', navRole: 'primary' },
    ],
  },

  /* ───────── Dashboards ───────── */
  {
    id: 'dashboards',
    items: [
      { id: 'ecommerce', icon: 'layout-dashboard', to: '/dashboards/ecommerce', navRole: 'primary' },
      { id: 'projects', icon: 'layout-grid', to: '/dashboards/projects', navRole: 'primary' },
      { id: 'sales', icon: 'bar-chart', to: '/dashboards/sales', navRole: 'primary' },
      { id: 'executive', icon: 'pie-chart', to: '/dashboards/executive', navRole: 'primary' },
      { id: 'shipments', icon: 'truck', to: '/dashboards/shipments', navRole: 'primary' },
    ],
  },

  /* ───────── Apps ───────── */
  {
    id: 'apps',
    items: [
      { id: 'calendar', icon: 'calendar', to: '/apps/calendar', navRole: 'primary' },
      { id: 'email', icon: 'mail', to: '/apps/email', badge: { type: 'count', value: 12 }, navRole: 'primary' },
      { id: 'chat', icon: 'message-circle', to: '/apps/chat', navRole: 'primary' },
      { id: 'inbox', icon: 'bell', to: '/apps/inbox', badge: { type: 'count', value: 5 }, navRole: 'primary' },
      { id: 'kanban', icon: 'kanban', to: '/apps/kanban', navRole: 'primary' },
      { id: 'invoices', icon: 'file-text', to: '/invoices', navRole: 'primary' },
    ],
  },

  /* ───────── Management ───────── */
  {
    id: 'management',
    items: [
      { id: 'users', icon: 'users', to: '/management/users', navRole: 'primary' },
      { id: 'integrations', icon: 'plug', to: '/management/integrations', navRole: 'primary' },
      {
        id: 'teams',
        icon: 'users',
        navRole: 'primary',
        children: [
          { id: 'teams_table', icon: 'table', to: '/management/teams/table' },
          { id: 'teams_cards', icon: 'layout-grid', to: '/management/teams/cards' },
        ],
      },
      {
        id: 'notifications',
        icon: 'bell',
        navRole: 'primary',
        children: [
          { id: 'notifications', icon: 'bell', to: '/management/notifications' },
          { id: 'notifications_settings', icon: 'settings', to: '/management/notifications/settings' },
          { id: 'notifications_template', icon: 'file-text', to: '/management/notifications/templates' },
        ],
      },
    ],
  },

  /* ───────── Pages ───────── */
  {
    id: 'pages',
    items: [
      { id: 'pricing', icon: 'file-text', to: '/pages/pricing', navRole: 'secondary' },
      {
        id: 'errorPages',
        icon: 'alert-triangle',
        navRole: 'secondary',
        children: [
          { id: '404', to: '/pages/errors/404' },
          { id: '500', to: '/pages/errors/500' },
        ],
      },
    ],
  },

  /* ───────── Showcase (FULL) ───────── */
  {
    id: 'showcase',
    presentation: {
      layout: 'mega',
      mega: {
        component: 'showcase',
        showDescriptions: true,
        // Featured items for horizontal megamenu (6 cards with thumbnails)
        featuredItems: [
          'showcase-tables',
          'showcase-forms-advanced-fields', 
          'showcase-charts',
          'showcase-command-palette',
          'showcase-compositions',
          'showcase-ui-patterns',
        ],
        // Quick links for horizontal megamenu
        quickLinks: [
          'showcase-accessibility',
          'showcase-overflow',
        ],
        // 3-column grouping for browse section
        columns: 3,
      },
    },
    items: [
      /* ═══════════════════════════════════════════════════════════
         High-Value Features (Advanced Fields, Tables, Forms, Charts)
         These 4 items ALWAYS appear first, in this order.
         ═══════════════════════════════════════════════════════════ */
      
      // Advanced Fields
      {
        id: 'showcase-forms-advanced-fields',
        icon: 'layers',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'purple',
        featured: true,
        badge: { type: 'emoji', value: '🔥' },
        thumbnail: '/images/showcase/featured/forms-advanced.png',
        children: [
            { id: 'showcase-forms-radios', icon: 'toggle', to: '/showcase/forms/advanced/radios' },
            { id: 'showcase-forms-selects', icon: 'chevron-down-square', to: '/showcase/forms/advanced/selects' },
            { id: 'showcase-forms-masked', icon: 'type', to: '/showcase/forms/advanced/masked' },
            { id: 'showcase-forms-repeatable', icon: 'list-ordered', to: '/showcase/forms/advanced/repeatable' },
            { id: 'showcase-forms-ready', icon: 'zap', to: '/showcase/forms/advanced/ready-fields' },
        ],
      },

      // Tables & Data Grids
      {
        id: 'showcase-tables',
        icon: 'table',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'blue',
        featured: true,
        badge: { type: 'label', label: 'popular', color: 'blue' },
        thumbnail: '/images/showcase/featured/tables.png',
        children: [
          { id: 'showcase-tables-basic', icon: 'table', to: '/showcase/tables/basic' },
          { id: 'simple-sortable-table', icon: 'columns', to: '/showcase/tables/simple-sortable-table' },
          { id: 'data-table', icon: 'layout-grid', to: '/showcase/tables/data-table' },
          { id: 'data-table-server', icon: 'plug', to: '/showcase/tables/data-table-server' },
          { id: 'bulk-actions-tables', icon: 'layers', to: '/showcase/bulk-actions/tables' },
          { id: 'inline-editing-tables', icon: 'component', to: '/showcase/inline-editing/tables' },
        ],
      },

      // Forms
      {
        id: 'showcase-forms',
        icon: 'sliders',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'purple',
        badge: { type: 'label', label: 'popular', color: 'blue' },
        children: [
          { id: 'showcase-forms-basics', icon: 'sliders', to: '/showcase/forms/basics' },
          { id: 'showcase-forms-validation', icon: 'shield-check', to: '/showcase/forms/validation' },
          { id: 'showcase-forms-layouts', icon: 'layout-grid', to: '/showcase/forms/layouts' },
          { id: 'showcase-forms-advanced', icon: 'layers', to: '/showcase/forms/advanced-scenarios' },
          { id: 'showcase-forms-file-upload', icon: 'file-text', to: '/showcase/forms/file-upload' },
          { id: 'showcase-wizard', icon: 'sparkles', to: '/showcase/wizard' },
        ],
      },

      // Charts & Visualizations
      {
        id: 'showcase-charts',
        icon: 'bar-chart',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'emerald',
        featured: true,
        badge: { type: 'label', label: 'popular', color: 'blue' },
        thumbnail: '/images/showcase/featured/charts.png',
        hasSeparatorAfter: true, // Visual separator after top 3 items
        children: [
          { id: 'showcase-charts-basic', icon: 'bar-chart', to: '/showcase/charts' },
          { id: 'compositions-cards-charts', icon: 'bar-chart', to: '/showcase/compositions/cards-charts' },
          { id: 'compositions-dashboards', icon: 'layout-dashboard', to: '/showcase/compositions/dashboard-sections' },
          { id: 'showcase-stat-cards', icon: 'bar-chart', to: '/showcase/stat-cards' },
        ],
      },

      /* ═══════════════════════════════════════════════════════════
         Sorted Alphabetically by Label
         ═══════════════════════════════════════════════════════════ */

      // Accessibility
      { 
        id: 'showcase-accessibility', 
        icon: 'accessibility',
        to: '/showcase/accessibility', 
        navRole: 'secondary',
        hasDescription: true,
        accent: 'emerald',
      },

      // Interactions
      {
        id: 'showcase-advanced-interactions',
        icon: 'mouse-pointer',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'amber',
        children: [
          { id: 'showcase-animations', icon: 'sparkles', to: '/showcase/animations' },
          { id: 'micro-buttons', icon: 'zap', to: '/showcase/micro-interactions/buttons' },
          { id: 'micro-inputs', icon: 'sliders', to: '/showcase/micro-interactions/inputs' },
          { id: 'micro-toggles', icon: 'toggle', to: '/showcase/micro-interactions/toggles' },
        ],
      },

      // Bulk Actions
      {
        id: 'showcase-bulk-actions',
        icon: 'boxes',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'blue',
        featured: true,
        thumbnail: '/images/showcase/featured/bulk-actions.png',
        children: [
          { id: 'bulk-actions-confirmations', icon: 'alert-triangle', to: '/showcase/bulk-actions/confirmations' },
          { id: 'bulk-actions-lists', icon: 'layers', to: '/showcase/bulk-actions/lists' },
          { id: 'bulk-actions-tables', icon: 'table', to: '/showcase/bulk-actions/tables' },
        ],
      },

      // Examples
      {
        id: 'showcase-compositions',
        icon: 'combine',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'emerald',
        featured: true,
        badge: { type: 'label', label: 'featured', color: 'emerald' },
        thumbnail: '/images/showcase/featured/examples.png',
        children: [
          { id: 'compositions-cards-charts', icon: 'bar-chart', to: '/showcase/compositions/cards-charts' },
          { id: 'compositions-dashboards', icon: 'layout-dashboard', to: '/showcase/compositions/dashboard-sections' },
          { id: 'compositions-master-detail', icon: 'columns', to: '/showcase/compositions/master-detail' },
          { id: 'compositions-search-results', icon: 'search', to: '/showcase/compositions/search-results' },
        ],
      },

      // Design System
      {
        id: 'showcase-design-system',
        icon: 'palette',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'purple',
        children: [
          { id: 'showcase-colors', icon: 'palette', to: '/showcase/colors' },
          { id: 'showcase-typography', icon: 'type', to: '/showcase/typography' },
        ],
      },

      // Expandable Content
      {
        id: 'showcase-progressive',
        icon: 'chevron-down-square',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'blue',
        children: [
          { id: 'progressive-advanced-filters', icon: 'search', to: '/showcase/progressive/advanced-filters' },
          { id: 'progressive-collapsible-panels', icon: 'layers', to: '/showcase/progressive/collapsible-panels' },
          { id: 'progressive-inline-reveal', icon: 'eye', to: '/showcase/progressive/inline-reveal' },
        ],
      },

      // Inline Editing
      {
        id: 'showcase-inline-editing',
        icon: 'pencil',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'amber',
        children: [
          { id: 'inline-editing-cards', icon: 'pencil', to: '/showcase/inline-editing/cards' },
          { id: 'inline-editing-forms', icon: 'sliders', to: '/showcase/inline-editing/forms' },
          { id: 'inline-editing-tables', icon: 'table', to: '/showcase/inline-editing/tables' },
        ],
      },

      // Overflow
      { 
        id: 'showcase-overflow', 
        icon: 'align-left',
        to: '/showcase/overflow', 
        navRole: 'secondary',
        hasDescription: true,
        accent: 'slate',
      },

      // Power User Features (Command Palette + Shortcuts)
      {
        id: 'showcase-command-palette',
        icon: 'command',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'amber',
        featured: true,
        thumbnail: '/images/showcase/featured/command-palette.png',
        children: [
          { id: 'command-palette-actions', icon: 'command', to: '/showcase/command-palette/actions' },
          { id: 'command-palette-navigation', icon: 'command', to: '/showcase/command-palette/navigation' },
          { id: 'command-palette-overview', icon: 'command', to: '/showcase/command-palette/overview' },
          { id: 'shortcuts-actions', icon: 'keyboard', to: '/showcase/shortcuts/actions' },
          { id: 'shortcuts-cheat-sheet', icon: 'file-text', to: '/showcase/shortcuts/cheat-sheet' },
          { id: 'shortcuts-navigation', icon: 'keyboard', to: '/showcase/shortcuts/navigation' },
          { id: 'shortcuts-overview', icon: 'keyboard', to: '/showcase/shortcuts/overview' },
        ],
      },

      // States & Feedback
      {
        id: 'showcase-states',
        icon: 'eye',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'amber',
        children: [
          { id: 'states-empty', icon: 'alert-triangle', to: '/showcase/states/empty' },
          { id: 'states-error', icon: 'alert-triangle', to: '/showcase/states/error' },
          { id: 'states-loading', icon: 'loader', to: '/showcase/states/loading' },
          { id: 'states-mixed', icon: 'layers', to: '/showcase/states/mixed' },
        ],
      },

      // Components
      {
        id: 'showcase-ui-components',
        icon: 'component',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'blue',
        children: [
          { id: 'showcase-alerts', icon: 'alert-triangle', to: '/showcase/alerts' },
          { id: 'showcase-avatars', icon: 'users', to: '/showcase/avatars' },
          { id: 'showcase-buttons', icon: 'component', to: '/showcase/buttons' },
          { id: 'showcase-modals', icon: 'layers', to: '/showcase/modals' },
          { id: 'showcase-toasts', icon: 'zap', to: '/showcase/toasts' },
        ],
      },

      // Patterns
      {
        id: 'showcase-ui-patterns',
        icon: 'layers',
        navRole: 'secondary',
        hasDescription: true,
        accent: 'blue',
        thumbnail: '/images/showcase/featured/ui-patterns.png',
        children: [
          { id: 'misc-badges', icon: 'badge', to: '/showcase/misc/badges' },
          { id: 'misc-breadcrumbs', icon: 'layers', to: '/showcase/misc/breadcrumbs' },
          { id: 'misc-loaders', icon: 'loader', to: '/showcase/misc/loaders' },
          { id: 'misc-pagination', icon: 'layers', to: '/showcase/misc/pagination' },
          { id: 'misc-scrollable', icon: 'align-left', to: '/showcase/misc/scrollable' },
          { id: 'misc-tabs', icon: 'layers', to: '/showcase/misc/tabs' },
          { id: 'misc-tooltips', icon: 'message-circle', to: '/showcase/misc/tooltips' },
        ],
      },
    ],
  },

  /* ───────── Authentication (FULL) ───────── */
  {
    id: 'auth',
    presentation: {
      layout: 'columns',
    },
    items: [
      {
        id: 'authMinimal',
        icon: 'lock',
        target: '_blank',
        navRole: 'secondary',
        children: [
          { id: 'login', icon: 'lock', to: '/auth/login', target: '_blank' },
          { id: 'register', icon: 'users', to: '/auth/register', target: '_blank' },
          { id: 'forgot', icon: 'lock', to: '/auth/forgot-password', target: '_blank' },
          { id: 'reset', icon: 'lock', to: '/auth/reset-password', target: '_blank' },
          { id: 'twofactor', icon: 'shield-check', to: '/auth/mfa-verify', target: '_blank' },
          { id: 'verify', icon: 'mail', to: '/auth/verify-email', target: '_blank' },
          { id: 'lock', icon: 'lock', to: '/auth/lock', target: '_blank' },
        ],
      },
      {
        id: 'authHero',
        icon: 'shield-check',
        target: '_blank',
        navRole: 'secondary',
        children: [
          { id: 'loginHero', icon: 'lock', to: '/auth/hero/login', target: '_blank' },
          { id: 'registerHero', icon: 'users', to: '/auth/hero/register', target: '_blank' },
          { id: 'forgotHero', icon: 'lock', to: '/auth/hero/forgot-password', target: '_blank' },
          { id: 'resetHero', icon: 'lock', to: '/auth/hero/reset-password', target: '_blank' },
          { id: 'twofactorHero', icon: 'shield-check', to: '/auth/hero/mfa-verify', target: '_blank' },
          { id: 'verifyHero', icon: 'mail', to: '/auth/hero/verify-email', target: '_blank' },
          { id: 'lockHero', icon: 'lock', to: '/auth/lock', target: '_blank' },
        ],
      },
    ],
  },

  /* ───────── System ───────── */
  {
    id: 'system',
    items: [
      { id: 'sysSettings', icon: 'settings', to: '/settings', navRole: 'utility' },
      { id: 'docs', icon: 'book-open', to: 'https://docs.5studios.net/katalyst', target: '_blank', navRole: 'utility' },
      { id: 'changelog', icon: 'git-commit', to: '/system/changelog', navRole: 'utility' },
      { id: 'layout-builder', icon: 'palette', to: '/playground/layout-builder', navRole: 'utility' },
    ],
  },

  /* ───────── Widgets ───────── */
  {
    id: 'widgets',
    items: [
      { id: 'favorite-apps', navRole: 'widget' },
    ],
  },
];
