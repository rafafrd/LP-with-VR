import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { track } from "../../lib/analytics";
import {
  acidGlowMaterial,
  auraMaterial,
  chassisMaterial,
  magentaGlowMaterial,
  particleMaterial,
  singularityCoreMaterial,
  violetGlowMaterial,
} from "../materials/portalMaterials";

// Objetos temporários reaproveitados fora do loop para zero alocação de GC (Orcamento-de-Performance.md)
const _tempScale = new THREE.Vector3();

type VoidPortalProps = {
  reducedMotion?: boolean;
};

const PARTICLE_COUNT = 160;

/**
 * Cria a geometria pré-calculada para o enxame de partículas quânticas ao redor do portal.
 */
function useParticlePositions() {
  return useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const angles = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const radii = new Float32Array(PARTICLE_COUNT);
    const yOffsets = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.2;
      const radius = 0.6 + Math.random() * 0.9;
      const yOffset = (Math.random() - 0.5) * 0.4;
      const speed = 0.2 + Math.random() * 0.4;

      angles[i] = angle;
      radii[i] = radius;
      speeds[i] = speed;
      yOffsets[i] = yOffset;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = yOffset;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    return { positions, angles, speeds, radii, yOffsets };
  }, []);
}

export default function VoidPortal({ reducedMotion = false }: VoidPortalProps) {
  const outerRingRef = useRef<THREE.Group>(null);
  const midRingRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Estado de pulso de energia ao interagir / clicar
  const pulseProgressRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  const particleData = useParticlePositions();

  // Função de ativação acionada por clique no DOM ou evento 'select' em XR
  const handleActivate = () => {
    pulseProgressRef.current = 1.0;
    track({ action: "xr_hotspot_activated", label: "portal_core" });
  };

  useFrame((_, delta) => {
    // 1. Decaimento do pulso de choque
    if (pulseProgressRef.current > 0.01) {
      pulseProgressRef.current -= delta * 1.8;
      if (pulseProgressRef.current < 0.01) {
        pulseProgressRef.current = 0;
      }
    }

    const pulse = pulseProgressRef.current;

    // Se o usuário solicitou redução de movimento, mantemos as posições estáveis
    if (reducedMotion) {
      if (shockwaveRef.current) {
        shockwaveRef.current.scale.setScalar(0.001);
      }
      return;
    }

    // 2. Rotação suave dos anéis do portal
    const baseSpeed = 0.5;
    const speedBoost = isHovered ? 1.4 : 1.0;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * baseSpeed * 0.4 * speedBoost;
      outerRingRef.current.rotation.y += delta * baseSpeed * 0.15 * speedBoost;
    }

    if (midRingRef.current) {
      midRingRef.current.rotation.z -= delta * baseSpeed * 0.7 * speedBoost;
      midRingRef.current.rotation.x += delta * baseSpeed * 0.25 * speedBoost;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.z += delta * baseSpeed * 1.1 * speedBoost;
      innerRingRef.current.rotation.y -= delta * baseSpeed * 0.35 * speedBoost;
    }

    // 3. Pulsação orgânica da singularidade central
    if (coreRef.current) {
      const now = performance.now() * 0.0018;
      const breathe = 1 + Math.sin(now) * 0.04 + pulse * 0.25;
      _tempScale.set(breathe, breathe, breathe);
      coreRef.current.scale.copy(_tempScale);
    }

    // 4. Efeito de onda de choque ao clicar
    if (shockwaveRef.current) {
      if (pulse > 0.01) {
        const shockScale = (1.0 - pulse) * 2.8 + 0.3;
        shockwaveRef.current.scale.setScalar(shockScale);
        (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity =
          pulse * 0.7;
      } else {
        shockwaveRef.current.scale.setScalar(0.001);
      }
    }

    // 5. Atualização do enxame de partículas quânticas (sem alocação de objetos no loop)
    if (particlesRef.current) {
      const geo = particlesRef.current.geometry;
      const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      const { angles, speeds, radii, yOffsets } = particleData;
      const count = angles.length;

      for (let i = 0; i < count; i++) {
        angles[i] += delta * speeds[i] * speedBoost;
        const currentAngle = angles[i];
        const r = radii[i] + Math.sin(currentAngle * 2) * 0.05;

        posArray[i * 3] = Math.cos(currentAngle) * r;
        posArray[i * 3 + 1] =
          yOffsets[i] + Math.sin(currentAngle * 3) * 0.08;
        posArray[i * 3 + 2] = Math.sin(currentAngle) * r;
      }

      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Alvo generoso e acessível para interações por toque / clique / transient-pointer */}
      <mesh
        visible={false}
        onClick={handleActivate}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* 1. Anel Externo — Chassi Ciber e Acentos Acid Neon */}
      <group ref={outerRingRef} rotation={[Math.PI / 6, 0, 0]}>
        {/* Chassi principal escuro */}
        <mesh material={chassisMaterial}>
          <torusGeometry args={[1.18, 0.04, 16, 64]} />
        </mesh>
        {/* Friso emissivo Acid Neon */}
        <mesh material={acidGlowMaterial}>
          <torusGeometry args={[1.22, 0.012, 12, 64]} />
        </mesh>
        {/* Marcadores / dentes geométricos nas posições nodais */}
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 1.18, Math.sin(angle) * 1.18, 0]}
            rotation={[0, 0, angle]}
            material={acidGlowMaterial}
          >
            <boxGeometry args={[0.08, 0.04, 0.07]} />
          </mesh>
        ))}
      </group>

      {/* 2. Anel Intermediário — Violet Neon com Inclinação */}
      <group ref={midRingRef} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <mesh material={chassisMaterial}>
          <torusGeometry args={[0.88, 0.03, 14, 56]} />
        </mesh>
        <mesh material={violetGlowMaterial}>
          <torusGeometry args={[0.91, 0.01, 10, 56]} />
        </mesh>
        {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map(
          (angle, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 0.88, Math.sin(angle) * 0.88, 0]}
              rotation={[0, 0, angle]}
              material={violetGlowMaterial}
            >
              <cylinderGeometry args={[0.025, 0.025, 0.06, 8]} />
            </mesh>
          )
        )}
      </group>

      {/* 3. Anel Interno — Magenta Neon */}
      <group ref={innerRingRef} rotation={[-Math.PI / 4, 0, Math.PI / 4]}>
        <mesh material={magentaGlowMaterial}>
          <torusGeometry args={[0.6, 0.016, 12, 48]} />
        </mesh>
      </group>

      {/* 4. Singularidade Central / Horizonte de Eventos */}
      <group>
        {/* Núcleo escuro com borda reflexiva */}
        <mesh ref={coreRef} material={singularityCoreMaterial}>
          <sphereGeometry args={[0.26, 32, 32]} />
        </mesh>
        {/* Aura atmosférica difusa */}
        <mesh material={auraMaterial}>
          <sphereGeometry args={[0.42, 24, 24]} />
        </mesh>
      </group>

      {/* 5. Efeito de Onda de Choque de Energia (Shockwave) */}
      <mesh
        ref={shockwaveRef}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.001, 0.001, 0.001]}
      >
        <ringGeometry args={[0.7, 0.85, 32]} />
        <meshBasicMaterial
          color={0xcfff04}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 6. Enxame de Partículas Orbitais (BufferGeometry) */}
      <points ref={particlesRef} material={particleMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData.positions, 3]}
          />
        </bufferGeometry>
      </points>
    </group>
  );
}
