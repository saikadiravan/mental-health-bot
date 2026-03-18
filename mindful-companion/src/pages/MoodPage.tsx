import { useState, useMemo, Suspense } from "react";
import AppLayout from "@/components/AppLayout";
import { useMood, type MoodType } from "@/lib/mood-context";
import { useViewMode } from "@/lib/viewmode-context";
import { useVoice } from "@/lib/voice-context";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays, startOfDay, isAfter } from "date-fns";
import { TrendingUp, TrendingDown, Minus, Flame, Download } from "lucide-react";
import WellbeingWidget from "@/components/WellbeingWidget";
import AvatarManager from "@/components/avatars/AvatarManager";
import { exportMoodPDF } from "@/lib/pdf-export";

const MOODS: { type: MoodType; emoji: string; label: string; value: number }[] = [
  { type: "anxious", emoji: "😢", label: "Awful", value: 1 },
  { type: "sad", emoji: "😔", label: "Bad", value: 3 },
  { type: "neutral", emoji: "😐", label: "Okay", value: 5 },
  { type: "good", emoji: "😊", label: "Good", value: 7 },
  { type: "happy", emoji: "😄", label: "Great", value: 10 },
];

const MOOD_VALUE: Record<MoodType, number> = { happy: 10, good: 7, neutral: 5, sad: 3, anxious: 1 };
type TimeRange = "week" | "month" | "all";

function getMoodFromSlider(value: number): MoodType {
  if (value <= 2) return "anxious";
  if (value <= 4) return "sad";
  if (value <= 6) return "neutral";
  if (value <= 8) return "good";
  return "happy";
}
function getMoodEmoji(value: number): string {
  return MOODS.find(m => m.type === getMoodFromSlider(value))?.emoji || "😐";
}

