import { useEffect, useRef, useState } from "react";
import { useCamera } from "../hooks/useCamera";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { useFaceTracking } from "../hooks/useFaceTracking";
import CameraPermissionGate from "./CameraPermissionGate";
import ModelSelector from "./ModelSelector";
import Scene from "../scene/Scene";

/**
 * TryOnStage — Container único de composição da feature de Try-On Facial (Task 9 / RF-05).
 *
 * Responsabilidades:
 * 1. Fundo de vídeo da câmera frontal em tela/stage (`<video>` com `object-fit: cover`).
 * 2. Canvas 3D (R3F com `AnchoredGlasses`) sobreposto no mesmo tamanho e posição exata.
 * 3. Espelhamento (selfie) unificado aplicando `transform: scaleX(-1)` no container
 *    comum do vídeo e do Canvas — garantindo alinhamento pixel-a-pixel automático
 *    sem inverter coordenadas no espaço 3D nem desalinhar a inferência bruta do MediaPipe.
 * 4. Controles sobrepostos não espelhados: barra de status no topo ("Câmera ativa" + "Desligar"),
 *    indicador sutil de feedback ("Carregando...", "Posicione seu rosto no quadro" - RF-07)
 *    e seletor de modelos na base (Task 7 / RF-03 / RF-06).
 * 5. Gerenciamento de ciclo de vida e transição suave entre estado idle (preview 3D) e live (try-on).
 */

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

  return (
    <div
      className={`try-on-stage ${isLive ? "try-on-stage--live" : "try-on-stage--idle"} ${className}`}
      role="region"
      aria-label="Área de prova virtual de óculos em tempo real"
    >
      {/* 
        Container de mídia com espelhamento unificado (scaleX(-1)).
        Vídeo (fundo) e Canvas 3D (overlay) compartilham o mesmo container espelhado.
      */}
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

      {/* 
        Camada de UI sobreposta (NÃO espelhada para texto e botões permanecerem legíveis)
      */}
      <div className="try-on-stage__overlay">
        {/* Topo do stage quando a câmera está ativa */}
        {isLive && (
          <header className="try-on-stage__top-bar enter">
            <div className="try-on-stage__badge" aria-live="polite">
              <span className="try-on-stage__badge-dot" aria-hidden="true" />
              <span>Câmera ativa</span>
            </div>

            <button
              type="button"
              className="try-on-stage__close-btn"
              onClick={stopCamera}
              aria-label="Desligar câmera e encerrar prova virtual"
            >
              Desligar câmera
            </button>
          </header>
        )}

        {/* Feedback contextual e estados de detecção (RF-07) */}
        {isLive && (
          <div className="try-on-stage__feedback" aria-live="polite">
            {face.status === "loading" && (
              <div className="try-on-stage__feedback-pill">
                <span className="try-on-stage__spinner" aria-hidden="true" />
                <span>Carregando modelo de detecção facial…</span>
              </div>
            )}

            {face.status === "error" && (
              <div className="try-on-stage__feedback-pill try-on-stage__feedback-pill--error">
                <span>Falha na detecção facial: {face.error}</span>
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
                <span>Posicione seu rosto no quadro</span>
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
  );
}
