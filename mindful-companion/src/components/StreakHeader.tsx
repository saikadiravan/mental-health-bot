import { useMemo, useState } from "react";
import { useMood } from "@/lib/mood-context";
import { useJournal } from "@/lib/journal-context";
import { useViewMode } from "@/lib/viewmode-context";
import { Link } from "react-router-dom";
import { Flame, Plus, Trophy, ChevronDown } from "lucide-react";
import { startOfDay, subDays, isAfter } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function StreakHeader() {
  const { entries: moodEntries } = useMood();
  const { entries: journalEntries } = useJournal();
  const { mode } = useViewMode();

  const isSeniors = mode === "seniors";
  const isTeens = mode === "teens";

  const [showRewards, setShowRewards] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  // 🔥 STREAK
  const streak = useMemo(() => {
    if (moodEntries.length === 0) return 0;
    let count = 0;
    const today = startOfDay(new Date());
    for (let i = 0; i < 365; i++) {
      const day = subDays(today, i);
      const dayEnd = subDays(today, i - 1);
      const hasEntry = moodEntries.some(e => {
        const d = new Date(e.date);
        return isAfter(d, day) && !isAfter(d, dayEnd);
      });
      if (hasEntry) count++;
      else if (i > 0) break;
    }
    return count;
  }, [moodEntries]);

  // 🎮 DYNAMIC XP SYSTEM
  const totalXp = (moodEntries.length * 10) + (journalEntries.length * 25);

  // 📈 Progressive leveling (gets harder each level)
  const getXpForLevel = (lvl: number) => 100 + (lvl - 1) * 50;

  const { level, currentLevelXP, nextLevelXP, xpProgress } = useMemo(() => {
    let lvl = 1;
    let xp = totalXp;

    while (xp >= getXpForLevel(lvl)) {
      xp -= getXpForLevel(lvl);
      lvl++;
    }

    const currentLevelXP = xp;
    const nextLevelXP = getXpForLevel(lvl);
    const xpProgress = (currentLevelXP / nextLevelXP) * 100;

    return { level: lvl, currentLevelXP, nextLevelXP, xpProgress };
  }, [totalXp]);

  const pillSize = isSeniors ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs";
  const iconSize = isSeniors ? "w-5 h-5" : "w-3.5 h-3.5";

  // 🎯 Levels Preview
  const levels = Array.from({ length: 6 }, (_, i) => {
    const lvl = i + 1;
    return {
      lvl,
      xp: getXpForLevel(lvl),
    };
  });

  const getTaskHint = (xpNeeded: number) => {
    const moods = Math.ceil(xpNeeded / 10);
    const journals = Math.ceil(xpNeeded / 25);
    return `≈ ${moods} moods or ${journals} journals`;
  };

  return (
    <div className="flex items-center gap-3 relative">

      {/* 🎮 XP + Rewards */}
      {isTeens && (
        <div className="relative">

          {/* XP BAR */}
          <div
            onClick={() => setShowRewards(prev => !prev)}
            className="cursor-pointer flex flex-col px-3 py-1.5 rounded-xl bg-accent text-accent-foreground min-w-[150px] shadow border border-border transition-all hover:scale-[1.03]"
          >
            <div className="flex justify-between text-[10px] mb-1 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-yellow-500" />
                Lvl {level}
              </span>
              <span className="flex items-center gap-1">
                {Math.floor(currentLevelXP)}/{nextLevelXP}
                <ChevronDown className={`w-3 h-3 transition ${showRewards ? "rotate-180" : ""}`} />
              </span>
            </div>

            {/* Animated Progress */}
            <div className="relative">
              <Progress value={xpProgress} className="h-1.5 bg-background" />
              <div
                className="absolute top-0 left-0 h-1.5 bg-primary rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          {/* 🎁 DROPDOWN */}
          {showRewards && (
            <div className="absolute top-12 left-0 w-60 bg-popover text-popover-foreground border border-border rounded-xl shadow-lg p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">

              <p className="text-xs font-semibold mb-2 text-muted-foreground">
                🎯 Level System
              </p>

              <div className="space-y-2">
                {levels.map((l) => {
                  const unlocked = level >= l.lvl;

                  return (
                    <div
                      key={l.lvl}
                      onClick={() => setSelectedLevel(l.lvl)}
                      className={`p-2 rounded-md cursor-pointer border transition-all ${
                        unlocked
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-muted hover:bg-muted/70"
                      }`}
                    >
                      <div className="flex justify-between text-xs">
                        <span>Level {l.lvl}</span>
                        <span>{l.xp} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 📦 TASK BOX */}
              {selectedLevel && (
                <div className="mt-3 p-2 rounded-md bg-background border text-xs animate-in fade-in duration-200">
                  {(() => {
                    const targetXP = levels.find(l => l.lvl === selectedLevel)?.xp || 0;

                    let cumulativeXP = 0;
                    for (let i = 1; i < selectedLevel; i++) {
                      cumulativeXP += getXpForLevel(i);
                    }

                    const xpNeeded = Math.max(cumulativeXP - totalXp, 0);

                    return xpNeeded === 0
                      ? "✅ Already reached!"
                      : `You need ${xpNeeded} XP\n${getTaskHint(xpNeeded)}`;
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 🔥 STREAK */}
      {streak > 0 && (
        <div className={`flex items-center gap-1.5 ${pillSize} rounded-full bg-primary/10 text-primary font-semibold`}>
          <Flame className={iconSize} /> {streak} day streak {isTeens && "🔥"}
        </div>
      )}

      {/* ➕ BUTTON */}
      <Link
        to="/mood"
        className={`flex items-center gap-1.5 ${pillSize} rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition`}
      >
        <Plus className={iconSize} /> {isSeniors ? "Log Mood" : "New Log"}
      </Link>
    </div>
  );
}