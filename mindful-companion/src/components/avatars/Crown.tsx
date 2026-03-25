import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CrownProps {
  unlocked: boolean;
  height?: number; // position above avatar
}

export default function Crown({ unlocked, height = 1.6 }: CrownProps) {
  const crownRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!crownRef.current) return;

    const t = state.clock.getElapsedTime();

    // 👑 Slow rotation (royal feel)
    crownRef.current.rotation.y = t * 0.6;

    // 🌊 Floating motion
    crownRef.current.position.y = height + Math.sin(t * 1.5) * 0.08;

    // 💓 Pulse effect
    const scale = unlocked
      ? 1 + Math.sin(t * 2) * 0.06
      : 1 + Math.sin(t * 1.5) * 0.02;

    crownRef.current.scale.set(scale, scale, scale);

    // ✨ Glow animation
    crownRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh)
          .material as THREE.MeshStandardMaterial;

        if (unlocked) {
          mat.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.3;
        } else {
          mat.emissiveIntensity = 0.15 + Math.sin(t * 2) * 0.05;
        }
      }
    });
  });

  return (
    <group ref={crownRef}>
      {/* 👑 Crown Base */}
      <mesh>
        <cylinderGeometry args={[0.45, 0.5, 0.2, 16]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={unlocked ? 0.9 : 0.2}
          metalness={0.9}
          roughness={0.2}
          transparent
          opacity={unlocked ? 1 : 0.3} // 🔒 locked effect
        />
      </mesh>

      {/* 👑 Spikes */}
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const x = Math.cos(angle) * 0.45;
        const z = Math.sin(angle) * 0.45;

        return (
          <mesh key={i} position={[x, 0.25, z]}>
            <coneGeometry args={[0.08, 0.3, 8]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={unlocked ? 0.9 : 0.2}
              metalness={0.9}
              roughness={0.2}
              transparent
              opacity={unlocked ? 1 : 0.3}
            />
          </mesh>
        );
      })}

      {/* 💎 Jewel */}
      <mesh position={[0, 0.35, 0]}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial
          color="#FF6B9D"
          emissive="#FF6B9D"
          emissiveIntensity={unlocked ? 1.2 : 0.3}
          roughness={0.1}
          metalness={0.5}
          transparent
          opacity={unlocked ? 1 : 0.4}
        />
      </mesh>
    </group>
  );
}