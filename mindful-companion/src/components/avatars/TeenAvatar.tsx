import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { MoodType } from "@/lib/mood-context";

const MOOD_COLORS: Record<MoodType, string> = {
  happy: "#FF6B9D",
  good: "#FF9A56",
  neutral: "#B388FF",
  sad: "#7986CB",
  anxious: "#CE93D8",
};

function EmojiParticle({ position, emoji, speed }: { position: [number, number, number]; emoji: string; speed: number }) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed) * 0.3;
    ref.current.position.x = position[0] + Math.cos(t * speed * 0.7) * 0.15;
    ref.current.rotation.z = Math.sin(t * speed * 0.5) * 0.3;
  });

  return (
    <group ref={ref} position={position}>
      <sprite scale={[0.25, 0.25, 0.25]}>
        <spriteMaterial opacity={0.7} color="#ffffff" />
      </sprite>
    </group>
  );
}

export default function TeenAvatar({ mood }: { mood: MoodType }) {
  const bodyRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Mesh>(null);
  const rightEarRef = useRef<THREE.Mesh>(null);
  const color = MOOD_COLORS[mood];

  useFrame((state) => {
    if (!bodyRef.current) return;
    const t = state.clock.getElapsedTime();

    // Energetic bounce
    const bounceSpeed = mood === "happy" ? 3 : mood === "sad" ? 1 : 2;
    const bounceAmp = mood === "sad" ? 0.05 : 0.15;
    bodyRef.current.position.y = Math.abs(Math.sin(t * bounceSpeed)) * bounceAmp;

    // Head tilt for sad/anxious
    if (mood === "sad" || mood === "anxious") {
      bodyRef.current.rotation.z = Math.sin(t * 0.8) * 0.15;
    } else {
      bodyRef.current.rotation.z = Math.sin(t * 1.5) * 0.05;
    }

    // Wave for happy
    if (mood === "happy" || mood === "good") {
      bodyRef.current.rotation.y = Math.sin(t * 2) * 0.1;
    }

    // Ear wiggle
    if (leftEarRef.current && rightEarRef.current) {
      leftEarRef.current.rotation.z = 0.3 + Math.sin(t * 3) * 0.1;
      rightEarRef.current.rotation.z = -0.3 - Math.sin(t * 3) * 0.1;
    }
  });

  const mouthArc = mood === "sad" || mood === "anxious" ? -Math.PI * 0.5 : Math.PI * 0.7;

  return (
    <Float speed={3} rotationIntensity={0.4} floatIntensity={1}>
      <group ref={bodyRef}>
        {/* Body - rounded blob */}
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} />
        </mesh>

        {/* Belly highlight */}
        <mesh position={[0, -0.15, 0.55]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.3} transparent />
        </mesh>

        {/* Left ear */}
        <mesh ref={leftEarRef} position={[-0.45, 0.55, 0]} rotation={[0, 0, 0.3]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        {/* Right ear */}
        <mesh ref={rightEarRef} position={[0.45, 0.55, 0]} rotation={[0, 0, -0.3]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>

        {/* Eyes - big cute eyes */}
        <mesh position={[-0.22, 0.15, 0.6]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.22, 0.15, 0.6]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        {/* Pupils */}
        <mesh position={[-0.22, 0.15, 0.72]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0.22, 0.15, 0.72]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        {/* Eye sparkle */}
        <mesh position={[-0.19, 0.19, 0.76]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.25, 0.19, 0.76]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
        </mesh>

        {/* Blush spots */}
        <mesh position={[-0.38, -0.02, 0.5]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#FF6B9D" opacity={0.4} transparent />
        </mesh>
        <mesh position={[0.38, -0.02, 0.5]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#FF6B9D" opacity={0.4} transparent />
        </mesh>

        {/* Mouth */}
        <mesh position={[0, -0.1, 0.62]}>
          <torusGeometry args={[0.12, 0.025, 8, 16, mouthArc]} />
          <meshStandardMaterial color="#333333" />
        </mesh>

        {/* Small arms/nubs */}
        <mesh position={[-0.65, -0.1, 0]}>
          <capsuleGeometry args={[0.1, 0.2, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        <mesh position={[0.65, -0.1, 0]}>
          <capsuleGeometry args={[0.1, 0.2, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      </group>

      {/* Floating sparkle orbs */}
      <EmojiParticle position={[-1.2, 0.8, -0.5]} emoji="✨" speed={1.5} />
      <EmojiParticle position={[1.1, 0.6, -0.3]} emoji="😊" speed={1.2} />
      <EmojiParticle position={[0, 1.2, -0.4]} emoji="💭" speed={1} />

      {/* Sparkle meshes */}
      {[[-1.2, 0.8, -0.5], [1.1, 0.6, -0.3], [0, 1.2, -0.4], [-0.8, -0.6, 0.2], [0.9, -0.5, 0.1]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <octahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#FFD700" : "#FF6B9D"}
            emissive={i % 2 === 0 ? "#FFD700" : "#FF6B9D"}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </Float>
  );
}
