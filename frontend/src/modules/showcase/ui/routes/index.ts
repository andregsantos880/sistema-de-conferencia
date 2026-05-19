import type { ModuleRoute } from '@/core/router/types';
import { SHOWCASE_PATHS } from './paths';
import { lazy } from 'react';

// Foundations
const ColorsShowcasePage = lazy(() => import('../pages/design-system/ColorsShowcasePage'));
const TypographyShowcasePage = lazy(() => import('../pages/design-system/TypographyShowcasePage'));
// Components
const ButtonsShowcasePage = lazy(() => import('../pages/ui-components/ButtonsShowcasePage'));
const AvatarsShowcasePage = lazy(() => import('../pages/ui-components/AvatarsShowcasePage'));
const StatCardsShowcasePage = lazy(() => import('../pages/charts/StatCardsShowcasePage'));
const FormBasicsShowcasePage = lazy(() => import('../pages/forms/FormBasicsShowcasePage'));
const FormValidationShowcasePage = lazy(() => import('../pages/forms/FormValidationShowcasePage'));
const FormLayoutShowcasePage = lazy(() => import('../pages/forms/FormLayoutShowcasePage'));
const FormAdvancedShowcasePage = lazy(() => import('../pages/forms/FormAdvancedShowcasePage'));
const RadioGroupsPage = lazy(() => import('../pages/forms/advanced/RadioGroupsPage'));
const SelectFieldsPage = lazy(() => import('../pages/forms/advanced/SelectFieldsPage'));
const MaskedFieldsPage = lazy(() => import('../pages/forms/advanced/MaskedFieldsPage'));
const ReadyFieldsPage = lazy(() => import('../pages/forms/advanced/ReadyFieldsPage'));
const RepeatableFieldsPage = lazy(() => import('../pages/forms/advanced/RepeatableFieldsPage'));


