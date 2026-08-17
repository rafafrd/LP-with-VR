import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import {
  useExperienceLevel,
  usePerfProfile,
  usePrefersReducedMotion,
} from "../hooks/usePerfProfile";
import AmbientGlasses from "./objects/AmbientGlasses";

export default function AmbientCanvas() {
  const experienceLevel = useExperienceLevel();
  const reducedMotion = usePrefersReducedMotion();
  const profile = usePerfProfile();

  if (experienceLevel === "estatico") {
    return null;
  }

  const dpr: [number, number] =
    profile === "high" ? [1, 1.5] : profile === "medium" ? [1, 1.25] : [1, 1];

  return (
    <div className="ambient-canvas-wrapper" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={dpr}
        gl={{
          alpha: true,
          antialias: profile !== "low",
          powerPreference: "high-performance",
        }}
      >
        {/* Iluminação Studio refinada para destacar reflexos metálicos e translúcidos */}
        <ambientLight intensity={1.4} color="#ffffff" />
        <directionalLight position={[6, 8, 6]} intensity={2.2} color="#ffffff" />
        <directionalLight position={[-6, -4, 4]} intensity={1.1} color="#e2e8f0" />
        <pointLight position={[0, 1, 5]} intensity={0.9} color="#0071e3" />
        <pointLight position={[0, -4, 3]} intensity={0.5} color="#38bdf8" />

        <Suspense fallback={null}>
          <AmbientGlasses reducedMotion={reducedMotion} profile={profile} />
        </Suspense>
      </Canvas>
    </div>
  );
}
