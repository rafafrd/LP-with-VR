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

    const containerAspect =
      size.width > 0 && size.height > 0 ? size.width / size.height : 16 / 9;

    if (isTrackingActive) {
      const baseFov = 63; // FOV vertical canônico do MediaPipe
      const videoWidth = videoElement?.videoWidth || 1280;
      const videoHeight = videoElement?.videoHeight || 720;
      const streamAspect =
        videoWidth > 0 && videoHeight > 0 ? videoWidth / videoHeight : 16 / 9;

      camera.position.set(0, 0, 0);
      camera.rotation.set(0, 0, 0);
      camera.quaternion.identity();

      if (containerAspect > streamAspect) {
        const vFovRad = (baseFov * Math.PI) / 180;
        const adjustedVFovRad =
          2 * Math.atan(Math.tan(vFovRad / 2) * (streamAspect / containerAspect));
        camera.fov = (adjustedVFovRad * 180) / Math.PI;
      } else {
        camera.fov = baseFov;
      }

      camera.aspect = containerAspect;
      camera.updateProjectionMatrix();
    } else {
      camera.position.set(0, 0, 0.3);
      camera.rotation.set(0, 0, 0);
      camera.quaternion.identity();
      camera.fov = 42;
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

      {/* Iluminação Studio Apple para fundo branco-nuvem com realce metálico */}
      <ambientLight intensity={1.4} color="#f8fafc" />
      <directionalLight position={[0.8, 1.2, 1.0]} intensity={2.6} color="#ffffff" />
      <directionalLight position={[-0.8, -0.4, 0.6]} intensity={0.9} color="#e2e8f0" />
      <pointLight position={[0, 0.15, 0.3]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, -0.2, 0.2]} intensity={0.4} color="#0071e3" />

      {/* OrbitControls suave ativo durante o modo preview */}
      <OrbitControls
        enabled={!isTrackingActive}
        enablePan={false}
        enableZoom={!isTrackingActive}
        minDistance={0.14}
        maxDistance={0.75}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
        enableDamping={true}
        dampingFactor={0.06}
        autoRotate={!reducedMotion && !isTrackingActive}
        autoRotateSpeed={0.5}
      />

      {/* Modelo 3D dos óculos com ancoragem e interpolação */}
      <AnchoredGlasses />
    </>
  );
}

export default function Scene({ isLive = false, videoElement = null }: SceneProps) {
  const experienceLevel = useExperienceLevel();
  const reducedMotion = usePrefersReducedMotion();
  const profile = usePerfProfile();

  if (experienceLevel === "estatico") {
    return (
      <div className="hero__canvas hero__canvas--static" aria-hidden="true">
        <StaticFallback />
      </div>
    );
  }

  const dpr: [number, number] =
    profile === "high" ? [1, 2] : profile === "medium" ? [1, 1.5] : [1, 1];

  return (
    <Canvas
      camera={{ position: [0, 0, 0.3], fov: 42 }}
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
