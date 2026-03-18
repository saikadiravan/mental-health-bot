import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";


export interface JournalEntry {
  id: string;
  prompt: string;
  content: string;
  date: string;
}

interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (prompt: string, content: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  themes: { name: string; count: number }[];
}

const JournalContext = createContext<JournalContextType | null>(null);

export const useJournal = () => {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error("useJournal must be used within JournalProvider");
  return ctx;
};

const THEME_KEYWORDS: Record<string, string[]> = {
  Gratitude: ["grateful", "thankful", "appreciate", "blessed", "thank"],
  Stress: ["stress", "overwhelm", "pressure", "tense", "burden"],
  Growth: ["learn", "grow", "improve", "progress", "better"],
  Joy: ["happy", "joy", "smile", "laugh", "fun", "excited"],
  Relationships: ["friend", "family", "love", "partner", "colleague"],
  Work: ["work", "job", "career", "project", "deadline"],
};

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const API_BASE_URL = "http://127.0.0.1:8000/api/journals";

  // Fetch journal entries from the database when the user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetch(`${API_BASE_URL}/?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => setEntries(data))
        .catch((err) => console.error("Failed to fetch journals:", err));
    } else {
      setEntries([]); // Clear entries when logged out
    }
  }, [user, isAuthenticated]);

  const addEntry = useCallback(async (prompt: string, content: string) => {
    if (!user) return;

    const newEntry = {
      prompt,
      content,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/?user_id=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) throw new Error("Failed to save journal entry");

      const savedEntry = await response.json();
      setEntries((prev) => [savedEntry, ...prev]);
    } catch (error) {
      console.error("Error saving journal entry:", error);
    }
  }, [user]);

  const deleteEntry = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete journal entry");

      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting journal entry:", error);
    }
  }, [user]);

  // Keep the existing theme analysis logic which runs purely on the frontend state
  const themes = useMemo(() => {
    const allText = entries.map((e) => e.content.toLowerCase()).join(" ");
    return Object.entries(THEME_KEYWORDS)
      .map(([name, keywords]) => ({
        name,
        count: keywords.reduce((sum, kw) => sum + (allText.split(kw).length - 1), 0),
      }))
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  return (
    <JournalContext.Provider value={{ entries, addEntry, deleteEntry, themes }}>
      {children}
    </JournalContext.Provider>
  );
};