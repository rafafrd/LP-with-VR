import { lazy, Suspense, useCallback, useRef } from "react";
import Button from "../components/Button";
import GlitchText from "../components/GlitchText";
import StaticFallback from "../scene/StaticFallback";

// Code-splitting com React.lazy para reduzir o bundle inicial (Orcamento-de-Performance.md)
const TryOnStage = lazy(() => import("../components/TryOnStage"));

export default function Hero() {
  const glowRef = useRef<HTMLDivElement>(null);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const glow = glowRef.current;
    if (
      !glow ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover)").matches
    ) {
      return;
    }
    const rect = glow.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    glow.style.background =
      `radial-gradient(560px circle at ${x}% ${y}%, rgba(207, 255, 4, 0.14), transparent 60%),` +
      "radial-gradient(500px circle at 80% 70%, rgba(207, 255, 4, 0.06), transparent 60%)," +
      "radial-gradient(900px circle at 15% 85%, rgba(255, 46, 106, 0.08), transparent 60%)";
  }, []);

  return (
    <section className="hero" id="hero" onPointerMove={onPointerMove}>
      <div className="hero__glow" ref={glowRef} aria-hidden="true" />

      {/* Stage unificado de Try-On (vídeo + canvas 3D) carregado sob demanda com fallback estático */}
      <Suspense
        fallback={
          <div className="hero__canvas hero__canvas--loading" aria-hidden="true">
            <StaticFallback />
          </div>
        }
      >
        <TryOnStage />
      </Suspense>

      <div className="hero__inner enter">
        <p className="eyebrow">TRY-ON FACIAL · 100% NAVEGADOR · SEM INSTALAR</p>
        <h1 className="hero__title" data-text="A REALIDADE TEM UM UPGRADE.">
          A REALIDADE TEM
          <br />
          <GlitchText text="UM UPGRADE." />
        </h1>
        <p className="hero__sub">
          VOID é a experiência de prova virtual em 3D direto no seu navegador.
          Sem headset, sem baixar aplicativo — ligue a câmera e experimente em tempo real.
        </p>
        <div className="hero__cta">
          <Button href="#acesso" variant="primary">
            Entrar no VOID <span aria-hidden="true">→</span>
          </Button>
          <Button href="#como-funciona" variant="ghost">
            Ver como funciona
          </Button>
        </div>
      </div>

      <a href="#filosofia" className="scroll-cue" aria-label="Rolar para a próxima seção">
        <span>role</span>
        <span className="scroll-cue__line" aria-hidden="true" />
      </a>
    </section>
  );
}
