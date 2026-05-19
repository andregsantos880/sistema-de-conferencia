import { createContext } from 'react';

export interface ShowcaseContextValue {
  collapseAll: boolean;
  toggleCollapseAll: () => void;
  collapsedSections: Set<string>;
  expandedSections: Set<string>;
  toggleSection: (sectionId: string) => void;
}

const ShowcaseContext = createContext<ShowcaseContextValue | null>(null);

export default ShowcaseContext;
