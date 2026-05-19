import React, { useState } from 'react';
import ShowcaseContext, { type ShowcaseContextValue } from './ShowcaseContext';
export const ShowcaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapseAll, setCollapseAll] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleCollapseAll = () => {
    setCollapseAll(prev => !prev);
    setCollapsedSections(new Set());
    setExpandedSections(new Set());
  };

  const toggleSection = (sectionId: string) => {
    if (collapseAll) {
      setExpandedSections(prev => {
        const next = new Set(prev);
        if (next.has(sectionId)) {
          next.delete(sectionId); // Collapse it again
        } else {
          next.add(sectionId); // Expand it as an exception
        }
        return next;
      });
    } else {
      // Normal toggle behavior when collapseAll is off
      setCollapsedSections(prev => {
        const next = new Set(prev);
        if (next.has(sectionId)) {
          next.delete(sectionId);
        } else {
          next.add(sectionId);
        }
        return next;
      });
    }
  };

  const value: ShowcaseContextValue = {
    collapseAll,
    toggleCollapseAll,
    collapsedSections,
    expandedSections,
    toggleSection,
  };

  return (
    <ShowcaseContext.Provider value={value}>
      {children}
    </ShowcaseContext.Provider>
  );
};
