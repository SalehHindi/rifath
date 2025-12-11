"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { UIMode } from "@/components/ModeRenderer";

interface ModeContextType {
  currentMode: UIMode;
  setMode: (mode: UIMode) => void;
  isModeChanging: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [currentMode, setCurrentModeState] = useState<UIMode>("placeholder");
  const [isModeChanging, setIsModeChanging] = useState(false);

  const setMode = useCallback((mode: UIMode) => {
    setIsModeChanging(true);
    setCurrentModeState(mode);
    // Reset mode changing state after a brief delay for smooth transitions
    setTimeout(() => {
      setIsModeChanging(false);
    }, 300);
  }, []);

  return (
    <ModeContext.Provider
      value={{
        currentMode,
        setMode,
        isModeChanging,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}

