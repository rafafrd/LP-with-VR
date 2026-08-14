import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import { usePerfProfile, type PerfProfile } from "../hooks/usePerfProfile";

const SEGMENTS: Record<PerfProfile, { radial: number; tubular: number }> = {
  high: { radial: 16, tubular: 96 },
  medium: { radial: 12, tubular: 72 },
  low: { radial: 8, tubular: 48 },
};

type RingProps = {
  radius: number;
  color: string;
  speed?: number;
  tilt?: number;
  opacity?: number;
  reverse?: boolean;
  segments?: { radial: number; tubular: number };
};

function Ring({ radius, color, speed = 1, tilt = 0, opacity = 0.5, reverse = false, segments }: RingProps) {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const dir = reverse ? -1 : 1;
    mesh.rotation.x += dir * delta * speed;
    mesh.rotation.y += dir * delta * speed * 0.6;
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2.4 + tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.022, segments?.radial ?? 12, segments?.tubular ?? 72]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={opacity} />
    </mesh>
  );
}

function Core() {
  const ref = useRef<Mesh>(null);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const scale = 1 + Math.sin(performance.now() / 700) * 0.06;
    mesh.scale.setScalar(scale);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color="#cfff04" emissive="#cfff04" emissiveIntensity={1.6} />
    </mesh>
  );
}

function PortalPlaceholder({ segments }: { segments: RingProps["segments"] }) {
  return (
    <group position={[0, 0, 0]}>
      <Ring radius={0.95} color="#cfff04" speed={0.35} segments={segments} />
      <Ring radius={0.72} color="#8b5cf6" speed={0.55} reverse segments={segments} />
      <Ring radius={0.49} color="#ff2e6a" speed={0.8} segments={segments} />
      <Core />
    </group>
  );
}

export default function Scene() {
  const profile = usePerfProfile();
  const dpr: [number, number] =
    profile === "high" ? [1, 2] : profile === "medium" ? [1, 1.5] : [1, 1];

  return (
    <div className="hero__canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 50 }}
        dpr={dpr}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 3]} intensity={40} color="#cfff04" />
        <PortalPlaceholder segments={SEGMENTS[profile]} />
      </Canvas>
    </div>
  );
}
