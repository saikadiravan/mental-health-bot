import { useMood } from "@/lib/mood-context";
import { useJournal } from "@/lib/journal-context";

export function useGamification() {
  const { entries: moodEntries } = useMood();
  const { entries: journalEntries } = useJournal();

  // Calculate XP: Mood = 10 XP, Journal = 25 XP
  const xp = (moodEntries.length * 10) + (journalEntries.length * 25);
  const level = Math.floor(xp / 100) + 1;

  return { xp, level };
}