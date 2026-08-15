import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";

/**
 * Detecção facial em tempo real com o MediaPipe Face Landmarker — Task 6.
 *
 * - Carrega o runtime WASM + modelo **lazy** (via `import()` dinâmico): nada de
 *   `@mediapipe/tasks-vision` no bundle inicial — vira chunk code-splitted,
 *   fora do caminho crítico do primeiro paint (RNF-03, mesmo princípio do
 *   Canvas 3D).
 * - Assets servidos de `public/mediapipe/` (script `assets:sync-mediapipe`),
 *   sem CDN de terceiro em runtime — mesmo princípio dos transcoders da Task 3.
 * - `outputFaceBlendshapes: false` (não precisamos) e
 *   `outputFacialTransformationMatrixes: true` (a Task 8 ancorará o GLB nessa
 *   matriz — recomendação de Stack-Tecnologica.md §0).
 * - **Sem suavização**: devolve a matriz 4×4 crua por frame — smoothing é
 *   escopo da Task 8.
 * - Loop acoplado ao vídeo: usa `requestVideoFrameCallback` quando disponível
 *   (dispara em sincronia com frames novos, o jeito correto pra detecção por
 *   vídeo — a API atual do MediaPipe recomenda), com fallback em
 *   `requestAnimationFrame`. Quando o vídeo está pausado/parado o loop não roda
 *   inferência (não gasta CPU sobre frame parado).
 * - Só carrega quando `enabled` (câmera ligada); desliga/fecha o modelo quando
 *   não está mais ativo e no unmount.
 *
 * Fronteiras: este arquivo é hook puro, sem JSX. A ancoragem do GLB na matriz
 * é a Task 8; o layout vídeo+3D final é a Task 9.
 */

export type FaceLandmarkerStatus = "loading" | "ready" | "error";

export type UseFaceLandmarkerResult = {
  status: FaceLandmarkerStatus;
  /** Rosto encontrado no frame atual. */
  detected: boolean;
  /**
   * Matriz de transformação facial 4×4 (coluna-principal) do rosto mais
   * confiante, crua por frame, em `Float32Array` — copiada do resultado do
   * runtime para o chamador ter um buffer próprio. `null` quando não há rosto.
   */
  facialTransformationMatrix: Float32Array | null;
  /** Mensagem de erro quando `status === "error"`; senão `null`. */
  error: string | null;
  /** Frames de vídeo processados pelo modelo (contador pra validar o loop). */
  frameCount: number;
};

function toErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = String((err as { message?: unknown }).message ?? "");
    if (message.trim()) return message.trim();
  }
  return String(err) || "erro desconhecido";
}

export function useFaceLandmarker(
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
): UseFaceLandmarkerResult {
  const [status, setStatus] = useState<FaceLandmarkerStatus>("loading");
  const [detected, setDetected] = useState(false);
  const [facialTransformationMatrix, setFacialTransformationMatrix] =
    useState<Float32Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);

  const landmarkerRef = useRef<FaceLandmarker | null>(null);

  // 1) Load lazy: só busca o chunk do MediaPipe quando a câmera está ativa.
  useEffect(() => {
    if (!enabled) {
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      setStatus("loading");
      setDetected(false);
      setFacialTransformationMatrix(null);
      setError(null);
      setFrameCount(0);
      return;
    }

    let cancelled = false;
    setStatus("loading");

    (async () => {
      try {
        const { FaceLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );
        if (cancelled) return;

        const wasmFileset = await FilesetResolver.forVisionTasks("/mediapipe");
        if (cancelled) return;

        const landmarker = await FaceLandmarker.createFromOptions(wasmFileset, {
          baseOptions: {
            modelAssetPath: "/mediapipe/face_landmarker.task",
            // CPU: sem contexto WebGL próprio no delegate — suficiente pro
            // try-on a 30fps (TFLite XNNPACK). GPU é otimização para a Task 8/9
            // (exigiria o canvas 3D da Task 9 ligado ao delegate).
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          // Try-on é um rosto (quem usa os óculos); com numFaces:1 a matriz
          // mais confiante é sempre `matrixes[0]`.
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
        });

        if (cancelled) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(toErrorMessage(err));
      }
    })();

    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [enabled]);

  // 2) Loop de detecção: roda por frame enquanto o vídeo estiver tocando.
  useEffect(() => {
    if (status !== "ready" || !enabled) return;

    let cancelled = false;
    let rafId = 0;

    const tick = (now: number) => {
      if (cancelled) return;
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      // Pausa a inferência quando o vídeo não está reproduzindo (câmera
      // desligada/pausada): não gastar CPU rodando o modelo sobre frame
      // parado/inexistente. O rVFC já não dispara sem frame novo; o fallback
      // rAF confere aqui.
      if (video && landmarker && video.readyState >= 2 && !video.paused) {
        try {
          // `now` é o timestamp de apresentação do frame (DOMHighResTimeStamp
          // em ms) — o MediaPipe exige timestamps estritamente crescentes.
          const result = landmarker.detectForVideo(video, now);
          setDetected(result.faceLandmarks.length > 0);
          const matrixes = result.facialTransformationMatrixes;
          setFacialTransformationMatrix(
            matrixes.length > 0
              ? new Float32Array(matrixes[0].data)
              : null,
          );
          setFrameCount((count) => count + 1);
        } catch (err) {
          // Inferência falhou de forma recorrente: não adianta continuar o
          // loop — vira erro visível (RF-07, não falhar silenciosamente).
          setStatus("error");
          setError(toErrorMessage(err));
          return;
        }
      }

      const nextVideo = videoRef.current;
      if (nextVideo && typeof nextVideo.requestVideoFrameCallback === "function") {
        nextVideo.requestVideoFrameCallback(tick);
      } else {
        rafId = requestAnimationFrame(() => tick(performance.now()));
      }
    };

    const start = () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        // Vídeo ainda não está tocando — tenta de novo no próximo frame.
        rafId = requestAnimationFrame(start);
        return;
      }
      tick(performance.now());
    };

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [status, enabled, videoRef]);

  return {
    status,
    detected,
    facialTransformationMatrix,
    error,
    frameCount,
  };
}
