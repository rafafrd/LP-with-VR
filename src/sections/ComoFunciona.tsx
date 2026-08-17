import { useState } from "react";
import Reveal from "../components/Reveal";

type StepItem = {
  number: string;
  badge: string;
  title: string;
  description: string;
  metric: string;
  icon: (active: boolean) => React.ReactNode;
};

const STEPS: StepItem[] = [
  {
    number: "01",
    badge: "1 CLIQUE · ZERO INSTALAÇÃO",
    title: "Ativação Instantânea no Navegador",
    description:
      "Sem baixar extensões, aplicativos nativos ou esperar downloads pesados. Basta abrir o site, liberar a câmera com total privacidade e o motor gráfico inicia em frações de segundo.",
    metric: "< 500ms inicialização",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#0071e3" : "currentColor"} strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="m10 8 5 4-5 4V8Z" fill={active ? "#0071e3" : "none"} />
      </svg>
    ),
  },
  {
    number: "02",
    badge: "MEDIA VISION WASM & SIMD",
    title: "Mapeamento Biométrico de 468 Pontos",
    description:
      "Uma rede neural convolucional ultraleve executada diretamente no seu processador calcula a matriz de pose tridimensional da sua face, rastreando rotação, inclinação e escala métrica.",
    metric: "468 landmarks 3D",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#0071e3" : "currentColor"} strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 2v20M2 12h20" strokeDasharray="2 2" opacity={active ? "1" : "0.5"} />
        <circle cx="9" cy="10" r="1.5" fill="currentColor" />
        <circle cx="15" cy="10" r="1.5" fill="currentColor" />
        <path d="M9 16c1.5 1 4.5 1 6 0" />
      </svg>
    ),
  },
  {
    number: "03",
    badge: "RENDER FÍSICO PBR A 60 FPS",
    title: "Ancoragem Anatômica e Luz da Cidade",
    description:
      "A armação 3D se ajusta à anatomia do seu rosto com estabilização temporal anti-jitter. A iluminação de estúdio reage ao feed em tempo real, gerando reflexos e profundidade natural.",
    metric: "60 FPS contínuos",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#0071e3" : "currentColor"} strokeWidth="1.8">
        <rect x="2" y="6" width="20" height="12" rx="3" />
        <circle cx="7" cy="12" r="3" />
        <circle cx="17" cy="12" r="3" />
        <path d="M10 12h4" />
      </svg>
    ),
  },
];

export default function ComoFunciona() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="how-it-works" id="como-funciona">
      <div className="how-it-works__container">
        <div className="how-it-works__header">
          <Reveal variant="fade-up">
            <span className="eyebrow eyebrow--center">FLUXO DE EXPERIÊNCIA</span>
          </Reveal>
          <Reveal variant="fade-up" delayMs={100}>
            <h2 className="how-it-works__title">
              Como funciona o Try-On VOID.
              <br />
              <span className="text-secondary">Três etapas para a perfeição espacial.</span>
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delayMs={200}>
            <p className="how-it-works__sub">
              Da captura à renderização, cada milissegundo foi otimizado para que a
              tecnologia seja invisível e você sinta o produto imediatamente.
            </p>
          </Reveal>
        </div>

        <div className="how-it-works__layout">
          {/* Coluna de Passos Interativos com Scroll & Click */}
          <div className="how-it-works__steps">
            {STEPS.map((step, idx) => {
              const isActive = activeStep === idx;

              return (
                <Reveal
                  key={step.number}
                  variant="fade-up"
                  delayMs={idx * 120}
                  className={`how-step-card ${isActive ? "how-step-card--active" : ""}`}
                >
                  <div
                    className="how-step-card__inner"
                    onClick={() => setActiveStep(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setActiveStep(idx);
                    }}
                  >
                    <div className="how-step-card__left">
                      <span className="how-step-card__number">{step.number}</span>
                      <div className="how-step-card__icon" aria-hidden="true">
                        {step.icon(isActive)}
                      </div>
                    </div>

                    <div className="how-step-card__content">
                      <div className="how-step-card__badge-row">
                        <span className="how-step-card__badge">{step.badge}</span>
                        <span className="how-step-card__metric">{step.metric}</span>
                      </div>
                      <h3 className="how-step-card__title">{step.title}</h3>
                      <p className="how-step-card__desc">{step.description}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Painel Visual Dinâmico / Diagrama Interativo de Arquitetura */}
          <Reveal variant="scale-up" delayMs={200} className="how-it-works__visual-panel">
            <div className="how-visual-card">
              <div className="how-visual-card__top">
                <span className="how-visual-card__dot red" />
                <span className="how-visual-card__dot yellow" />
                <span className="how-visual-card__dot green" />
                <span className="how-visual-card__label">
                  FLUXO DE PROCESSAMENTO LOCAL · ETAPA {STEPS[activeStep].number}
                </span>
              </div>

              <div className="how-visual-card__screen">
                {activeStep === 0 && (
                  <div className="how-screen-content enter">
                    <div className="how-screen-radar">
                      <div className="how-radar-ring ring-1" />
                      <div className="how-radar-ring ring-2" />
                      <div className="how-radar-ring ring-3" />
                      <div className="how-radar-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                        </svg>
                      </div>
                    </div>
                    <p className="how-screen-title">Conexão Segura & Acesso Direto</p>
                    <p className="how-screen-sub">
                      Contexto criptografado no navegador · 0 dados persistidos
                    </p>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="how-screen-content enter">
                    <div className="how-screen-mesh">
                      <div className="how-mesh-face">
                        <span className="how-mesh-point p1" />
                        <span className="how-mesh-point p2" />
                        <span className="how-mesh-point p3" />
                        <span className="how-mesh-point p4" />
                        <span className="how-mesh-point p5" />
                        <span className="how-mesh-point p6" />
                        <span className="how-mesh-line l1" />
                        <span className="how-mesh-line l2" />
                      </div>
                    </div>
                    <p className="how-screen-title">Topologia Facial 3D em Tempo Real</p>
                    <p className="how-screen-sub">
                      Matriz 4×4 interpolada · 60 vezes por segundo
                    </p>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="how-screen-content enter">
                    <div className="how-screen-render">
                      <div className="how-render-glasses">
                        <span className="how-render-glow" />
                        <svg viewBox="0 0 120 40" fill="none" stroke="#1d1d1f" strokeWidth="2.5">
                          <rect x="5" y="5" width="45" height="30" rx="10" />
                          <rect x="70" y="5" width="45" height="30" rx="10" />
                          <path d="M50 18h20" />
                        </svg>
                      </div>
                    </div>
                    <p className="how-screen-title">Renderização Física PBR Integrada</p>
                    <p className="how-screen-sub">
                      Materiais em titânio e policarbonato com reflexos dinâmicos
                    </p>
                  </div>
                )}
              </div>

              <div className="how-visual-card__footer">
                <span className="how-footer-stat">
                  Status: <strong>Ativo & Operacional</strong>
                </span>
                <span className="how-footer-stat">
                  Pipeline: <strong>WASM + WebGL 2.0</strong>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
