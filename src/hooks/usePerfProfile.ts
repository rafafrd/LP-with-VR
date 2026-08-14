import { useMemo } from "react";

export type PerfProfile = "low" | "medium" | "high";

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

/**
 * Nível de experiência de acordo com o dispositivo — ver
 * docs/vault/02-Arquitetura/Suporte-de-Dispositivos.md.
 * Stub funcional: hoje só usa CPU/RAM; perfis de GPU entram junto da Task 2.
 */
export function usePerfProfile(): PerfProfile {
  return useMemo(() => {
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (navigator as NavigatorWithMemory).deviceMemory ?? 4;

    if (cores >= 8 && memory >= 8) return "high";
    if (cores >= 4 && memory >= 4) return "medium";
    return "low";
  }, []);
}
