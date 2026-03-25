import { useMemo } from "react";
import { useMood } from "@/lib/mood-context";
import { useJournal } from "@/lib/journal-context";
import { subDays, isAfter } from "date-fns";

export default function WeeklyReflection() {
  const { entries: moodEntries } = useMood();
  const { entries: journalEntries } = useJournal();

  const reflection = useMemo(() => {
    const last7Days = subDays(new Date(), 7);

    const recentMoods = moodEntries.filter(e =>
      isAfter(new Date(e.date), last7Days)
    );

    const recentJournals = journalEntries.filter(e =>
      isAfter(new Date(e.date), last7Days)
    );

    if (recentMoods.length === 0) return null;

    // -----------------------------
    // 🧠 Most common mood
    // -----------------------------
    const moodCount: Record<string, number> = {};

    recentMoods.forEach((e) => {
      moodCount[e.mood] = (moodCount[e.mood] || 0) + 1;
    });

    const mostCommonMood = Object.entries(moodCount).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    // -----------------------------
    // 📊 Mood trend
    // -----------------------------
    const negativeCount = recentMoods.filter(
      (m) => m.mood === "sad" || m.mood === "anxious"
    ).length;

    const positiveCount = recentMoods.filter(
      (m) => m.mood === "happy" || m.mood === "good"
    ).length;

    let trend = "balanced";

    if (positiveCount > negativeCount) trend = "positive";
    else if (negativeCount > positiveCount) trend = "challenging";

    // -----------------------------
    // ✍️ Build reflection text
    // -----------------------------
    return {
      totalLogs: recentMoods.length,
      journals: recentJournals.length,
      mostCommonMood,
      trend,
    };
  }, [moodEntries, journalEntries]);

  if (!reflection) return null;

  return (
    <div className="mt-4 w-full max-w-md">
      <div className="rounded-xl border bg-card text-card-foreground p-4 shadow-sm">

        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
          📅 Weekly Reflection
        </h3>

        <div className="text-xs space-y-2">

          <p>
            • You logged <strong>{reflection.totalLogs}</strong> moods this week.
          </p>

          <p>
            • Most common mood: <strong>{reflection.mostCommonMood}</strong>
          </p>

          <p>
            • Journaling days: <strong>{reflection.journals}</strong>
          </p>

          <p>
            • Overall trend:{" "}
            <strong>
              {reflection.trend === "positive" && "Improving 🌱"}
              {reflection.trend === "challenging" && "A bit tough 💭"}
              {reflection.trend === "balanced" && "Stable ⚖️"}
            </strong>
          </p>

          <div className="mt-2 p-2 rounded-md bg-muted border text-xs">
            💡 Keep showing up — small consistency leads to meaningful change.
          </div>

        </div>
      </div>
    </div>
  );
}