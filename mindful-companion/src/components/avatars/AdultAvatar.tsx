import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { MoodType } from "@/lib/mood-context";

const MOOD_CONFIG: Record<MoodType, { color: string; speed: number; intensity: number }> = {
  happy: { color: "#66BB6A", speed: 1.8, intensity: 0.6 },
  good: { color: "#4CAF50", speed: 1.4, intensity: 0.5 },
  neutral: { color: "#64B5F6", speed: 1.0, intensity: 0.4 },
  sad: { color: "#5C6BC0", speed: 0.6, intensity: 0.3 },
  anxious: { color: "#7E57C2", speed: 2.2, intensity: 0.7 },
};

export default function AdultAvatar({ mood }: { mood: MoodType }) {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { color, speed, intensity } = MOOD_CONFIG[mood];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 🌊 Smooth breathing (emotion-dependent)
    if (groupRef.current) {
      const breathe = 1 + Math.sin(t * speed) * (0.05 + intensity * 0.03);
      groupRef.current.scale.set(breathe, breathe, breathe);

      // 🧠 subtle "thinking" tilt movement
      groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.1;
    }

    // 🔷 Inner core motion (soul)
    if (innerRef.current) {
      innerRef.current.rotation.x = t * 0.4 * speed;
      innerRef.current.rotation.y = t * 0.3 * speed;

      // 💡 glow pulse
      const mat = innerRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(t * speed * 2) * 0.2;
    }

    // 🧩 Outer shell motion (energy field)
    if (outerRef.current) {
      outerRef.current.rotation.x = -t * 0.2 * speed;
      outerRef.current.rotation.y = -t * 0.35 * speed;

      const mat = outerRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.2 + Math.sin(t * speed * 1.5) * 0.1;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
      <group ref={groupRef}>

        {/* 🔮 Inner core (emotion center) */}
        <mesh ref={innerRef}>
          <icosahedronGeometry args={[0.7, 1]} />
          <meshStandardMaterial
            color={color}
            roughness={0.25}
            metalness={0.9}
            emissive={color}
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* 🌐 Outer energy shell */}
        <mesh ref={outerRef}>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshStandardMaterial
            color={color}
            wireframe
            transparent
            opacity={0.25}
            emissive={color}
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* ✨ Subtle aura glow */}
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.05}
          />
        </mesh>

      </group>
    </Float>
  );
}