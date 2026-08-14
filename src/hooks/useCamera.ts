import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Ciclo de vida da permissão de câmera via getUserMedia (RF-01).
 *
 * - Nunca chama getUserMedia no mount: só quando `requestCamera()` é chamado
 *   (gesto explícito do usuário — aviso de contexto antes do prompt nativo,
 *   ver docs/vault/06-Analytics-e-Tracking/LGPD-e-Consentimento.md).
 * - Checa `window.isSecureContext` ANTES de chamar getUserMedia: em contexto
 *   inseguro nem tenta (getUserMedia só existe em contexto seguro).
 * - Razões de erro tipadas conforme a tabela "Problemas comuns" de
 *   docs/vault/03-Desenvolvimento/Setup-do-Ambiente.md, cobrindo mais nomes de
 *   DOMException do que menos (inclui nomes legados de Chrome/Firefox).
 * - `stopCamera()` e o cleanup do hook param todas as tracks — requisito LGPD:
 *   "Encerrar a câmera (track.stop()) ao sair da feature".
 */

export type CameraStatus = "idle" | "requesting" | "granted" | "error";

export type CameraErrorReason =
  | "insecure-context"
  | "denied"
  | "not-found"
  | "in-use"
  | "other";

export type CameraError = {
  reason: CameraErrorReason;
  /** Mensagem original do erro (para debug / caso "other"). */
  message: string;
};

/** Câmera frontal por padrão — try-on facial, é a câmera esperada (selfie). */
const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: { facingMode: "user" },
  audio: false,
};

function errorName(err: unknown): string {
  if (typeof err === "object" && err !== null && "name" in err) {
    return String((err as { name?: unknown }).name ?? "");
  }
  return "";
}

function errorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = String((err as { message?: unknown }).message ?? "");
    if (message.trim()) return message.trim();
  }
  return String(err) || "erro desconhecido";
}

/**
 * Mapeia o nome da DOMException rejeitada por getUserMedia para uma razão
 * tipada. Os nomes seguem o MDN de MediaDevices.getUserMedia:
 * NotAllowedError / NotFoundError / NotReadableError / AbortError /
 * OverconstrainedError / SecurityError / TypeError — mais os nomes legados de
 * Chrome (`PermissionDeniedError`, `DevicesNotFoundError`,
 * `ConstraintNotSatisfiedError`, `SourceUnavailableError`) e de Firefox
 * (`TrackStartError`).
 */
export function toCameraError(err: unknown): CameraError {
  const name = errorName(err);

  switch (name) {
    case "SecurityError":
      // MDN: getUserMedia rejeita com SecurityError quando chamado fora de
      // contexto seguro. O hook pré-checa isSecureContext, então isso é um
      // caso residual — mesma orientação de ação.
      return { reason: "insecure-context", message: errorMessage(err) };
    case "NotAllowedError":
    case "PermissionDeniedError":
      return { reason: "denied", message: errorMessage(err) };
    case "NotFoundError":
    case "DevicesNotFoundError":
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      // Sem câmera, ou câmera que não satisfaz as constraints (ex.: sem
      // frontal).
      return { reason: "not-found", message: errorMessage(err) };
    case "NotReadableError":
    case "TrackStartError":
    case "SourceUnavailableError":
    case "AbortError":
      // Câmera ocupada por outro app/aba, ou falha de hardware na configuração
      // do dispositivo.
      return { reason: "in-use", message: errorMessage(err) };
    default:
      return { reason: "other", message: errorMessage(err) };
  }
}

export type UseCameraResult = {
  status: CameraStatus;
  stream: MediaStream | null;
  error: CameraError | null;
  requestCamera: () => Promise<void>;
  stopCamera: () => void;
};

export function useCamera(): UseCameraResult {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<CameraError | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const requestingRef = useRef(false);
  const liveRef = useRef(true);

  useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
      // LGPD: encerrar a câmera ao sair da feature — não deixar o MediaStream
      // vivo além do necessário.
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const requestCamera = useCallback(async () => {
    if (requestingRef.current || streamRef.current) return;

    requestingRef.current = true;

    const fail = (reason: CameraErrorReason, message: string) => {
      setStream(null);
      streamRef.current = null;
      setError({ reason, message });
      setStatus("error");
    };

    // Contexto inseguro: checa antes de chamar getUserMedia — em http:// (fora
    // de localhost) o navegador nem deveria tentar (Setup-do-Ambiente.md).
    if (typeof window === "undefined" || !window.isSecureContext) {
      fail(
        "insecure-context",
        "Contexto inseguro: é preciso HTTPS (ou localhost) para acessar a câmera.",
      );
      requestingRef.current = false;
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      fail(
        "other",
        "Este navegador não suporta acesso à câmera (getUserMedia indisponível).",
      );
      requestingRef.current = false;
      return;
    }

    setStatus("requesting");
    setError(null);

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia(
        CAMERA_CONSTRAINTS,
      );

      if (!liveRef.current) {
        // Componente desmontado enquanto o pedido estava em voo — não usar o
        // stream e liberar imediatamente.
        nextStream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = nextStream;
      setStream(nextStream);
      setStatus("granted");
    } catch (err) {
      if (!liveRef.current) return;
      setStream(null);
      streamRef.current = null;
      setError(toCameraError(err));
      setStatus("error");
    } finally {
      requestingRef.current = false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    setError(null);
    setStatus("idle");
  }, []);

  return { status, stream, error, requestCamera, stopCamera };
}
