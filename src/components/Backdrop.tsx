import { useEffect, useRef } from "react";

export default function Backdrop() {
  const meshRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const el = meshRef.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      el.style.setProperty("--mouse-x", `${x}%`);
      el.style.setProperty("--mouse-y", `${y}%`);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div className="ambient-backdrop" aria-hidden="true">
      <div className="ambient-mesh" ref={meshRef} />
      <div className="ambient-grid-subtle" />
      <div className="ambient-noise" />
    </div>
  );
}
