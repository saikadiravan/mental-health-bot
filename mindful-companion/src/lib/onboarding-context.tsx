import React, { createContext, useContext, useState } from "react";

export interface OnboardingPrefs {
  ageGroup: string;
  exercises: string[];
  stressLevel: string;
  goals: string[];
  culturalPrefs: string[];
  frequency: string;
  stressSource: string;
}

interface OnboardingContextType {
  prefs: OnboardingPrefs | null;
  setPrefs: (p: OnboardingPrefs) => void;
  hasCompleted: boolean;
  resetPrefs: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefsState] = useState<OnboardingPrefs | null>(() => {
    const stored = localStorage.getItem("mhc_onboarding");
    return stored ? JSON.parse(stored) : null;
  });

  const setPrefs = (p: OnboardingPrefs) => {
    setPrefsState(p);
    localStorage.setItem("mhc_onboarding", JSON.stringify(p));
  };

  const resetPrefs = () => {
    setPrefsState(null);
    localStorage.removeItem("mhc_onboarding");
  };

  return (
    <OnboardingContext.Provider value={{ prefs, setPrefs, hasCompleted: !!prefs, resetPrefs }}>
      {children}
    </OnboardingContext.Provider>
  );
};
