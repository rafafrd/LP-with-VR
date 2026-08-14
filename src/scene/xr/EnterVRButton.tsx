import { useCallback, useState } from "react";
import { useXRSupport } from "../../hooks/useXRSupport";
import { track } from "../../lib/analytics";
import { xrStore } from "./xrStore";

export default function EnterVRButton() {
  const isXRSupported = useXRSupport();
  const [isLaunching, setIsLaunching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEnterVR = useCallback(async () => {
    track({ action: "xr_button_clicked" });
    setIsLaunching(true);
    setErrorMsg(null);

    try {
      await xrStore.enterVR();
    } catch (err: any) {
      console.error("[WebXR] Falha ao iniciar sessão imersiva:", err);
      setErrorMsg("Não foi possível iniciar o WebXR.");
    } finally {
      setIsLaunching(false);
    }
  }, []);

  // NUNCA renderiza o botão se o dispositivo/navegador não suportar WebXR
  if (!isXRSupported) {
    return null;
  }

  return (
    <div className="xr-button-wrapper" role="region" aria-label="Controles WebXR">
      <button
        type="button"
        className="xr-btn"
        onClick={handleEnterVR}
        disabled={isLaunching}
        aria-label="Entrar na experiência imersiva WebXR"
        title="Entrar em Realidade Virtual (WebXR)"
      >
        <span className="xr-btn__icon" aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
            <circle cx="8" cy="12" r="2" />
            <circle cx="16" cy="12" r="2" />
            <path d="M10 12h4" />
          </svg>
        </span>
        <span className="xr-btn__text">
          {isLaunching ? "Iniciando VR..." : "Entrar em VR"}
        </span>
      </button>
      {errorMsg && (
        <span className="xr-btn__error" role="alert">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
