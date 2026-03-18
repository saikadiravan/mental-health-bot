import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export type MoodType = "happy" | "good" | "neutral" | "sad" | "anxious";

export interface MoodEntry {
  id: string;
  mood: MoodType;
  note: string;
  date: string; // ISO string
}

interface MoodContextType {
  entries: MoodEntry[];
  addEntry: (mood: MoodType, note: string) => Promise<void>;
}

const MoodContext = createContext<MoodContextType | null>(null);

export const useMood = () => {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error("useMood must be used within MoodProvider");
  return ctx;
};

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  // Base URL for your FastAPI mood endpoints
  const API_BASE_URL = "http://127.0.0.1:8000/api/moods";

  // Automatically fetch the user's mood history when they log in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetch(`${API_BASE_URL}/?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => setEntries(data))
        .catch(err => console.error("Failed to fetch moods:", err));
    } else {
      setEntries([]); // Clear entries when logged out
    }
  }, [user, isAuthenticated]);

  // Save a new mood entry to the database
  const addEntry = useCallback(async (mood: MoodType, note: string) => {
    if (!user) return;

    const newEntry = {
      mood,
      note,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/?user_id=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) throw new Error("Failed to save mood");

      // The backend returns the fully created entry (with its new ID)
      const savedEntry = await response.json();
      
      // Update the local state so the UI updates instantly
      setEntries(prev => [savedEntry, ...prev]);
    } catch (error) {
      console.error("Error saving mood:", error);
    }
  }, [user]);

  return (
    <MoodContext.Provider value={{ entries, addEntry }}>
      {children}
    </MoodContext.Provider>
  );
};