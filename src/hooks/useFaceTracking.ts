import { useSyncExternalStore } from "react";

/**
 * Estado global e ponte DOM <-> R3F para dados de rastreamento facial (Task 8).
 *
 * Decisão de arquitetura:
 * Segue o mesmo padrão estabelecido na Task 7 (`useModelSelection.ts`), utilizando
 * `useSyncExternalStore` para sincronizar os dados do MediaPipe Face Landmarker
 * (processados no componente DOM ou no hook de câmera) com a árvore 3D do React
 * Three Fiber (`AnchoredGlasses` dentro do `<Canvas>`), além de fornecer leitura
 * síncrona direta sem alocação ou re-render para o render loop `useFrame`.
 */

export type FaceTrackingStatus = "idle" | "loading" | "ready" | "error";

export type FaceTrackingState = {
  status: FaceTrackingStatus;
  detected: boolean;
  frameCount: number;
  error: string | null;
  lastTimestamp: number;
};

type Listener = () => void;

let globalStatus: FaceTrackingStatus = "idle";
let globalDetected = false;
let globalFrameCount = 0;
let globalError: string | null = null;
let globalLastTimestamp = 0;

/** Buffer de matriz 4x4 mantido globalmente para acesso direto pelo useFrame (zero re-render) */
let globalMatrix: Float32Array | null = null;

const listeners = new Set<Listener>();

let cachedSnapshot: FaceTrackingState = {
  status: globalStatus,
  detected: globalDetected,
  frameCount: globalFrameCount,
  error: globalError,
  lastTimestamp: globalLastTimestamp,
};

function emitChange(): void {
  cachedSnapshot = {
    status: globalStatus,
    detected: globalDetected,
    frameCount: globalFrameCount,
    error: globalError,
    lastTimestamp: globalLastTimestamp,
  };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): FaceTrackingState {
  return cachedSnapshot;
}

/**
 * Atualiza o buffer da matriz facial e o estado de detecção a cada frame do MediaPipe.
 */
export function setGlobalFacialTrackingData(
  matrix: Float32Array | null,
  detected: boolean,
  frameCount: number,
  timestampMs: number = performance.now(),
): void {
  globalMatrix = matrix;
  globalDetected = detected;
  globalFrameCount = frameCount;
  globalLastTimestamp = timestampMs;
  emitChange();
}

/**
 * Atualiza o status do modelo MediaPipe (loading, ready, error, idle).
 */
export function setGlobalFaceTrackingStatus(
  status: FaceTrackingStatus,
  error: string | null = null,
): void {
  if (globalStatus === status && globalError === error) return;
  globalStatus = status;
  globalError = error;
  if (status === "idle") {
    globalMatrix = null;
    globalDetected = false;
    globalFrameCount = 0;
  }
  emitChange();
}

/**
 * Leitura síncrona direta da matriz 4x4 facial para uso dentro do useFrame (R3F).
 * Não causa re-renders no React e não aloca memória.
 */
export function getGlobalFacialTransformationMatrix(): Float32Array | null {
  return globalMatrix;
}

/**
 * Retorna se o rastreamento facial está com um rosto detectado no momento.
 */
export function isGlobalFaceDetected(): boolean {
  return globalDetected;
}

/**
 * Hook React para componentes DOM e R3F consumirem o estado do rastreamento facial.
 */
export function useFaceTracking(): FaceTrackingState & {
  facialTransformationMatrix: Float32Array | null;
} {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...state,
    facialTransformationMatrix: globalMatrix,
  };
}
