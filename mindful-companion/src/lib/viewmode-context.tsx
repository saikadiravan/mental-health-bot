import React, { createContext, useContext, useState, useEffect } from "react";

export type ViewMode = "teens" | "adults" | "seniors";

interface ViewModeContextType {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  modeConfig: ModeConfig;
}

export interface ModeConfig {
  label: string;
  font: string;
  headingSize: string;
  textSize: string;
  buttonSize: string;
  buttonPadding: string;
  iconSize: string;
  cardPadding: string;
  reduceAnimations: boolean;
  emojiExtra: boolean;
  gamified: boolean;
  voicePlaceholder: boolean;
}

const MODE_CONFIGS: Record<ViewMode, ModeConfig> = {
  teens: {
    label: "Teens",
    font: "'Poppins', sans-serif",
    headingSize: "text-2xl",
    textSize: "text-sm",
    buttonSize: "text-sm",
    buttonPadding: "px-4 py-2",
    iconSize: "w-5 h-5",
    cardPadding: "p-5",
    reduceAnimations: false,
    emojiExtra: true,
    gamified: true,
    voicePlaceholder: false,
  },
  adults: {
    label: "Adults",
    font: "'Inter', system-ui, sans-serif",
    headingSize: "text-2xl",
    textSize: "text-sm",
    buttonSize: "text-sm",
    buttonPadding: "px-4 py-2",
    iconSize: "w-4 h-4",
    cardPadding: "p-6",
    reduceAnimations: false,
    emojiExtra: false,
    gamified: false,
    voicePlaceholder: false,
  },
  seniors: {
    label: "Seniors",
    font: "'Inter', system-ui, sans-serif",
    headingSize: "text-3xl",
    textSize: "text-lg",
    buttonSize: "text-lg",
    buttonPadding: "px-8 py-4",
    iconSize: "w-7 h-7",
    cardPadding: "p-8",
    reduceAnimations: true,
    emojiExtra: false,
    gamified: false,
    voicePlaceholder: true,
  },
};

const ViewModeContext = createContext<ViewModeContextType | null>(null);

export const useViewMode = () => {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be used within ViewModeProvider");
  return ctx;
};

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ViewMode>(() => {
    return (localStorage.getItem("mhc_viewmode") as ViewMode) || "adults";
  });

  const setMode = (m: ViewMode) => {
    setModeState(m);
    localStorage.setItem("mhc_viewmode", m);
  };

  // Apply mode class to document root for CSS-level theming
  useEffect(() => {
    document.documentElement.setAttribute("data-viewmode", mode);
    document.body.style.fontFamily = MODE_CONFIGS[mode].font;
  }, [mode]);

  return (
    <ViewModeContext.Provider value={{ mode, setMode, modeConfig: MODE_CONFIGS[mode] }}>
      {children}
    </ViewModeContext.Provider>
  );
};
