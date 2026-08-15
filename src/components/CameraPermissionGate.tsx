import { useEffect, useRef } from "react";
import { useCamera } from "../hooks/useCamera";
import type { CameraErrorReason } from "../hooks/useCamera";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";

/**
 * Gate de permissão de câmera (DOM, não 3D) — Task 5 + Task 6.
 *
 * Fluxo: contexto + botão explícito -> prompt nativo (requestCamera) ->
 * pré-visualização espelhada do stream OU mensagem de erro por razão.
 * O prompt nativo do navegador só aparece depois do clique em "Ligar câmera"
 * (LGPD-e-Consentimento.md: aviso de contexto antes do prompt nativo).
 *
 * Task 6: quando a câmera está ativa, roda o `useFaceLandmarker` sobre o
 * <video> e mostra o resultado da detecção (rosto presente/ausente + contador
 * de frames) — integração temporária só pra provar que o loop de detecção
 * funciona; o layout definitivo (vídeo como fundo + canvas 3D por cima) é a
 * Task 9, e a ancoragem do GLB na matriz facial é a Task 8.
 *
 * Temporário: vive dentro de Scene.tsx só pra validação com câmera real.
 */

// Tentar de novo só faz sentido quando o erro é contornável do lado do usuário:
// denied é definitivo (o navegador não re-pergunta depois de negado) e
// insecure-context não se resolve com um clique (muda pra HTTPS).
const RETRYABLE_REASONS: ReadonlySet<CameraErrorReason> = new Set([
  "not-found",
  "in-use",
  "other",
]);

const ERROR_COPY: Record<CameraErrorReason, string> = {
  "insecure-context":
    "Este site não está em uma conexão segura (HTTPS). Navegadores só liberam a câmera em contexto seguro — abra o site via https:// (ou localhost) e recarregue a página.",
  denied:
    "Você negou o acesso à câmera. Depois de negado, o navegador não mostra o pedido de novo — libere a câmera nas configurações do site (cadeado na barra de endereço) e recarregue a página.",
  "not-found":
    "Não encontramos uma câmera neste dispositivo. Conecte uma webcam e tente de novo.",
  "in-use":
    "A câmera está em uso por outro aplicativo ou aba do navegador. Feche o outro programa e tente de novo.",
  other: "",
};

export default function CameraPermissionGate() {
  const { status, stream, error, requestCamera, stopCamera } = useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Task 6: só carrega o MediaPipe (chunk lazy) e roda a detecção quando a
  // câmera está ativa — o gate desmonta o <video> quando não está granted.
  const face = useFaceLandmarker(
    videoRef,
    status === "granted" && stream != null,
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    return () => {
      if (video.srcObject === stream) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  // Câmera ativa: pré-visualização espelhada + indicador visível de câmera
  // ligada (LGPD-e-Consentimento.md) + botão pra encerrar o stream.
  if (status === "granted" && stream) {
    return (
      <div
        className="camera-gate camera-gate--live"
        role="region"
        aria-label="Pré-visualização da câmera"
      >
        <div className="camera-gate__top">
          <span className="camera-gate__badge">Câmera ativa</span>
          <button
            type="button"
            className="camera-gate__btn camera-gate__btn--ghost"
            onClick={stopCamera}
          >
            Desligar câmera
          </button>
        </div>
        <video
          ref={videoRef}
          className="camera-gate__video"
          autoPlay
          muted
          playsInline
          aria-label="Pré-visualização da câmera (espelhada)"
        />
        <div className="camera-gate__detection">
          {face.status === "loading" && (
            <p className="camera-gate__detection-text">
              <span className="camera-gate__spinner" aria-hidden="true" />
              Carregando modelo de detecção facial…
            </p>
          )}

          {face.status === "error" && (
            <p className="camera-gate__detection-text camera-gate__detection-text--error">
              Falha na detecção facial: {face.error}
            </p>
          )}

          {face.status === "ready" && (
            <p
              className={`camera-gate__detection-text camera-gate__detection-text--${face.detected ? "ok" : "empty"}`}
            >
              <span aria-live="polite">
                {face.detected
                  ? "Rosto detectado"
                  : "Nenhum rosto detectado"}
              </span>
              <span className="camera-gate__detection-meta">
                {face.frameCount} frame(s) analisado(s)
                {face.detected && face.facialTransformationMatrix
                  ? " · matriz 4×4 ✓"
                  : ""}
              </span>
            </p>
          )}
        </div>
        <p className="camera-gate__hint">
          Pré-visualização espelhada (como selfie) — o layout final, com o vídeo
          de fundo e o 3D por cima, chega na Task 9.
        </p>
      </div>
    );
  }

  const isRequesting = status === "requesting";

  return (
    <div
      className="camera-gate"
      role="region"
      aria-label="Permissão de câmera"
    >
      <p className="camera-gate__title">Prova virtual</p>

      <div
        className="camera-gate__status"
        aria-live="polite"
        aria-busy={isRequesting}
      >
        {isRequesting && (
          <p className="camera-gate__text">
            <span className="camera-gate__spinner" aria-hidden="true" />
            Solicitando permissão de câmera…
          </p>
        )}

        {status === "idle" && (
          <p className="camera-gate__text">
            Para o try-on, o VOID liga a câmera frontal do seu dispositivo. Nada
            do que ela captura sai do aparelho — o processamento acontece 100%
            no seu navegador.
          </p>
        )}

        {status === "error" && error && (
          <p className="camera-gate__text camera-gate__text--error">
            {error.reason === "other"
              ? `Não foi possível ligar a câmera: ${error.message}`
              : ERROR_COPY[error.reason]}
          </p>
        )}
      </div>

      <div className="camera-gate__actions">
        {status === "idle" && (
          <button
            type="button"
            className="camera-gate__btn"
            onClick={() => void requestCamera()}
          >
            Ligar câmera
          </button>
        )}

        {isRequesting && (
          <button type="button" className="camera-gate__btn" disabled>
            Aguardando…
          </button>
        )}

        {status === "error" &&
          error &&
          RETRYABLE_REASONS.has(error.reason) && (
            <button
              type="button"
              className="camera-gate__btn"
              onClick={() => void requestCamera()}
            >
              Tentar de novo
            </button>
          )}
      </div>
    </div>
  );
}
