'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ViewMode } from '@/types/company';

interface ToggleContextType {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  toggleMode: () => void;
  isNiiMode: boolean;
  isNcMode: boolean;
}

const ToggleContext = createContext<ToggleContextType | undefined>(undefined);

export function ToggleProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ViewMode>('nii');

  const toggleMode = () => {
    setMode((prev) => (prev === 'nii' ? 'nc' : 'nii'));
  };

  const value: ToggleContextType = {
    mode,
    setMode,
    toggleMode,
    isNiiMode: mode === 'nii',
    isNcMode: mode === 'nc',
  };

  return (
    <ToggleContext.Provider value={value}>
      {children}
    </ToggleContext.Provider>
  );
}

export function useToggle() {
  const context = useContext(ToggleContext);
  if (context === undefined) {
    throw new Error('useToggle must be used within a ToggleProvider');
  }
  return context;
}

export default ToggleContext;
