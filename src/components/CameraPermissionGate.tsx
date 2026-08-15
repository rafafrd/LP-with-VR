import { useCamera } from "../hooks/useCamera";
import type { CameraError, CameraErrorReason, CameraStatus } from "../hooks/useCamera";

/**
 * Gate de permissão de câmera (DOM, não 3D) — Task 5 (Atualizado na Task 9).
 *
 * Responsabilidades:
 * - Apresentar aviso claro de contexto e privacidade antes de solicitar a câmera (LGPD).
 * - Fornecer botão de ação explícito "Ligar câmera" para disparar `getUserMedia`.
 * - Exibir estados de carregamento ("Solicitando...") e erros específicos com orientações claras.
 * - Permitir retry inteligente apenas para falhas recuperáveis (não insiste em `denied` definitivo).
 */

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

export type CameraPermissionGateProps = {
  status?: CameraStatus;
  error?: CameraError | null;
  onRequestCamera?: () => Promise<void> | void;
  className?: string;
};

export default function CameraPermissionGate({
  status: propStatus,
  error: propError,
  onRequestCamera: propRequestCamera,
  className = "",
}: CameraPermissionGateProps) {
  // Permite uso autônomo ou orquestrado via props pelo TryOnStage
  const fallbackCamera = useCamera();
  const status = propStatus ?? fallbackCamera.status;
  const error = propError !== undefined ? propError : fallbackCamera.error;
  const requestCamera = propRequestCamera ?? fallbackCamera.requestCamera;

  const isRequesting = status === "requesting";

  return (
    <div
      className={`camera-gate ${className}`}
      role="region"
      aria-label="Permissão de câmera para prova virtual"
    >
      <div className="camera-gate__header">
        <span className="camera-gate__tag">TRY-ON 3D</span>
        <h2 className="camera-gate__title">Prova Virtual</h2>
      </div>

      <div
        className="camera-gate__status"
        aria-live="polite"
        aria-busy={isRequesting}
      >
        {isRequesting && (
          <p className="camera-gate__text">
            <span className="camera-gate__spinner" aria-hidden="true" />
            Solicitando permissão de câmera no navegador…
          </p>
        )}

        {status === "idle" && (
          <p className="camera-gate__text">
            Experimente os modelos de óculos VOID no seu rosto em tempo real.
            O processamento facial ocorre 100% no seu navegador — nenhum vídeo ou dado biométrico sai do dispositivo.
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
            Aguardando permissão…
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