export default function MoodPage() {
  const { entries, addEntry } = useMood();
  const { mode, modeConfig } = useViewMode();
  const { speak } = useVoice();
  const [sliderValue, setSliderValue] = useState(5);
  const [note, setNote] = useState("");
  const [range, setRange] = useState<TimeRange>("week");
  const [justLogged, setJustLogged] = useState(false);

  const isSeniors = mode === "seniors";
  const isTeens = mode === "teens";
  const currentMood = getMoodFromSlider(sliderValue);

  const handleLog = () => {
    addEntry(currentMood, note);
    setSliderValue(5);
    setNote("");
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2000);
  };

  const chartData = useMemo(() => {
    const days = range === "week" ? 7 : range === "month" ? 30 : 90;
    const cutoff = startOfDay(subDays(new Date(), days));
    const filtered = entries.filter(e => isAfter(new Date(e.date), cutoff));
    const grouped: Record<string, { total: number; count: number }> = {};
    filtered.forEach(e => { const key = format(new Date(e.date), "MMM d"); if (!grouped[key]) grouped[key] = { total: 0, count: 0 }; grouped[key].total += MOOD_VALUE[e.mood]; grouped[key].count += 1; });
    return Object.entries(grouped).map(([date, { total, count }]) => ({ date, value: Math.round((total / count) * 10) / 10 })).slice(-days);
  }, [entries, range]);

  const avgMood = useMemo(() => {
    if (entries.length === 0) return null;
    const recent = entries.slice(0, 7);
    return Math.round((recent.reduce((s, e) => s + MOOD_VALUE[e.mood], 0) / recent.length) * 10) / 10;
  }, [entries]);

  const insight = useMemo(() => {
    if (entries.length < 2) return null;
    const recent = entries.slice(0, 3);
    const older = entries.slice(3, 6);
    if (older.length === 0) return null;
    const recentAvg = recent.reduce((s, e) => s + MOOD_VALUE[e.mood], 0) / recent.length;
    const olderAvg = older.reduce((s, e) => s + MOOD_VALUE[e.mood], 0) / older.length;
    const diff = recentAvg - olderAvg;
    const pct = Math.abs(Math.round((diff / Math.max(olderAvg, 1)) * 100));
    if (diff > 1) {
      const text = isSeniors ? `Your mood improved ${pct}% — great progress! Consider sharing with family. 🌟` : isTeens ? `Mood UP ${pct}%! 🎮🌟 Resilience leveling up!` : `Mood up ${pct}% — resilience building! (Wysa-inspired insight) 🌟`;
      return { text, icon: TrendingUp, positive: true };
    }
    if (diff < -1) {
      const text = isSeniors ? "Your mood has dipped recently. Please be kind to yourself. 💙" : isTeens ? "Mood took a dip 😔 That's okay — everyone has tough days! 💪" : "Your mood has dipped recently. Be gentle with yourself. 💙";
      return { text, icon: TrendingDown, positive: false };
    }
    return { text: "Your mood has been steady. Consistency is a strength. ✨", icon: Minus, positive: true };
  }, [entries, isSeniors, isTeens]);

  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    let count = 0;
    const today = startOfDay(new Date());
    for (let i = 0; i < 365; i++) {
      const day = subDays(today, i);
      const dayEnd = subDays(today, i - 1);
      const hasEntry = entries.some(e => { const d = new Date(e.date); return isAfter(d, day) && !isAfter(d, dayEnd); });
      if (hasEntry) count++; else if (i > 0) break;
    }
    return count;
  }, [entries]);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`${modeConfig.headingSize} font-semibold text-foreground`}>Mood Dashboard {isTeens && "📊🎯"}</h1>
            <p className={`${modeConfig.textSize} text-muted-foreground mt-1`}>{isSeniors ? "How are you feeling today?" : "How are you feeling right now?"}</p>
          </div>
          {streak > 0 && (
            <div className={`flex items-center gap-2 ${isSeniors ? "px-5 py-3 text-base" : "px-4 py-2 text-sm"} rounded-xl bg-primary/10 text-primary font-semibold`}>
              <Flame className={modeConfig.iconSize} /> {streak} day streak {isTeens && "🔥"}
            </div>
          )}
        </div>

        {/* 3D Avatar + Stats row */}
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <Suspense fallback={<div className="w-32 h-32 rounded-2xl bg-primary/10 animate-pulse" />}>
            <AvatarManager mood={currentMood} size="sm" />
          </Suspense>
          {avgMood !== null && (
            <div className="flex-1 grid grid-cols-3 gap-3">
              {[
                { label: "Avg Mood (7d)", value: avgMood },
                { label: "Total Logs", value: entries.length },
                { label: "Day Streak", value: streak },
              ].map(stat => (
                <div key={stat.label} className={`glass-card rounded-xl ${modeConfig.cardPadding} text-center`}>
                  <p className={`${isSeniors ? "text-4xl" : "text-2xl"} font-bold text-foreground`}>{stat.value}</p>
                  <p className={`${modeConfig.textSize} text-muted-foreground`}>{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mood logger */}
        <motion.div className={`glass-card rounded-2xl ${modeConfig.cardPadding} space-y-6`} initial={modeConfig.reduceAnimations ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-center gap-3">
            {MOODS.map(m => (
              <button key={m.type} onClick={() => setSliderValue(m.value)}
                className={`flex flex-col items-center gap-1 ${isSeniors ? "p-4" : "p-3"} rounded-xl transition-all ${getMoodFromSlider(sliderValue) === m.type ? "bg-primary/10 ring-2 ring-primary scale-105" : "hover:bg-secondary"}`}
                aria-label={`Select mood: ${m.label}`}>
                <span className={isSeniors ? "text-4xl" : "text-2xl"}>{m.emoji}</span>
                <span className={`${modeConfig.textSize} text-muted-foreground`}>{m.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className={`flex items-center justify-between ${modeConfig.textSize}`}>
              <span className="text-muted-foreground">{isSeniors ? "Slide to select mood:" : "How do you feel?"}</span>
              <span className={isSeniors ? "text-4xl" : "text-2xl"}>{getMoodEmoji(sliderValue)}</span>
            </div>
            <Slider value={[sliderValue]} onValueChange={([v]) => setSliderValue(v)} min={1} max={10} step={1} aria-label="Mood slider" />
            <div className={`flex justify-between ${modeConfig.textSize} text-muted-foreground`}><span>1 – Awful</span><span>10 – Amazing</span></div>
          </div>

          <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder={isSeniors ? "Write a note about how you feel..." : "Add a note (optional)..."} rows={isSeniors ? 3 : 2} className={`resize-none ${isSeniors ? "text-lg" : ""}`} aria-label="Mood note" />
          <Button onClick={handleLog} className={`w-full ${isSeniors ? "text-lg py-6" : ""}`}>{justLogged ? "✓ Logged!" : isTeens ? "Log Mood 🎯" : "Log Mood"}</Button>
          {isSeniors && <p className="text-sm text-muted-foreground text-center italic">🔊 Click text to hear it read aloud</p>}
          <p className={`text-[10px] text-muted-foreground text-center`}>💾 Data cached locally — log anytime, even offline</p>
        </motion.div>

        {/* Insight */}
        {insight && (
          <motion.div className={`glass-card rounded-2xl ${isSeniors ? "p-6" : "p-4"} flex items-center gap-3 cursor-pointer`}
            initial={modeConfig.reduceAnimations ? false : { opacity: 0 }} animate={{ opacity: 1 }} onClick={() => speak(insight.text)}>
            <div className={`${isSeniors ? "w-12 h-12" : "w-10 h-10"} rounded-xl flex items-center justify-center ${insight.positive ? "bg-primary/10" : "bg-accent"}`}>
              <insight.icon className={`${modeConfig.iconSize} ${insight.positive ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <p className={`${modeConfig.textSize} text-foreground`}>{insight.text}</p>
          </motion.div>
        )}

        <WellbeingWidget />

        {/* Chart */}
        <div className={`glass-card rounded-2xl ${modeConfig.cardPadding} space-y-4`}>
          <div className="flex items-center justify-between">
            <h2 className={`${isSeniors ? "text-lg" : "text-sm"} font-semibold text-foreground`}>Mood History</h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {(["week", "month", "all"] as TimeRange[]).map(r => (
                  <button key={r} onClick={() => setRange(r)}
                    className={`${isSeniors ? "px-4 py-2 text-sm" : "px-3 py-1 text-xs"} rounded-lg font-medium transition-colors ${range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                    {r === "all" ? "3M" : r === "month" ? "30D" : "7D"}
                  </button>
                ))}
              </div>
              <button onClick={() => exportMoodPDF(entries)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Export PDF" title="Export mood report as PDF">
                <Download className={modeConfig.iconSize}  />
              </button>
            </div>
          </div>
          {chartData.length === 0 ? (
            <p className={`${modeConfig.textSize} text-muted-foreground text-center py-8`}>No mood data yet. Start logging to see your trends!</p>
          ) : (
            <ResponsiveContainer width="100%" height={isSeniors ? 280 : 220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: isSeniors ? 14 : 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 10]} ticks={[1, 3, 5, 7, 10]} tick={{ fontSize: isSeniors ? 14 : 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: isSeniors ? "16px" : "12px" }}
                  formatter={(value: number) => [getMoodEmoji(value) + " " + value + "/10", "Mood"]} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={isSeniors ? 3 : 2} dot={{ fill: "hsl(var(--primary))", r: isSeniors ? 6 : 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {entries.length > 0 && (
          <div className="space-y-3">
            <h2 className={`${isSeniors ? "text-lg" : "text-sm"} font-semibold text-foreground`}>Recent Entries</h2>
            {entries.slice(0, 5).map(e => {
              const mood = MOODS.find(m => m.type === e.mood);
              return (
                <div key={e.id} className={`glass-card rounded-xl ${isSeniors ? "px-6 py-4" : "px-4 py-3"} flex items-center gap-3`}>
                  <span className={isSeniors ? "text-3xl" : "text-xl"}>{mood?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`${modeConfig.textSize} font-medium text-foreground`}>{mood?.label}</p>
                    {e.note && <p className={`${isSeniors ? "text-base" : "text-xs"} text-muted-foreground truncate`}>{e.note}</p>}
                  </div>
                  <span className={`${isSeniors ? "text-base" : "text-xs"} text-muted-foreground shrink-0`}>{format(new Date(e.date), "MMM d, h:mm a")}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
