import { useEffect, useMemo, useState } from "react";
import { track } from "../lib/analytics";

export type PerfProfile = "low" | "medium" | "high";
export type ExperienceLevel = "estatico" | "3d" | "3d-com-xr-possivel";

type NavigatorWithMemory = Navigator & {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

/**
 * Verifica de forma segura se o navegador suporta WebGL sem travar o renderer.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") ||
          canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Hook para observar mudanças na preferência de movimento reduzido (prefers-reduced-motion: reduce).
 */
export function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else if (typeof (mediaQuery as any).addListener === "function") {
      (mediaQuery as any).addListener(handler);
      return () => (mediaQuery as any).removeListener(handler);
    }
  }, []);

  return reducedMotion;
}

/**
 * Decisão de nível de experiência (Suporte-de-Dispositivos.md §Estratégia de fallback):
 * 1. Sem WebGL -> 'estatico'
 * 2. prefers-reduced-motion ou connection.saveData -> 'estatico'
 * 3. WebGL ativo e sem restrições -> '3d-com-xr-possivel' se navigator.xr existe, ou '3d'
 */
export function useExperienceLevel(): ExperienceLevel {
  const reducedMotion = usePrefersReducedMotion();

  return useMemo(() => {
    if (typeof window === "undefined") return "estatico";

    if (!isWebGLAvailable()) {
      track({ action: "experience_degraded", label: "no_webgl" });
      return "estatico";
    }

    if (reducedMotion) {
      track({ action: "experience_degraded", label: "reduced_motion" });
      return "estatico";
    }

    const nav = navigator as NavigatorWithMemory;
    if (nav.connection?.saveData) {
      track({ action: "experience_degraded", label: "save_data" });
      return "estatico";
    }

    if ("xr" in navigator && Boolean((navigator as any).xr)) {
      return "3d-com-xr-possivel";
    }

    return "3d";
  }, [reducedMotion]);
}

/**
 * Nível de perfil de hardware de acordo com o dispositivo — ver
 * docs/vault/05-VR-e-3D/Orcamento-de-Performance.md.
 */
export function usePerfProfile(): PerfProfile {
  return useMemo(() => {
    if (typeof navigator === "undefined") return "low";

    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as NavigatorWithMemory).deviceMemory ?? 4;

    if (cores >= 8 && memory >= 8) return "high";
    if (cores >= 4 && memory >= 4) return "medium";
    return "low";
  }, []);
}