const FileUploadShowcasePage = lazy(() => import('../pages/forms/FileUploadShowcasePage'));
const TablesShowcasePage = lazy(() => import('../pages/tables/TablesShowcasePage'));
const ChartsShowcasePage = lazy(() => import('../pages/charts/ChartsShowcasePage'));
const ModalsShowcasePage = lazy(() => import('../pages/ui-components/ModalsShowcasePage'));
const AlertsShowcasePage = lazy(() => import('../pages/ui-components/AlertsShowcasePage'));
const ToastsShowcasePage = lazy(() => import('../pages/ui-components/ToastsShowcasePage'));
// Misc pages
const TabsShowcasePage = lazy(() => import('../pages/ui-patterns/TabsShowcasePage'));
const BreadcrumbsShowcasePage = lazy(() => import('../pages/ui-patterns/BreadcrumbsShowcasePage'));
const PaginationShowcasePage = lazy(() => import('../pages/ui-patterns/PaginationShowcasePage'));
const BadgesShowcasePage = lazy(() => import('../pages/ui-patterns/BadgesShowcasePage'));
const TooltipsShowcasePage = lazy(() => import('../pages/ui-patterns/TooltipsShowcasePage'));
const LoadersShowcasePage = lazy(() => import('../pages/ui-patterns/LoadersShowcasePage'));
const ScrollableShowcasePage = lazy(() => import('../pages/ui-patterns/ScrollableShowcasePage'));
// States
const EmptyStatesShowcasePage = lazy(() => import('../pages/states/EmptyStatesShowcasePage'));
const LoadingStatesShowcasePage = lazy(() => import('../pages/states/LoadingStatesShowcasePage'));
const ErrorStatesShowcasePage = lazy(() => import('../pages/states/ErrorStatesShowcasePage'));
const MixedStatesShowcasePage = lazy(() => import('../pages/states/MixedStatesShowcasePage'));
// Density & Scale
const DensityShowcasePage = lazy(() => import('../pages/density/DensityShowcasePage'));
// Overflow & Long Content
const OverflowShowcasePage = lazy(() => import('../pages/overflow/OverflowShowcasePage'));
// Compositions
const SimpleSortableTableShowcasePage = lazy(() => import('../pages/tables/SimpleSortableTableShowcasePage'));
const SearchResultsShowcasePage = lazy(() => import('../pages/compositions/SearchResultsShowcasePage'));
const CardsChartsShowcasePage = lazy(() => import('../pages/compositions/CardsChartsShowcasePage'));
const DashboardSectionsShowcasePage = lazy(() => import('../pages/compositions/DashboardSectionsShowcasePage'));
const MasterDetailShowcasePage = lazy(() => import('../pages/compositions/MasterDetailShowcasePage'));
// Progressive Disclosure
const AdvancedFiltersShowcasePage = lazy(() => import('../pages/progressive/AdvancedFiltersShowcasePage'));
const DataTableShowcasePage = lazy(() => import('../pages/tables/DataTableShowcasePage'));
const DataTableServerSideShowcasePage = lazy(() => import('../pages/tables/DataTableServerSideShowcasePage'));
const CollapsiblePanelsShowcasePage = lazy(() => import('../pages/progressive/CollapsiblePanelsShowcasePage'));
const InlineRevealShowcasePage = lazy(() => import('../pages/progressive/InlineRevealShowcasePage'));
// Inline Editing
const EditableTablesShowcasePage = lazy(() => import('../pages/tables/EditableTablesShowcasePage'));
const EditableCardsShowcasePage = lazy(() => import('../pages/inline-editing/EditableCardsShowcasePage'));
const InlineFormsShowcasePage = lazy(() => import('../pages/inline-editing/InlineFormsShowcasePage'));
// Micro-Interactions
const MicroButtonsShowcasePage = lazy(() => import('../pages/micro-interactions/MicroButtonsShowcasePage'));
const MicroInputsShowcasePage = lazy(() => import('../pages/micro-interactions/MicroInputsShowcasePage'));
const MicroTogglesShowcasePage = lazy(() => import('../pages/micro-interactions/MicroTogglesShowcasePage'));
const MicroFeedbackShowcasePage = lazy(() => import('../pages/micro-interactions/MicroFeedbackShowcasePage'));
// Bulk Actions
const BulkActionsTablesShowcasePage = lazy(() => import('../pages/tables/BulkActionsTablesShowcasePage'));
const BulkActionsListsShowcasePage = lazy(() => import('../pages/bulk-actions/BulkActionsListsShowcasePage'));
const BulkActionsConfirmationsShowcasePage = lazy(() => import('../pages/bulk-actions/BulkActionsConfirmationsShowcasePage'));
// Command Palette
const CommandPaletteOverviewShowcasePage = lazy(() => import('../pages/command-palette/CommandPaletteOverviewShowcasePage'));
const CommandPaletteNavigationShowcasePage = lazy(() => import('../pages/command-palette/CommandPaletteNavigationShowcasePage'));
const CommandPaletteActionsShowcasePage = lazy(() => import('../pages/command-palette/CommandPaletteActionsShowcasePage'));
// Keyboard Shortcuts
const ShortcutsOverviewShowcasePage = lazy(() => import('../pages/keyboard-shortcuts/ShortcutsOverviewShowcasePage'));
const ShortcutsNavigationShowcasePage = lazy(() => import('../pages/keyboard-shortcuts/ShortcutsNavigationShowcasePage'));
const ShortcutsActionsShowcasePage = lazy(() => import('../pages/keyboard-shortcuts/ShortcutsActionsShowcasePage'));
const ShortcutsCheatSheetShowcasePage = lazy(() => import('../pages/keyboard-shortcuts/ShortcutsCheatSheetShowcasePage'));
// Advanced
const AnimationsShowcasePage = lazy(() => import('../pages/animations/AnimationsShowcasePage'));
const AccessibilityShowcasePage = lazy(() => import('../pages/accessibility/AccessibilityShowcasePage'));
const WizardShowcasePage = lazy(() => import('../pages/forms/WizardShowcasePage'));

