import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (item: BreadcrumbItem) => void;
  removeLastBreadcrumb: () => void;
  resetBreadcrumbs: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { label: 'Home', path: '/' }
  ]);

  const addBreadcrumb = (item: BreadcrumbItem) => {
    setBreadcrumbs(prev => {
      // Check if the breadcrumb already exists to avoid duplicates
      const exists = prev.some(bc => bc.label === item.label);
      if (exists) return prev;
      
      return [...prev, item];
    });
  };

  const removeLastBreadcrumb = () => {
    setBreadcrumbs(prev => prev.slice(0, -1));
  };

  const resetBreadcrumbs = () => {
    setBreadcrumbs([{ label: 'Home', path: '/' }]);
  };

  return (
    <BreadcrumbContext.Provider value={{
      breadcrumbs,
      setBreadcrumbs,
      addBreadcrumb,
      removeLastBreadcrumb,
      resetBreadcrumbs
    }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
};