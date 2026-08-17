import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  getGlobalFacialTransformationMatrix,
  useFaceTracking,
} from "../../hooks/useFaceTracking";
import { FacePoseSmoother } from "../../lib/facePoseSmoother";
import GlassesModel from "./GlassesModel";

/**
 * Deslocamento vertical (metros, espaço local do rosto) entre a origem da
 * `facialTransformationMatrix` do MediaPipe e a altura dos olhos.
 *
 * A origem da matriz acompanha o modelo canônico de rosto do MediaPipe, que fica
 * mais perto do nariz do que do nível dos olhos — sem esse deslocamento, o GLB
 * (modelado com seu próprio pivô na altura das lentes, ver
 * `scripts/generate-placeholder-glasses.mjs`) aparece "caído" sobre o nariz em vez
 * de apoiado na altura dos olhos.
 *
 * Aplicado em espaço local (rotacionado pelo quaternion da pose) para acompanhar a
 * inclinação da cabeça, não o eixo Y do mundo.
 *
 * Valor inicial estimado por anatomia (distância nariz→olhos ~2-2.5cm); esta máquina
 * não tem câmera física para calibrar contra um rosto real (ver TASKS.md, pendência
 * da Task 8). Ajuste este valor — ou a prop `eyeLevelOffsetM` — olhando a câmera real.
 */
const EYE_LEVEL_OFFSET_M = 0.022;

// Objeto reutilizado fora do useFrame para ZERO alocação em runtime (Convencoes-de-Codigo.md - Regra 1)
const _offsetLocal = new THREE.Vector3();

/**
 * Propriedades para o componente de ancoragem facial (Task 8 / RF-04).
 */
export type AnchoredGlassesProps = {
  /**
   * Fator de suavização (alpha) para interpolação entre frames.
   * Faixa: (0, 1]. Padrão: 0.35.
   * Trade-off: 0.35 entrega estabilidade sólida sem jitter e latência quase imperceptível (~50ms).
   */
  smoothingFactor?: number;

  /**
   * Duração em ms para manter a última pose quando a detecção do rosto falha temporariamente.
   * Padrão: 400ms.
   */
  holdDurationMs?: number;

  /**
   * Duração em ms para esmaecer/fade-out o modelo caso o rosto continue ausente.
   * Padrão: 400ms.
   */
  fadeDurationMs?: number;

  /**
   * Matriz 4x4 opcional para sobrescrever o rastreamento global (útil para testes sintéticos e QA).
   */
  matrix?: Float32Array | readonly number[] | null;

  /**
   * Força o modo de rastreamento mesmo se o status for idle (útil para QA visual).
   */
  forceTrackingMode?: boolean;

  /**
   * Deslocamento vertical (metros, espaço local do rosto) da origem da matriz facial
   * até a altura dos olhos. Ver `EYE_LEVEL_OFFSET_M`. Padrão: 0.022 (2.2cm).
   * Exposto como prop para calibração rápida com câmera real, sem editar código.
   */
  eyeLevelOffsetM?: number;
};

/**
 * Componente 3D (R3F) responsável por ancorar o modelo de óculos selecionado
 * na matriz de transformação facial do MediaPipe Face Landmarker (Task 8).
 *
 * Características:
 * - Decompõe a matriz 4x4 do MediaPipe (coluna-principal) em posição + quaternion.
 * - Aplica suavização temporal por frame (lerp na posição e slerp no quaternion).
 * - Corrige a altura da âncora do nível do nariz (origem crua da matriz) para o nível
 *   dos olhos via `eyeLevelOffsetM` (ver `EYE_LEVEL_OFFSET_M`).
 * - Zero alocação de memória no render loop `useFrame` (Convencoes-de-Codigo.md — Regra 1).
 * - Máquina de estados para tolerância a oclusão/perda de frames: hold por 400ms e fade-out suave.
 * - Quando em modo preview (câmera desligada), mantém o modelo centralizado em [0, 0, 0] para inspeção via OrbitControls.
 */
export default function AnchoredGlasses({
  smoothingFactor = 0.35,
  holdDurationMs = 400,
  fadeDurationMs = 400,
  matrix: overrideMatrix,
  forceTrackingMode = false,
  eyeLevelOffsetM = EYE_LEVEL_OFFSET_M,
}: AnchoredGlassesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { status } = useFaceTracking();

  // Instância do suavizador temporal com parâmetros configuráveis
  const smoother = useMemo(() => {
    return new FacePoseSmoother({
      smoothingFactor,
      holdDurationMs,
      fadeDurationMs,
      autoUnitConversion: true,
    });
  }, [smoothingFactor, holdDurationMs, fadeDurationMs]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const isTrackingActive =
      forceTrackingMode || status === "ready" || overrideMatrix != null;

    if (isTrackingActive) {
      // 1. Obtém a matriz facial atual (do override ou do buffer global da ponte)
      const currentRawMatrix =
        overrideMatrix !== undefined
          ? overrideMatrix
          : getGlobalFacialTransformationMatrix();

      const now = performance.now();
      const pose = smoother.update(currentRawMatrix, now);

      if (pose.visible) {
        group.visible = true;
        group.quaternion.copy(pose.quaternion);
        // Sobe da origem da matriz do MediaPipe (perto do nariz) até a altura dos
        // olhos, rotacionado pela pose atual para acompanhar a inclinação da cabeça
        // (não é um deslocamento no eixo Y do mundo — ver EYE_LEVEL_OFFSET_M acima).
        _offsetLocal.set(0, eyeLevelOffsetM, 0).applyQuaternion(group.quaternion);
        group.position.copy(pose.position).add(_offsetLocal);
        // Aplica a escala resultante da atenuação/fade
        group.scale.copy(pose.scale);
      } else {
        group.visible = false;
      }
    } else {
      // Modo Preview (câmera desligada/idle):
      // Reseta o suavizador e posiciona o modelo centralizado na origem
      smoother.reset();
      group.visible = true;
      group.position.set(0, 0, 0);
      group.quaternion.identity();
      group.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={groupRef} name="AnchoredGlassesContainer">
      <GlassesModel />
    </group>
  );
}
