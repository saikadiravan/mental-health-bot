import { useState, useEffect } from "react";
import { useVoice } from "@/lib/voice-context";
import { useViewMode } from "@/lib/viewmode-context";
import { Volume2, VolumeX, Wifi, WifiOff } from "lucide-react";

export default function VoiceOfflineControls() {
  const { voiceEnabled, toggleVoice, isSpeaking, stop } = useVoice();
  const { mode } = useViewMode();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isSeniors = mode === "seniors";

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const btnSize = isSeniors ? "p-2" : "p-1.5";
  const iconSize = isSeniors ? "w-5 h-5" : "w-3.5 h-3.5";

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={isSpeaking ? stop : toggleVoice}
        className={`${btnSize} rounded-lg transition-colors ${voiceEnabled ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        aria-label={voiceEnabled ? "Disable voice narration" : "Enable voice narration"}
        title={voiceEnabled ? "Voice on" : "Voice off"}
      >
        {voiceEnabled ? <Volume2 className={iconSize} /> : <VolumeX className={iconSize} />}
      </button>
      <div className={`${btnSize} rounded-lg ${isOnline ? "text-primary" : "text-destructive"}`} title={isOnline ? "Online" : "Offline — data cached locally"}>
        {isOnline ? <Wifi className={iconSize} /> : <WifiOff className={iconSize} />}
      </div>
    </div>
  );
}
