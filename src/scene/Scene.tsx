import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import CameraPermissionGate from "../components/CameraPermissionGate";
import ModelSelector from "../components/ModelSelector";
import { useFaceTracking } from "../hooks/useFaceTracking";
import {
  useExperienceLevel,
  usePerfProfile,
  usePrefersReducedMotion,
} from "../hooks/usePerfProfile";
import AnchoredGlasses from "./objects/AnchoredGlasses";
import StaticFallback from "./StaticFallback";

type SceneContentProps = {
  reducedMotion: boolean;
};

function SceneContent({ reducedMotion }: SceneContentProps) {
  const { status } = useFaceTracking();
  const isTrackingActive = status === "ready";

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[0.4, 0.6, 0.8]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-0.4, -0.4, -0.6]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 0.1, 0.25]} intensity={0.8} color="#cfff04" />

      {/* OrbitControls ativo durante o modo preview; desabilitado durante tracking facial */}
      <OrbitControls
        enabled={!isTrackingActive}
        enablePan={false}
        enableZoom={!isTrackingActive}
        minDistance={0.14}
        maxDistance={0.85}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
        enableDamping={true}
        dampingFactor={0.05}
        autoRotate={!reducedMotion && !isTrackingActive}
        autoRotateSpeed={0.6}
      />

      {/* Modelo 3D dos óculos/headset com ancoragem e suavização nos landmarks faciais (Task 8) */}
      <AnchoredGlasses />
    </>
  );
}

export default function Scene() {
  const experienceLevel = useExperienceLevel();
  const reducedMotion = usePrefersReducedMotion();
  const profile = usePerfProfile();

  // 1. Fallback Estático de Nível 1 & 2 (sem WebGL, reduced-motion, saveData)
  if (experienceLevel === "estatico") {
    return (
      <div className="hero__canvas hero__canvas--static" aria-hidden="true">
        <StaticFallback />
      </div>
    );
  }

  // 2. Resolução adaptativa baseada no perfil de hardware
  const dpr: [number, number] =
    profile === "high" ? [1, 2] : profile === "medium" ? [1, 1.5] : [1, 1];

  return (
    <>
      <div
        className="hero__canvas"
        role="region"
        aria-label="Cena 3D com modelo de óculos selecionado"
      >
        <Canvas
          camera={{ position: [0, 0, 0.32], fov: 45 }}
          dpr={dpr}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
        >
          <SceneContent reducedMotion={reducedMotion} />
        </Canvas>
      </div>

      {/* Integração temporária (Task 7): seletor de modelos e gate de permissão
          de câmera no DOM overlay. O layout final unificado é a Task 9. */}
      <ModelSelector />
      <CameraPermissionGate />
    </>
  );
}
