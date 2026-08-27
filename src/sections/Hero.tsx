import { lazy, Suspense } from "react";
import Button from "../components/Button";
import Reveal from "../components/Reveal";
import { useCounterAnimation } from "../hooks/useCounterAnimation";
import StaticFallback from "../scene/StaticFallback";

const TryOnStage = lazy(() => import("../components/TryOnStage"));

export default function Hero() {
  const pointsCounter = useCounterAnimation(468, 1400);
  const latencyCounter = useCounterAnimation(12, 1200, 0, "~", "ms");
  const fpsCounter = useCounterAnimation(60, 1000, 0, "", " FPS");

  return (
    <section className="hero" id="hero">
      <div className="hero__container">
        {/* Cabeçalho Editorial Estilo Apple Keynote / Editions */}
        <div className="hero__header">
          <Reveal variant="fade-up" delayMs={50}>
            <div className="hero__badge-wrap">
              <span className="hero__badge">
                <span className="hero__badge-pulse" aria-hidden="true" />
                EDITIONS WINTER 2026 · TRY-ON SPATIAL
              </span>
            </div>
          </Reveal>

          <Reveal variant="fade-up" delayMs={150}>
            <h1 className="hero__title">
              A precisão da metrópole.
              <br />
              <span className="hero__title-gradient">Direto no seu olhar.</span>
            </h1>
          </Reveal>

          <Reveal variant="fade-up" delayMs={250}>
            <p className="hero__subtitle">
              Experimente a nova geração de óculos e visores VOID em 3D de alta
              fidelidade, ancorados em tempo real no seu rosto. Sem baixar apps, sem cadastro
              e com processamento 100% local no seu navegador.
            </p>
          </Reveal>

          {/* Telemetria com Contagem Cinética estilo Shopify Editions */}
          <Reveal variant="fade-up" delayMs={350}>
            <div className="hero__telemetry-bar">
              <div className="hero__telemetry-item">
                <span className="hero__telemetry-value" ref={pointsCounter.ref}>
                  {pointsCounter.displayValue}
                </span>
                <span className="hero__telemetry-label">Pontos de Tracking</span>
              </div>
              <div className="hero__telemetry-divider" aria-hidden="true" />
              <div className="hero__telemetry-item">
                <span className="hero__telemetry-value" ref={latencyCounter.ref}>
                  {latencyCounter.displayValue}
                </span>
                <span className="hero__telemetry-label">Latência Estimada</span>
              </div>
              <div className="hero__telemetry-divider" aria-hidden="true" />
              <div className="hero__telemetry-item">
                <span className="hero__telemetry-value" ref={fpsCounter.ref}>
                  {fpsCounter.displayValue}
                </span>
                <span className="hero__telemetry-label">WebGL + WASM</span>
              </div>
              <div className="hero__telemetry-divider" aria-hidden="true" />
              <div className="hero__telemetry-item">
                <span className="hero__telemetry-value">0 bytes</span>
                <span className="hero__telemetry-label">Vídeo em Nuvem</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Stage de Prova Virtual com Moldura de Hardware de Precisão */}
        <Reveal variant="scale-up" delayMs={400} className="hero__stage-wrapper">
          <Suspense
            fallback={
              <div className="hero__canvas hero__canvas--loading" aria-hidden="true">
                <StaticFallback />
              </div>
            }
          >
            <TryOnStage />
          </Suspense>
        </Reveal>

        {/* Ações de Apoio e Scroll Cue */}
        <Reveal variant="fade-up" delayMs={500} className="hero__footer">
          <div className="hero__cta-group">
            <Button href="#showcase" variant="secondary">
              Explorar Coleção Urbana <span aria-hidden="true">↓</span>
            </Button>
            <Button href="#como-funciona" variant="ghost">
              Ver Como Funciona
            </Button>
          </div>

          <a href="#showcase" className="scroll-cue" aria-label="Rolar para a seção da coleção">
            <span className="scroll-cue__text">Explore a Coleção</span>
            <span className="scroll-cue__indicator" aria-hidden="true">
              <span className="scroll-cue__dot" />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
