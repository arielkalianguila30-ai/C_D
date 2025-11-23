import React, { createContext, useContext, useState } from 'react';

type BottomNavContextData = {
  active: string;
  setActive: (route: string) => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
};

const BottomNavContext = createContext<BottomNavContextData | undefined>(undefined);

export const BottomNavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [active, setActiveState] = useState<string>('inicial');
  const [visible, setVisibleState] = useState<boolean>(true);

  const setActive = (route: string) => {
    setActiveState(route);
  };

  const setVisible = (v: boolean) => {
    setVisibleState(v);
  };

  return (
    <BottomNavContext.Provider value={{ active, setActive, visible, setVisible }}>
      {children}
    </BottomNavContext.Provider>
  );
};

export function useBottomNav() {
  const ctx = useContext(BottomNavContext);
  if (!ctx) throw new Error('useBottomNav must be used within BottomNavProvider');
  return ctx;
}

export default BottomNavContext;