export const SHOWCASE_ROUTES: ModuleRoute[] = [
  // Foundations
  {
    path: SHOWCASE_PATHS.COLORS,
    module: 'showcase',
    layout: 'app',
    title: 'Colors',
    titleKey: 'showcase.colors',
    component: ColorsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.TYPOGRAPHY,
    module: 'showcase',
    layout: 'app',
    title: 'Typography',
    titleKey: 'showcase.typography',
    component: TypographyShowcasePage,
  },
  // Components
  {
    path: SHOWCASE_PATHS.BUTTONS,
    module: 'showcase',
    layout: 'app',
    title: 'Buttons',
    titleKey: 'showcase.buttons',
    component: ButtonsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.AVATARS,
    module: 'showcase',
    layout: 'app',
    title: 'Avatars',
    titleKey: 'showcase.avatars',
    component: AvatarsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.STAT_CARDS,
    module: 'showcase',
    layout: 'app',
    title: 'Stat Cards',
    titleKey: 'showcase.stat_cards',
    component: StatCardsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.FORMS_BASICS,
    module: 'showcase',
    layout: 'app',
    title: 'Form Basics & Primitives',
    titleKey: 'showcase.forms.basics',
    component: FormBasicsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.FORMS_VALIDATION,
    module: 'showcase',
    layout: 'app',
    title: 'Validation & Feedback',
    titleKey: 'showcase.forms.validation',
    component: FormValidationShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.FORMS_LAYOUTS,
    module: 'showcase',
    layout: 'app',
    title: 'Layouts & Composition',
    titleKey: 'showcase.forms.layouts',
    component: FormLayoutShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.FORMS_ADVANCED,
    module: 'showcase',
    layout: 'app',
    title: 'Advanced Scenarios',
    titleKey: 'showcase.forms.advanced',
    component: FormAdvancedShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.FORMS_RADIOS,
    module: 'showcase',
    layout: 'app',
    title: 'Radio Groups',
    titleKey: 'showcase.forms.radios',
    component: RadioGroupsPage,
  },
  {
    path: SHOWCASE_PATHS.FORMS_SELECTS,
    module: 'showcase',
    layout: 'app',
    title: 'Select Fields',
    titleKey: 'showcase.forms.selects',
    component: SelectFieldsPage,
  },
  {
    path: SHOWCASE_PATHS.FORMS_MASKED,
    module: 'showcase',
    layout: 'app',
    title: 'Masked Inputs',
    titleKey: 'showcase.forms.masked',
    component: MaskedFieldsPage,
  },
  {
    path: SHOWCASE_PATHS.FORMS_READY_FIELDS,
    module: 'showcase',
    layout: 'app',
    title: 'Ready Fields',
    titleKey: 'showcase.forms.ready_fields',
    component: ReadyFieldsPage,
  },
  {
    path: SHOWCASE_PATHS.FORMS_REPEATABLE,
    module: 'showcase',
    layout: 'app',
    title: 'Repeatable Fields',
    titleKey: 'showcase.forms.repeatable',
    component: RepeatableFieldsPage,
  },
  {
    path: SHOWCASE_PATHS.FORMS_FILE_UPLOAD,
    module: 'showcase',
    layout: 'app',
    title: 'File Upload',
    titleKey: 'showcase.forms.file_upload',
    component: FileUploadShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.TABLES,
    module: 'showcase',
    layout: 'app',
    title: 'Tables',
    titleKey: 'showcase.tables',
    component: TablesShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.CHARTS,
    module: 'showcase',
    layout: 'app',
    title: 'Charts',
    titleKey: 'showcase.charts',
    component: ChartsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.MODALS,
    module: 'showcase',
    layout: 'app',
    title: 'Modals',
    titleKey: 'showcase.modals',
    component: ModalsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.ALERTS,
    module: 'showcase',
    layout: 'app',
    title: 'Alerts',
    titleKey: 'showcase.alerts',
    component: AlertsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.TOASTS,
    module: 'showcase',
    layout: 'app',
    title: 'Toasts',
    titleKey: 'showcase.toasts',
    component: ToastsShowcasePage,
  },
  // Misc pages
  {
    path: SHOWCASE_PATHS.TABS,
    module: 'showcase',
    layout: 'app',
    title: 'Tabs',
    titleKey: 'showcase.tabs',
    component: TabsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.BREADCRUMBS,
    module: 'showcase',
    layout: 'app',
    title: 'Breadcrumbs',
    titleKey: 'showcase.breadcrumbs',
    component: BreadcrumbsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.PAGINATION,
    module: 'showcase',
    layout: 'app',
    title: 'Pagination',
    titleKey: 'showcase.pagination',
    component: PaginationShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.BADGES,
    module: 'showcase',
    layout: 'app',
    title: 'Badges',
    titleKey: 'showcase.badges',
    component: BadgesShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.TOOLTIPS,
    module: 'showcase',
    layout: 'app',
    title: 'Tooltips & Popovers',
    titleKey: 'showcase.tooltips',
    component: TooltipsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.LOADERS,
    module: 'showcase',
    layout: 'app',
    title: 'Loaders & Skeletons',
    titleKey: 'showcase.loaders',
    component: LoadersShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.SCROLLABLE,
    module: 'showcase',
    layout: 'app',
    title: 'Scrollable Areas',
    titleKey: 'showcase.scrollable',
    component: ScrollableShowcasePage,
  },
  // States
  {
    path: SHOWCASE_PATHS.STATES_EMPTY,
    module: 'showcase',
    layout: 'app',
    title: 'Empty States',
    titleKey: 'showcase.states.empty',
    component: EmptyStatesShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.STATES_LOADING,
    module: 'showcase',
    layout: 'app',
    title: 'Loading States',
    titleKey: 'showcase.states.loading',
    component: LoadingStatesShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.STATES_ERROR,
    module: 'showcase',
    layout: 'app',
    title: 'Error States',
    titleKey: 'showcase.states.error',
    component: ErrorStatesShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.STATES_MIXED,
    module: 'showcase',
    layout: 'app',
    title: 'Mixed States',
    titleKey: 'showcase.states.mixed',
    component: MixedStatesShowcasePage,
  },
  // Density & Scale
  {
    path: SHOWCASE_PATHS.DENSITY,
    module: 'showcase',
    layout: 'app',
    title: 'Density & Scale',
    titleKey: 'showcase.density',
    component: DensityShowcasePage,
  },
  // Overflow & Long Content
  {
    path: SHOWCASE_PATHS.OVERFLOW,
    module: 'showcase',
    layout: 'app',
    title: 'Overflow & Long Content',
    titleKey: 'showcase.overflow',
    component: OverflowShowcasePage,
  },
  // Compositions
  {
    path: SHOWCASE_PATHS.COMPOSITIONS_SIMPLE_SORTABLE_TABLE,
    module: 'showcase',
    layout: 'app',
    title: 'SimpleSortableTable',
    titleKey: 'showcase.tables.simple_sortable',
    component: SimpleSortableTableShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.COMPOSITIONS_SEARCH_RESULTS,
    module: 'showcase',
    layout: 'app',
    title: 'Search Results',
    titleKey: 'showcase.compositions.search_results',
    component: SearchResultsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.COMPOSITIONS_CARDS_CHARTS,
    module: 'showcase',
    layout: 'app',
    title: 'Cards + Charts',
    titleKey: 'showcase.compositions.cards_charts',
    component: CardsChartsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.COMPOSITIONS_DASHBOARD_SECTIONS,
    module: 'showcase',
    layout: 'app',
    title: 'Dashboard Sections',
    titleKey: 'showcase.compositions.dashboard_sections',
    component: DashboardSectionsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.COMPOSITIONS_MASTER_DETAIL,
    module: 'showcase',
    layout: 'app',
    title: 'Master-Detail View',
    titleKey: 'showcase.compositions.master_detail',
    component: MasterDetailShowcasePage,
  },
  // Progressive Disclosure
  {
    path: SHOWCASE_PATHS.PROGRESSIVE_ADVANCED_FILTERS,
    module: 'showcase',
    layout: 'app',
    title: 'Advanced Filters',
    titleKey: 'showcase.progressive.advanced_filters',
    component: AdvancedFiltersShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.PROGRESSIVE_DATA_TABLE,
    module: 'showcase',
    layout: 'app',
    title: 'DataTable (Client-Side)',
    titleKey: 'showcase.tables.data_table',
    component: DataTableShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.PROGRESSIVE_DATA_TABLE_SERVER,
    module: 'showcase',
    layout: 'app',
    title: 'DataTable (Server-Side)',
    titleKey: 'showcase.tables.data_table_server',
    component: DataTableServerSideShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.PROGRESSIVE_COLLAPSIBLE_PANELS,
    module: 'showcase',
    layout: 'app',
    title: 'Collapsible Panels',
    titleKey: 'showcase.progressive.collapsible_panels',
    component: CollapsiblePanelsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.PROGRESSIVE_INLINE_REVEAL,
    module: 'showcase',
    layout: 'app',
    title: 'Inline Reveal',
    titleKey: 'showcase.progressive.inline_reveal',
    component: InlineRevealShowcasePage,
  },
  // Inline Editing
  {
    path: SHOWCASE_PATHS.INLINE_EDITING_TABLES,
    module: 'showcase',
    layout: 'app',
    title: 'Editable Tables',
    titleKey: 'showcase.inline_editing.tables',
    component: EditableTablesShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.INLINE_EDITING_CARDS,
    module: 'showcase',
    layout: 'app',
    title: 'Editable Cards',
    titleKey: 'showcase.inline_editing.cards',
    component: EditableCardsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.INLINE_EDITING_FORMS,
    module: 'showcase',
    layout: 'app',
    title: 'Inline Forms',
    titleKey: 'showcase.inline_editing.forms',
    component: InlineFormsShowcasePage,
  },
  // Micro-Interactions
  {
    path: SHOWCASE_PATHS.MICRO_BUTTONS,
    module: 'showcase',
    layout: 'app',
    title: 'Buttons & Actions',
    titleKey: 'showcase.micro.buttons',
    component: MicroButtonsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.MICRO_INPUTS,
    module: 'showcase',
    layout: 'app',
    title: 'Inputs & Focus',
    titleKey: 'showcase.micro.inputs',
    component: MicroInputsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.MICRO_TOGGLES,
    module: 'showcase',
    layout: 'app',
    title: 'Toggles & Switches',
    titleKey: 'showcase.micro.toggles',
    component: MicroTogglesShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.MICRO_FEEDBACK,
    module: 'showcase',
    layout: 'app',
    title: 'Feedback & Status',
    titleKey: 'showcase.micro.feedback',
    component: MicroFeedbackShowcasePage,
  },
  // Bulk Actions
  {
    path: SHOWCASE_PATHS.BULK_ACTIONS_TABLES,
    module: 'showcase',
    layout: 'app',
    title: 'Table Bulk Actions',
    titleKey: 'showcase.bulk_actions.tables',
    component: BulkActionsTablesShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.BULK_ACTIONS_LISTS,
    module: 'showcase',
    layout: 'app',
    title: 'List Bulk Actions',
    titleKey: 'showcase.bulk_actions.lists',
    component: BulkActionsListsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.BULK_ACTIONS_CONFIRMATIONS,
    module: 'showcase',
    layout: 'app',
    title: 'Confirmation Flows',
    titleKey: 'showcase.bulk_actions.confirmations',
    component: BulkActionsConfirmationsShowcasePage,
  },
  // Command Palette
  {
    path: SHOWCASE_PATHS.COMMAND_PALETTE_OVERVIEW,
    module: 'showcase',
    layout: 'app',
    title: 'Command Palette Overview',
    titleKey: 'showcase.command_palette.overview',
    component: CommandPaletteOverviewShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.COMMAND_PALETTE_NAVIGATION,
    module: 'showcase',
    layout: 'app',
    title: 'Navigation Commands',
    titleKey: 'showcase.command_palette.navigation',
    component: CommandPaletteNavigationShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.COMMAND_PALETTE_ACTIONS,
    module: 'showcase',
    layout: 'app',
    title: 'Action Commands',
    titleKey: 'showcase.command_palette.actions',
    component: CommandPaletteActionsShowcasePage,
  },
  // Keyboard Shortcuts
  {
    path: SHOWCASE_PATHS.SHORTCUTS_OVERVIEW,
    module: 'showcase',
    layout: 'app',
    title: 'Shortcuts Overview',
    titleKey: 'showcase.shortcuts.overview',
    component: ShortcutsOverviewShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.SHORTCUTS_NAVIGATION,
    module: 'showcase',
    layout: 'app',
    title: 'Navigation Shortcuts',
    titleKey: 'showcase.shortcuts.navigation',
    component: ShortcutsNavigationShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.SHORTCUTS_ACTIONS,
    module: 'showcase',
    layout: 'app',
    title: 'Action Shortcuts',
    titleKey: 'showcase.shortcuts.actions',
    component: ShortcutsActionsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.SHORTCUTS_CHEAT_SHEET,
    module: 'showcase',
    layout: 'app',
    title: 'Shortcuts Cheat Sheet',
    titleKey: 'showcase.shortcuts.cheat_sheet',
    component: ShortcutsCheatSheetShowcasePage,
  },
  // Advanced
  {
    path: SHOWCASE_PATHS.ANIMATIONS,
    module: 'showcase',
    layout: 'app',
    title: 'Animations',
    titleKey: 'showcase.animations',
    component: AnimationsShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.ACCESSIBILITY,
    module: 'showcase',
    layout: 'app',
    title: 'Accessibility',
    titleKey: 'showcase.accessibility',
    component: AccessibilityShowcasePage,
  },
  {
    path: SHOWCASE_PATHS.WIZARD,
    module: 'showcase',
    layout: 'app',
    title: 'Wizard',
    titleKey: 'showcase.wizard',
    component: WizardShowcasePage,
  },
];

export { SHOWCASE_PATHS } from './paths';
