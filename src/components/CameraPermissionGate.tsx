import { useCamera } from "../hooks/useCamera";
import type { CameraError, CameraErrorReason, CameraStatus } from "../hooks/useCamera";

const RETRYABLE_REASONS: ReadonlySet<CameraErrorReason> = new Set([
  "not-found",
  "in-use",
  "other",
]);

const ERROR_COPY: Record<CameraErrorReason, string> = {
  "insecure-context":
    "Este site não está em uma conexão segura (HTTPS). Navegadores só liberam a câmera em contexto seguro — abra o site via https:// (ou localhost) e recarregue a página.",
  denied:
    "Você negou o acesso à câmera. Depois de negado, o navegador não mostra o pedido de novo — libere a câmera nas configurações do site (ícone de cadeado na barra de endereço) e recarregue.",
  "not-found":
    "Nenhuma câmera detectada neste dispositivo. Conecte uma webcam e tente novamente.",
  "in-use":
    "A câmera está em uso por outro aplicativo ou aba. Feche o outro programa e tente novamente.",
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
      <div className="camera-gate__icon-wrap" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" stroke="#0071e3" strokeWidth="2" />
        </svg>
      </div>

      <div className="camera-gate__header">
        <span className="camera-gate__tag">PROCESSAMENTO 100% LOCAL</span>
        <h2 className="camera-gate__title">Prova Virtual em Tempo Real</h2>
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
            Veja a coleção VOID projetada no seu rosto em 3D com precisão milimétrica.
            Todo o tracking neural é processado no seu processador — nenhum pixel ou dado biométrico sai do seu aparelho.
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
            <span className="camera-gate__btn-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="3" />
                <path d="M9 4.5 7.5 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5L15 4.5h-6Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            Ligar câmera & Experimentar
          </button>
        )}

        {isRequesting && (
          <button type="button" className="camera-gate__btn camera-gate__btn--loading" disabled>
            <span className="camera-gate__spinner-sm" aria-hidden="true" />
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
              Tentar novamente
            </button>
          )}
      </div>

      <div className="camera-gate__footer">
        <span className="camera-gate__badge-safe">
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-.5V4.5A3.5 3.5 0 0 0 8 1Zm2 5H6V4.5a2 2 0 1 1 4 0V6Z" />
          </svg>
          Privacidade Absoluta (LGPD) · Sem Armazenamento
        </span>
      </div>
    </div>
  );
}
