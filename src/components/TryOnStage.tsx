import { useEffect, useRef, useState } from "react";
import { useCamera } from "../hooks/useCamera";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { useFaceTracking } from "../hooks/useFaceTracking";
import CameraPermissionGate from "./CameraPermissionGate";
import ModelSelector from "./ModelSelector";
import Scene from "../scene/Scene";

export type TryOnStageProps = {
  className?: string;
};

export default function TryOnStage({ className = "" }: TryOnStageProps) {
  const {
    status: cameraStatus,
    stream,
    error: cameraError,
    requestCamera,
    stopCamera,
  } = useCamera();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const isLive = cameraStatus === "granted" && stream != null;

  // Atualiza referência do elemento de vídeo para o hook de detecção e para a câmera 3D
  useEffect(() => {
    if (videoRef.current) {
      setVideoElement(videoRef.current);
    }
  }, [isLive]);

  // Conecta o MediaStream ao elemento <video>
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

  // Executa o FaceLandmarker (MediaPipe) em modo lazy sobre o elemento de vídeo quando a câmera está ativa
  const face = useFaceLandmarker(videoRef, isLive);
  const { detected: isTrackingDetected } = useFaceTracking();

  const isFaceDetected = face.detected || isTrackingDetected;

  // "Ancoragem 3D sincronizada" é uma confirmação pontual, não um indicador permanente:
  // mostra por ~1.8s ao sincronizar e depois some com fade-out, em vez de ficar plantada
  // no meio da tela (o filho do meio de .try-on-stage__overlay, que usa
  // justify-content: space-between) pelo tempo inteiro em que o rosto está detectado.
  const [syncBadgeVisible, setSyncBadgeVisible] = useState(false);
  const [syncBadgeFading, setSyncBadgeFading] = useState(false);

  useEffect(() => {
    if (!isFaceDetected) {
      setSyncBadgeVisible(false);
      setSyncBadgeFading(false);
      return;
    }

    setSyncBadgeVisible(true);
    setSyncBadgeFading(false);

    const fadeTimer = window.setTimeout(() => setSyncBadgeFading(true), 1800);
    const hideTimer = window.setTimeout(() => setSyncBadgeVisible(false), 1800 + 400);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isFaceDetected]);

  return (
    <div
      className={`try-on-stage ${isLive ? "try-on-stage--live" : "try-on-stage--idle"} ${className}`}
      role="region"
      aria-label="Área de prova virtual de óculos em tempo real"
    >
      {/* Moldura física estilo Hardware Studio Display */}
      <div className="try-on-stage__bezel">
        <div className="try-on-stage__viewport">
          <div
            className={`try-on-stage__media-container ${
              isLive ? "try-on-stage__media-container--mirrored" : ""
            }`}
          >
            {/* Feed de vídeo da câmera (fundo) */}
            <video
              ref={videoRef}
              className={`try-on-stage__video ${
                isLive ? "try-on-stage__video--active" : "try-on-stage__video--hidden"
              }`}
              autoPlay
              muted
              playsInline
              aria-label="Feed de vídeo da câmera para prova virtual (espelhado)"
            />

            {/* Canvas 3D com modelo e ancoragem facial */}
            <div className="try-on-stage__canvas-wrapper">
              <Scene isLive={isLive} videoElement={videoElement} />
            </div>
          </div>
        </div>

        {/* Camada de UI sobreposta (NÃO espelhada) */}
        <div className="try-on-stage__overlay">
          {/* Topo do stage quando a câmera está ativa */}
          {isLive && (
            <header className="try-on-stage__top-bar enter">
              <div className="try-on-stage__badge" aria-live="polite">
                <span className="try-on-stage__badge-dot" aria-hidden="true" />
                <span>Câmera ativa · Tracking Neural</span>
              </div>

              <button
                type="button"
                className="try-on-stage__close-btn"
                onClick={stopCamera}
                aria-label="Desligar câmera e voltar ao modo preview 3D"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
                <span>Desligar câmera</span>
              </button>
            </header>
          )}

          {/* Feedback contextual e estados de detecção */}
          {isLive && (
            <div className="try-on-stage__feedback" aria-live="polite">
              {face.status === "loading" && (
                <div className="try-on-stage__feedback-pill">
                  <span className="try-on-stage__spinner" aria-hidden="true" />
                  <span>Calibrando rede neural facial…</span>
                </div>
              )}

              {face.status === "error" && (
                <div className="try-on-stage__feedback-pill try-on-stage__feedback-pill--error">
                  <span>Falha na detecção: {face.error}</span>
                </div>
              )}

              {face.status === "ready" && !isFaceDetected && (
                <div className="try-on-stage__feedback-pill try-on-stage__feedback-pill--prompt">
                  <svg
                    className="try-on-stage__reticle-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="7" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  </svg>
                  <span>Posicione seu rosto dentro da moldura</span>
                </div>
              )}

              {face.status === "ready" && isFaceDetected && syncBadgeVisible && (
                <div
                  className={`try-on-stage__feedback-pill try-on-stage__feedback-pill--active ${
                    syncBadgeFading ? "try-on-stage__feedback-pill--fade-out" : ""
                  }`}
                >
                  <span className="try-on-stage__dot-pulse" aria-hidden="true" />
                  <span>Ancoragem 3D sincronizada</span>
                </div>
              )}
            </div>
          )}

          {/* Gate de permissão de câmera (visível quando a câmera NÃO está granted) */}
          {!isLive && (
            <div className="try-on-stage__gate-wrapper">
              <CameraPermissionGate
                status={cameraStatus}
                error={cameraError}
                onRequestCamera={requestCamera}
              />
            </div>
          )}

          {/* Seletor de modelos de óculos/headset na base */}
          <div className="try-on-stage__bottom">
            <ModelSelector />
          </div>
        </div>
      </div>
    </div>
  );
}
