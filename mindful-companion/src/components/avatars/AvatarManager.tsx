import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useViewMode } from "@/lib/viewmode-context";
import type { MoodType } from "@/lib/mood-context";
import TeenAvatar from "./TeenAvatar";
import AdultAvatar from "./AdultAvatar";
import SeniorAvatar from "./SeniorAvatar";

interface AvatarManagerProps {
  mood?: MoodType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SPEECH_BUBBLES: Record<MoodType, string> = {
  happy: "You're doing great! 🌟",
  good: "Keep it up!",
  neutral: "I'm here for you.",
  sad: "It's okay to feel this way.",
  anxious: "Take a deep breath with me.",
};

export default function AvatarManager({ mood = "neutral", size = "md", className = "" }: AvatarManagerProps) {
  const { mode } = useViewMode();

  const sizeMap = { sm: "h-32 w-32", md: "h-48 w-48", lg: "h-64 w-64" };
  const seniorSizeMap = { sm: "h-40 w-40", md: "h-56 w-56", lg: "h-72 w-72" };
  const containerSize = mode === "seniors" ? seniorSizeMap[size] : sizeMap[size];

  const cameraZ = mode === "teens" ? 3.5 : mode === "seniors" ? 4 : 3.5;

  return (
    <div className={`${containerSize} ${className} relative`}>
      <div className="w-full h-full rounded-2xl overflow-hidden" aria-label={`Companion avatar showing ${mood} mood`}>
        <Canvas camera={{ position: [0, 0, cameraZ], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <Suspense fallback={null}>
            {mode === "teens" && <TeenAvatar mood={mood} />}
            {mode === "adults" && <AdultAvatar mood={mood} />}
            {mode === "seniors" && <SeniorAvatar mood={mood} />}
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </div>
      {/* Speech bubble */}
      <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl px-3 py-1.5 shadow-md text-center whitespace-nowrap
        ${mode === "seniors" ? "text-base" : "text-xs"} text-muted-foreground max-w-[90%] truncate`}>
        {SPEECH_BUBBLES[mood]}
      </div>
    </div>
  );
}
