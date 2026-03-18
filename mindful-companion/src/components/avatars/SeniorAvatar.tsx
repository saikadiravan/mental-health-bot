import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MoodType } from "@/lib/mood-context";

const MOOD_CONFIG: Record<MoodType, { color: string; speed: number }> = {
  happy: { color: "#81C784", speed: 1.2 },
  good: { color: "#66BB6A", speed: 1.0 },
  neutral: { color: "#90A4AE", speed: 0.8 },
  sad: { color: "#78909C", speed: 0.6 },
  anxious: { color: "#A1887F", speed: 1.4 },
};

export default function SeniorAvatar({ mood }: { mood: MoodType }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const { color, speed } = MOOD_CONFIG[mood];

  // 🌌 Create soft particle field
  const particles = new Float32Array(150 * 3);
  for (let i = 0; i < particles.length; i++) {
    particles[i] = (Math.random() - 0.5) * 4;
  }

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 🌿 breathing motion
    const breathe = 1 + Math.sin(t * speed) * 0.04;

    if (groupRef.current) {
      groupRef.current.scale.set(breathe, breathe, breathe);
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.1;
    }

    // 🔮 core glow pulse
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.25 + Math.sin(t * speed * 1.5) * 0.15;
    }

    // 🌀 inner ring (stable guidance)
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.2;
    }

    // 🌊 outer ring (slow drift)
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = Math.sin(t * 0.3) * 0.3 + Math.PI / 2;
      outerRingRef.current.rotation.y = -t * 0.1;
    }

    // ✨ particles subtle motion
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.02;
    }
  });

  return (
    <group ref={groupRef}>

      {/* 🔮 Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.6}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* 🧘 Stable inner ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.03, 16, 100]} />
        <meshStandardMaterial
          color="#E0E0E0"
          emissive="#E0E0E0"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* 🌊 Outer flowing ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.4, 0.02, 16, 100]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.4}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* ✨ Particle field (life) */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color={color}
          transparent
          opacity={0.5}
        />
      </points>

      {/* 🌫 Aura */}
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} />
      </mesh>

    </group>
  );
}