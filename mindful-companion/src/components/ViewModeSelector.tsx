import { useViewMode, type ViewMode } from "@/lib/viewmode-context";
import { Eye } from "lucide-react";

const modes: { value: ViewMode; label: string; emoji: string }[] = [
  { value: "teens", label: "Teens", emoji: "🎨" },
  { value: "adults", label: "Adults", emoji: "🌿" },
  { value: "seniors", label: "Seniors", emoji: "🔍" },
];

export default function ViewModeSelector() {
  const { mode, setMode } = useViewMode();

  return (
    <div className="flex items-center gap-2">
      <Eye className="w-4 h-4 text-muted-foreground hidden sm:block" />
      <select
        value={mode}
        onChange={e => setMode(e.target.value as ViewMode)}
        className="bg-secondary text-secondary-foreground rounded-lg px-3 py-1.5 text-xs font-medium border border-border focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        aria-label="View Mode"
      >
        {modes.map(m => (
          <option key={m.value} value={m.value}>
            {m.emoji} {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
