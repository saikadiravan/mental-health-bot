import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface VoiceContextType {
  voiceEnabled: boolean;
  toggleVoice: () => void;
  speak: (text: string, langCode?: string) => void;
  stop: () => void;
  isSpeaking: boolean;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

export const useVoice = () => {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within VoiceProvider");
  return ctx;
};

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    return localStorage.getItem("mhc_voice") === "true";
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleVoice = () => {
    setVoiceEnabled(prev => {
      const next = !prev;
      localStorage.setItem("mhc_voice", String(next));
      if (!next) window.speechSynthesis?.cancel();
      return next;
    });
  };

  const speak = useCallback((text: string, langCode: string = "en-US") => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    
    // Clean up markdown/special characters before speaking
    const clean = text.replace(/[*#_\[\]()]/g, "").replace(/\n+/g, ". ");
    const utterance = new SpeechSynthesisUtterance(clean);
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = langCode; // <-- Apply the regional language code!
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  return (
    <VoiceContext.Provider value={{ voiceEnabled, toggleVoice, speak, stop, isSpeaking }}>
      {children}
    </VoiceContext.Provider>
  );
};
