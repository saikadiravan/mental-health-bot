import { useMemo } from "react";
import { useMood } from "@/lib/mood-context";
import { useJournal } from "@/lib/journal-context";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Activity, FileDown } from "lucide-react"; // <-- Added FileDown
import { exportTherapistSummary } from "@/lib/pdf-export"; // <-- Added Import

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--mood-happy))",
  "hsl(var(--mood-neutral))",
  "hsl(var(--accent-foreground))",
];

export default function WellbeingWidget() {
  const { entries: moodEntries } = useMood();
  const { entries: journalEntries } = useJournal();

  const data = useMemo(() => {
    const stats = [
      { name: "Mood Logs", value: moodEntries.length },
      { name: "Journal Entries", value: journalEntries.length },
      { name: "Resources Used", value: Math.max(1, Math.floor((moodEntries.length + journalEntries.length) * 0.4)) },
    ];
    if (stats.every(s => s.value === 0)) {
      return [{ name: "Get Started", value: 1 }];
    }
    return stats;
  }, [moodEntries, journalEntries]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Activity className="w-4 h-4 text-primary" />
          Wellbeing Overview
        </div>
        
        {/* NEW: Therapist Summary Button */}
        {(moodEntries.length > 0 || journalEntries.length > 0) && (
          <button 
            onClick={() => exportTherapistSummary(moodEntries, journalEntries)}
            className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            Therapist Report
          </button>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="w-28 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" strokeWidth={0}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-muted-foreground">{d.name}</span>
              <span className="font-semibold text-foreground">{d.value}</span>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground pt-1">{total} total activities</p>
        </div>
      </div>
    </div>
  );
}