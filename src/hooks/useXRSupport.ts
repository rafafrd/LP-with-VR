import { useEffect, useState } from "react";

type NavigatorWithXR = Navigator & { xr?: XRSystem };

/**
 * Detecta se o navegador suporta sessões WebXR imersivas. Stub funcional —
 * a decisão de entrar em VR acontece na Task 2 (src/scene/xr/).
 */
export function useXRSupport(): boolean {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    let active = true;
    const xr = (navigator as NavigatorWithXR).xr;
    if (!xr) return;

    xr
      .isSessionSupported("immersive-vr")
      .then((ok) => {
        if (active) setSupported(ok);
      })
      .catch(() => {
        if (active) setSupported(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return supported;
}
