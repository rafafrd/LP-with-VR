import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import CameraPermissionGate from "../components/CameraPermissionGate";
import {
  useExperienceLevel,
  usePerfProfile,
  usePrefersReducedMotion,
} from "../hooks/usePerfProfile";
import StaticFallback from "./StaticFallback";

type SceneContentProps = {
  reducedMotion: boolean;
};

function SceneContent({ reducedMotion }: SceneContentProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 2, 4]} intensity={2.5} color="#ffffff" />
      <pointLight position={[0, 0, 2.5]} intensity={12} color="#cfff04" />

      {/* OrbitControls calibrado (RF-02):
          - Limites minDistance/maxDistance para o usuário não perder o objeto
          - Pan desabilitado para manter o foco centralizado
          - Damping para suavidade
          - AutoRotate suspenso quando reducedMotion
      */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2.4}
        maxDistance={7.5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
        enableDamping={true}
        dampingFactor={0.05}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.6}
      />

      {/* TODO(try-on): conteúdo real da Task 8 — ancoragem do GLB nos landmarks faciais.
          Placeholder mínimo (anteriormente o VoidPortal): só precisa manter o Canvas
          montando e renderizando sem erro, não é o visual final. */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[1, 0.02, 12, 64]} />
        <meshBasicMaterial color="#cfff04" />
      </mesh>
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
        aria-label="Cena 3D (try-on facial em construção)"
      >
        <Canvas
          camera={{ position: [0, 0, 4.0], fov: 48 }}
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

      {/* Integração temporária (Task 5): o gate de permissão de câmera é DOM,
          fora do Canvas, só pra validar o fluxo getUserMedia com câmera real.
          Layout final (vídeo como fundo + canvas 3D por cima) é a Task 9. */}
      <CameraPermissionGate />
    </>
  );
}
