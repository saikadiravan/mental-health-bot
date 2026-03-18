import React, { createContext, useContext, useState, useMemo } from "react";

export type LanguageCode = "en" | "hi" | "ta" | "kn";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  speechLangCode: string; // The BCP-47 tag for the Web Speech API
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem("mhc_language") as LanguageCode) || "en";
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("mhc_language", lang);
  };

  // Map the internal language state to native browser TTS language codes
  const speechLangCode = useMemo(() => {
    switch (language) {
      case "hi": return "hi-IN"; // Hindi (India)
      case "ta": return "ta-IN"; // Tamil (India)
      case "kn": return "kn-IN"; // Kannada (India)
      default: return "en-US";   // English (US)
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, speechLangCode }}>
      {children}
    </LanguageContext.Provider>
  );
};