import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import CameraPermissionGate from "../components/CameraPermissionGate";
import ModelSelector from "../components/ModelSelector";
import {
  useExperienceLevel,
  usePerfProfile,
  usePrefersReducedMotion,
} from "../hooks/usePerfProfile";
import GlassesModel from "./objects/GlassesModel";
import StaticFallback from "./StaticFallback";

type SceneContentProps = {
  reducedMotion: boolean;
};

function SceneContent({ reducedMotion }: SceneContentProps) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[0.4, 0.6, 0.8]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-0.4, -0.4, -0.6]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 0.1, 0.25]} intensity={0.8} color="#cfff04" />

      {/* OrbitControls calibrado para visualização do modelo métrico (largura ~14cm) */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={0.14}
        maxDistance={0.85}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
        enableDamping={true}
        dampingFactor={0.05}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.6}
      />

      {/* Modelo 3D dos óculos/headset selecionado via GLB (Task 7).
          Na Task 8, este modelo será ancorado nos landmarks faciais do MediaPipe. */}
      <GlassesModel />
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
