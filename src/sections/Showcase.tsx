import { lazy, Suspense } from "react";
import Button from "../components/Button";
import InteractiveTiltCard from "../components/InteractiveTiltCard";
import Reveal from "../components/Reveal";
import {
  AVAILABLE_MODELS,
  useModelSelection,
  type GlassesModelId,
} from "../hooks/useModelSelection";
import StaticFallback from "../scene/StaticFallback";

const ExplodedStudio = lazy(() => import("../components/ExplodedStudio"));

export default function Showcase() {
  const { selectedId, selectModel } = useModelSelection();

  const handleSelectAndTry = (id: GlassesModelId) => {
    selectModel(id);
    const heroEl = document.getElementById("hero");
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="showcase" id="showcase">
      <div className="showcase__container">
        <div className="showcase__header">
          <Reveal variant="fade-up">
            <span className="eyebrow eyebrow--center">DESIGN & ENGENHARIA</span>
          </Reveal>
          <Reveal variant="fade-up" delayMs={100}>
            <h2 className="showcase__title">
              Coleção Urbana VOID.
              <br />
              <span className="text-secondary">Três manifestos de forma e função.</span>
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delayMs={200}>
            <p className="showcase__sub">
              Projetados para a dinâmica da vida urbana moderna: peso mínimo, ergonomia
              anatômica e estética arquitetônica atemporal.
            </p>
          </Reveal>
        </div>

        {/* Grade de Modelos com 3D Perspective Tilt estilo Shopify Editions */}
        <div className="showcase__grid">
          {AVAILABLE_MODELS.map((model, index) => {
            const isSelected = model.id === selectedId;

            return (
              <Reveal
                key={model.id}
                variant="fade-up"
                delayMs={index * 120}
                className="showcase__card"
              >
                <InteractiveTiltCard
                  className={`showcase__card-tilt ${
                    isSelected ? "showcase__card--selected" : ""
                  }`}
                  maxTiltDeg={8}
                >
                  <div className="showcase__card-inner">
                    <div className="showcase__card-badge-row">
                      <span className="showcase__card-tag">{model.tag}</span>
                      {isSelected && (
                        <span className="showcase__card-active-pill">
                          <span className="showcase__card-dot" /> Selecionado no 3D
                        </span>
                      )}
                    </div>

                    <div className="showcase__visual-preview">
                      <div
                        className="showcase__swatch-circle"
                        style={{
                          backgroundColor: model.color,
                          boxShadow: `0 8px 24px ${model.accentColor}44`,
                        }}
                      />
                      <div className="showcase__metric-chips">
                        <span className="showcase__chip">{model.specs.weight}</span>
                        <span className="showcase__chip">{model.specs.material}</span>
                      </div>
                    </div>

                    <div className="showcase__card-body">
                      <h3 className="showcase__card-title">{model.label}</h3>
                      <p className="showcase__card-desc">{model.description}</p>

                      <div className="showcase__specs-table">
                        <div className="showcase__spec-row">
                          <span className="showcase__spec-key">Material</span>
                          <span className="showcase__spec-val">{model.specs.material}</span>
                        </div>
                        <div className="showcase__spec-row">
                          <span className="showcase__spec-key">Lentes</span>
                          <span className="showcase__spec-val">{model.specs.optics}</span>
                        </div>
                        <div className="showcase__spec-row">
                          <span className="showcase__spec-key">Massa Total</span>
                          <span className="showcase__spec-val">{model.specs.weight}</span>
                        </div>
                      </div>

                      <div className="showcase__card-actions">
                        <button
                          type="button"
                          className={`showcase__btn-select ${
                            isSelected ? "showcase__btn-select--active" : ""
                          }`}
                          onClick={() => handleSelectAndTry(model.id)}
                        >
                          {isSelected ? "Experimentar no Rosto ↑" : "Selecionar & Provar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </InteractiveTiltCard>
              </Reveal>
            );
          })}
        </div>

        {/* Laboratório Interativo de Visão Explodida 3D */}
        <Reveal variant="scale-up" delayMs={200} className="showcase__exploded-wrap">
          <Suspense
            fallback={
              <div className="exploded-studio" style={{ minHeight: "480px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <StaticFallback />
              </div>
            }
          >
            <ExplodedStudio />
          </Suspense>
        </Reveal>

        {/* Destaque Tecnológico de Acabamento com Tilt Suave */}
        <Reveal variant="fade-up" delayMs={300} className="showcase__spotlight">
          <InteractiveTiltCard maxTiltDeg={3} className="showcase__spotlight-tilt">
            <div className="showcase__spotlight-inner">
              <div className="showcase__spotlight-text">
                <span className="showcase__spotlight-label">ACABAMENTO DE GRAU AEROESPACIAL</span>
                <h3 className="showcase__spotlight-heading">
                  Titânio usinado e polímeros ópticos de alta resiliência.
                </h3>
                <p className="showcase__spotlight-copy">
                  Cada armação da coleção VOID foi calibrada digitalmente para manter proporções
                  perfeitas na tela e simular com precisão a refração da luz solar nas cidades.
                </p>
              </div>
              <div className="showcase__spotlight-action">
                <Button href="#hero" variant="primary">
                  Testar Agora no Seu Rosto <span aria-hidden="true">↑</span>
                </Button>
              </div>
            </div>
          </InteractiveTiltCard>
        </Reveal>
      </div>
    </section>
  );
}
