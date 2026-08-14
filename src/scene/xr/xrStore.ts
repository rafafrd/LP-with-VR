import { createXRStore } from "@react-three/xr";
import { track } from "../../lib/analytics";

let sessionStartTime = 0;

/**
 * Store global do WebXR via @react-three/xr.
 * Conforme docs/vault/05-VR-e-3D/ e Orcamento-de-Performance.md:
 * - emulate: false para não emular hardware falso em desenvolvimento desktop
 * - fixedFoveation / foveation: 1.0 para otimização em headsets standalone (Quest)
 * - frameRate: 'high' para atingir 90Hz/120Hz quando suportado
 */
export const xrStore = createXRStore({
  emulate: false,
  foveation: 1.0,
  frameRate: "high",
  enterGrantedSession: false,
});

// Listener para início e término de sessão WebXR para telemetria e liberação de recursos
xrStore.subscribe((state, prevState) => {
  const currentSession = state.session;
  const previousSession = prevState.session;

  if (currentSession && !previousSession) {
    sessionStartTime = performance.now();
    track({
      action: "xr_session_started",
      label: state.mode ?? "immersive-vr",
    });

    currentSession.addEventListener("end", () => {
      const durationSeconds = Math.max(
        0,
        Math.round((performance.now() - sessionStartTime) / 1000)
      );
      track({
        action: "xr_session_ended",
        value: durationSeconds,
      });
    });
  }
});
