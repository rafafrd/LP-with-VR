import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { useFaceTracking } from "../hooks/useFaceTracking";
import {
  useExperienceLevel,
  usePerfProfile,
  usePrefersReducedMotion,
} from "../hooks/usePerfProfile";
import AnchoredGlasses from "./objects/AnchoredGlasses";
import StaticFallback from "./StaticFallback";

export type SceneProps = {
  isLive?: boolean;
  videoElement?: HTMLVideoElement | null;
};

type AdaptiveCameraControllerProps = {
  isLive: boolean;
  videoElement?: HTMLVideoElement | null;
};

/**
 * AdaptiveCameraController — Sincroniza FOV, posição e aspect ratio da câmera 3D
 * com a área visível do feed de vídeo da câmera (Task 9 / Alinhamento Espacial vídeo↔3D).
 *
 * Princípios matemáticos:
 * - Em modo live/tracking: a câmera do MediaPipe Face Landmarker assume FOV vertical canônico de ~63°.
 * - Se o container for mais largo que o aspect ratio do vídeo (object-fit: cover corta topo/base),
 *   ajusta o FOV vertical dinamicamente mantendo a cobertura horizontal perfeitamente alinhada.
 * - Se o container for mais estreito que o vídeo (object-fit: cover corta laterais),
 *   o FOV vertical de 63° cobre a altura total e o Three.js corta as laterais na mesma proporção.
 * - Em modo preview (câmera desligada): a câmera posiciona-se em [0, 0, 0.32] com FOV de 45°
 *   para orbitar e inspecionar os óculos 3D livremente.
 */
function AdaptiveCameraController({
  isLive,
  videoElement,
}: AdaptiveCameraControllerProps) {
  const { camera, size } = useThree();
  const { status } = useFaceTracking();
  const isTrackingActive = isLive && status === "ready";

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const containerAspect = size.width > 0 && size.height > 0
      ? size.width / size.height
      : 16 / 9;

    if (isTrackingActive) {
      const baseFov = 63; // FOV vertical canônico do MediaPipe
      const videoWidth = videoElement?.videoWidth || 1280;
      const videoHeight = videoElement?.videoHeight || 720;
      const streamAspect = videoWidth > 0 && videoHeight > 0
        ? videoWidth / videoHeight
        : 16 / 9;

      // Câmera posicionada na origem olhando ao longo do eixo -Z (espaço de câmera do MediaPipe)
      camera.position.set(0, 0, 0);
      camera.rotation.set(0, 0, 0);
      camera.quaternion.identity();

      if (containerAspect > streamAspect) {
        // Container mais largo que o vídeo: corte superior/inferior
        const vFovRad = (baseFov * Math.PI) / 180;
        const adjustedVFovRad =
          2 * Math.atan(Math.tan(vFovRad / 2) * (streamAspect / containerAspect));
        camera.fov = (adjustedVFovRad * 180) / Math.PI;
      } else {
        // Container mais alto/estreito que o vídeo: corte lateral
        camera.fov = baseFov;
      }

      camera.aspect = containerAspect;
      camera.updateProjectionMatrix();
    } else {
      // Modo preview: centralizado em [0, 0, 0.32] com FOV confortável de 45°
      camera.position.set(0, 0, 0.32);
      camera.rotation.set(0, 0, 0);
      camera.quaternion.identity();
      camera.fov = 45;
      camera.aspect = containerAspect;
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height, isTrackingActive, videoElement]);

  return null;
}

type SceneContentProps = {
  reducedMotion: boolean;
  isLive: boolean;
  videoElement?: HTMLVideoElement | null;
};

function SceneContent({
  reducedMotion,
  isLive,
  videoElement,
}: SceneContentProps) {
  const { status } = useFaceTracking();
  const isTrackingActive = isLive && status === "ready";

  return (
    <>
      <AdaptiveCameraController
        isLive={isLive}
        videoElement={videoElement}
      />

      <ambientLight intensity={0.95} />
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

      {/* Modelo 3D dos óculos/headset com ancoragem e suavização nos landmarks faciais */}
      <AnchoredGlasses />
    </>
  );
}

export default function Scene({ isLive = false, videoElement = null }: SceneProps) {
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
    <Canvas
      camera={{ position: [0, 0, 0.32], fov: 45 }}
      dpr={dpr}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
    >
      <SceneContent
        reducedMotion={reducedMotion}
        isLive={isLive}
        videoElement={videoElement}
      />
    </Canvas>
  );
}
