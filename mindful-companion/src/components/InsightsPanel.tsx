import { useMemo } from "react";
import { useMood } from "@/lib/mood-context";
import { useJournal } from "@/lib/journal-context";
import { startOfHour } from "date-fns";

export default function InsightsPanel() {
  const { entries: moodEntries } = useMood();
  const { entries: journalEntries } = useJournal();

  const insights = useMemo(() => {
    if (moodEntries.length === 0) return [];

    const results: string[] = [];

    // -----------------------------
    // 🧠 1. Most common mood
    // -----------------------------
    const moodCount: Record<string, number> = {};

    moodEntries.forEach((e) => {
      moodCount[e.mood] = (moodCount[e.mood] || 0) + 1;
    });

    const mostCommonMood = Object.entries(moodCount).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    if (mostCommonMood) {
      results.push(`Your most frequent mood is "${mostCommonMood}".`);
    }

    // -----------------------------
    // 🌙 2. Time-based pattern
    // -----------------------------
    let nightCount = 0;
    let dayCount = 0;

    moodEntries.forEach((e) => {
      const hour = new Date(e.date).getHours();
      if (hour >= 20 || hour <= 5) nightCount++;
      else dayCount++;
    });

    if (nightCount > dayCount) {
      results.push("You tend to feel more emotionally active at night.");
    }

    // -----------------------------
    // 📈 3. Journaling impact
    // -----------------------------
    if (journalEntries.length > 0 && moodEntries.length > 3) {
      results.push("You are building a healthy habit of reflection.");
    }

    // -----------------------------
    // 🔁 4. Consistency insight
    // -----------------------------
    if (moodEntries.length >= 5) {
      results.push("You’ve been consistently tracking your emotions.");
    }

    // -----------------------------
    // ⚠️ 5. Stress signal
    // -----------------------------
    const negativeCount = moodEntries.filter(
      (m) => m.mood === "sad" || m.mood === "anxious"
    ).length;

    if (negativeCount > moodEntries.length / 2) {
      results.push("You’ve been experiencing more negative emotions lately.");
    }

    return results;
  }, [moodEntries, journalEntries]);

  if (insights.length === 0) return null;

  return (
    <div className="mt-4 w-full max-w-md">
      <div className="rounded-xl border bg-card text-card-foreground p-4 shadow-sm">
        
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
          🧠 Insights
        </h3>

        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="text-xs p-2 rounded-md bg-muted border border-border"
            >
              {insight}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}