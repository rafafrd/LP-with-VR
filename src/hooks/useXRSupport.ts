import { useEffect, useState } from "react";
import { track } from "../lib/analytics";

type NavigatorWithXR = Navigator & { xr?: XRSystem };

/**
 * Detecta se o navegador suporta sessões WebXR imersivas ('immersive-vr').
 * Conforme Suporte-de-Dispositivos.md e Como-Funciona-o-Tracking.md:
 * - O botão 'Entrar em VR' NUNCA deve aparecer se isSessionSupported('immersive-vr') for false.
 * - Registra evento de analytics 'xr_supported' ao resolver a verificação.
 */
export function useXRSupport(): boolean {
  const [supported, setSupported] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }

    const nav = navigator as NavigatorWithXR;
    if (!nav.xr || typeof nav.xr.isSessionSupported !== "function") {
      setSupported(false);
      track({ action: "xr_supported", label: "false" });
      return;
    }

    nav.xr
      .isSessionSupported("immersive-vr")
      .then((ok) => {
        if (!active) return;
        setSupported(Boolean(ok));
        track({ action: "xr_supported", label: ok ? "true" : "false" });
      })
      .catch((err) => {
        if (!active) return;
        console.warn("[WebXR] Erro ao verificar suporte a immersive-vr:", err);
        setSupported(false);
        track({ action: "xr_supported", label: "false" });
      });

    // Se o dispositivo XR for conectado ou desconectado durante a navegação
    const onDeviceChange = () => {
      if (!nav.xr) return;
      nav.xr
        .isSessionSupported("immersive-vr")
        .then((ok) => {
          if (active) setSupported(Boolean(ok));
        })
        .catch(() => {
          if (active) setSupported(false);
        });
    };

    nav.xr.addEventListener?.("devicechange", onDeviceChange);

    return () => {
      active = false;
      nav.xr?.removeEventListener?.("devicechange", onDeviceChange);
    };
  }, []);

  return supported;
}
