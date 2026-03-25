import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AuraRingProps {
  radius?: number;
  speed?: number;
  color?: string;
  unlocked: boolean;
  index?: number; // to slightly offset multiple rings
}

export default function AuraRing({
  radius = 1.2,
  speed = 0.5,
  color = "#FFD700",
  unlocked,
  index = 0,
}: AuraRingProps) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;

    const t = state.clock.getElapsedTime();

    // 🌀 Orbit rotation
    ringRef.current.rotation.z = t * speed + index;

    // 🌊 Subtle floating wave
    ringRef.current.position.y = Math.sin(t * 1.5 + index) * 0.1;

    // 💓 Pulse effect
    const scale = unlocked
      ? 1 + Math.sin(t * 2) * 0.05
      : 1 + Math.sin(t * 1.5) * 0.02;

    ringRef.current.scale.set(scale, scale, scale);

    // ✨ Emissive glow animation
    const mat = ringRef.current.material as THREE.MeshStandardMaterial;

    if (unlocked) {
      mat.emissiveIntensity = 0.6 + Math.sin(t * 3) * 0.3;
    } else {
      mat.emissiveIntensity = 0.1 + Math.sin(t * 2) * 0.05;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.04, 16, 100]} />
      <meshStandardMaterial
       color={color}
  emissive={color}
  emissiveIntensity={unlocked ? 2 : 0.3}
  transparent
  opacity={unlocked ? 0.9 : 0.2}
  roughness={0.1}
  metalness={1}
      />
    </mesh>
  );
}