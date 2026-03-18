import { useMemo } from "react";
import { useMood } from "@/lib/mood-context";
import { useViewMode } from "@/lib/viewmode-context";
import { Link } from "react-router-dom";
import { Flame, Plus } from "lucide-react";
import { startOfDay, subDays, isAfter } from "date-fns";

export default function StreakHeader() {
  const { entries } = useMood();
  const { mode } = useViewMode();
  const isSeniors = mode === "seniors";
  const isTeens = mode === "teens";

  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    let count = 0;
    const today = startOfDay(new Date());
    for (let i = 0; i < 365; i++) {
      const day = subDays(today, i);
      const dayEnd = subDays(today, i - 1);
      const hasEntry = entries.some(e => {
        const d = new Date(e.date);
        return isAfter(d, day) && !isAfter(d, dayEnd);
      });
      if (hasEntry) count++;
      else if (i > 0) break;
    }
    return count;
  }, [entries]);

  const pillSize = isSeniors ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs";
  const iconSize = isSeniors ? "w-5 h-5" : "w-3.5 h-3.5";

  return (
    <div className="flex items-center gap-3">
      {streak > 0 && (
        <div className={`flex items-center gap-1.5 ${pillSize} rounded-full bg-primary/10 text-primary font-semibold`}>
          <Flame className={iconSize} />
          {streak} day streak {isTeens && "🔥"}
        </div>
      )}
      <Link
        to="/mood"
        className={`flex items-center gap-1.5 ${pillSize} rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors`}
        aria-label="Log new mood"
      >
        <Plus className={iconSize} />
        {isSeniors ? "Log Mood" : "New Log"}
      </Link>
    </div>
  );
}
