import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useViewMode } from "@/lib/viewmode-context";
import type { MoodType } from "@/lib/mood-context";
import InsightsPanel from "@/components/InsightsPanel";
import WeeklyReflection from "@/components/WeeklyReflection";

const MOOD_COLORS: Record<MoodType, string> = {
  happy: "#FFD700",
  good: "#4CAF50",
  neutral: "#64B5F6",
  sad: "#7986CB",
  anxious: "#CE93D8",
};

function CompanionSphere({ mood, viewMode }: { mood: MoodType; viewMode: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = MOOD_COLORS[mood];

  // Animate based on mood
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    // Breathing animation — slower for sad/anxious, lively for happy
    const speed = mood === "happy" ? 2 : mood === "good" ? 1.5 : mood === "sad" ? 0.6 : mood === "anxious" ? 1.8 : 1;
    const scale = 1 + Math.sin(t * speed) * (mood === "anxious" ? 0.08 : 0.04);
    meshRef.current.scale.setScalar(scale);

    // Gentle nod for empathy
    meshRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.03;
  });

  const geometry = useMemo(() => {
    if (viewMode === "teens") return new THREE.IcosahedronGeometry(1.1, 2);
    if (viewMode === "seniors") return new THREE.SphereGeometry(1.2, 16, 16);
    return new THREE.SphereGeometry(1, 32, 32);
  }, [viewMode]);

  return (
    <Float speed={viewMode === "seniors" ? 0.5 : 2} rotationIntensity={viewMode === "seniors" ? 0.1 : 0.3} floatIntensity={viewMode === "seniors" ? 0.3 : 0.8}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.3, 0.25, 0.85]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.3, 0.25, 0.85]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.3, 0.25, 0.95]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.3, 0.25, 0.95]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Smile - curved line using a torus */}
      <mesh position={[0, -0.1, 0.9]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.2, 0.03, 8, 16, mood === "sad" || mood === "anxious" ? -Math.PI * 0.6 : Math.PI * 0.6]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </Float>
  );
}

interface AvatarCompanionProps {
  mood?: MoodType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function AvatarCompanion({ mood = "neutral", size = "md", className = "" }: AvatarCompanionProps) {
  const { mode, modeConfig } = useViewMode();

  {mode === "adults" && (
  <div className="mt-4 flex flex-col items-center">
    <InsightsPanel />
    <WeeklyReflection />
  </div>
)}

  const sizeMap = { sm: "h-32 w-32", md: "h-48 w-48", lg: "h-64 w-64" };
  const seniorSizeMap = { sm: "h-40 w-40", md: "h-56 w-56", lg: "h-72 w-72" };

  const containerSize = mode === "seniors" ? seniorSizeMap[size] : sizeMap[size];

  return (
    <div className={`${containerSize} ${className} rounded-2xl overflow-hidden`} aria-label={`Companion avatar showing ${mood} mood`}>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <CompanionSphere mood={mood} viewMode={mode} />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
