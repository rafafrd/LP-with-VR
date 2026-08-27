import type { ReactNode } from "react";
import InteractiveTiltCard from "../components/InteractiveTiltCard";
import Reveal from "../components/Reveal";

type BentoCard = {
  title: string;
  category: string;
  body: string;
  highlight: string;
  icon: ReactNode;
  span?: "large" | "medium" | "small";
};

const BENTO_CARDS: BentoCard[] = [
  {
    category: "PERFORMANCE DE BAIXO NÍVEL",
    title: "Motor Neural WebAssembly + SIMD",
    body: "Compilado em C++ e executado via WebAssembly no navegador. Utiliza instruções vetoriais SIMD para calcular os 468 pontos anatômicos em menos de 10 milissegundos por quadro.",
    highlight: "60 FPS · Bare-Metal",
    span: "large",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    category: "SEGURANÇA & LGPD",
    title: "Arquitetura Zero-Leakage (100% On-Device)",
    body: "Seu vídeo nunca sai do seu aparelho. A inferência de visão computacional ocorre estritamente na memória local (RAM). Zero servidores intermediários, zero cookies intrusivos.",
    highlight: "100% Privado",
    span: "medium",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    category: "ESTABILIDADE CINEMÁTICA",
    title: "Filtro Temporal Anti-Jitter",
    body: "Interpolação contínua (SLERP e LERP) sobre a matriz de pose 4×4. Elimina o micro-tremor de câmeras comuns e mantém a ancoragem firme mesmo em movimentos rápidos de cabeça.",
    highlight: "Estabilidade Total",
    span: "medium",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    category: "OTIMIZAÇÃO DE ASSETS",
    title: "Compressão Draco & Meshopt",
    body: "Geometrias 3D reduzidas a menos de 15kB por modelo. Carregamento instantâneo em qualquer conexão 4G urbana, sem drenar dados nem bateria.",
    highlight: "< 15kB por modelo",
    span: "small",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    category: "COMPATIBILIDADE",
    title: "Ecossistema Universal Aberto",
    body: "Funciona nativamente no Safari (iOS/macOS), Chrome, Firefox, Edge e navegadores Android sem precisar de permissões especiais de sistema.",
    highlight: "Universal Web",
    span: "small",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

export default function Beneficios() {
  return (
    <section className="engineering" id="engenharia">
      <div className="engineering__container">
        <div className="engineering__head">
          <Reveal variant="fade-up">
            <span className="eyebrow eyebrow--center">ENGENHARIA DE PRECISÃO</span>
          </Reveal>
          <Reveal variant="fade-up" delayMs={100}>
            <h2 className="engineering__title">
              Arquitetura projetada para a web.
              <br />
              <span className="text-secondary">Sem concessões de desempenho.</span>
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delayMs={200}>
            <p className="engineering__sub">
              Combinamos visão computacional de última geração com renderização gráfica 3D
              acelerada por hardware para criar uma experiência fluida como a realidade.
            </p>
          </Reveal>
        </div>

        <div className="engineering__bento-grid">
          {BENTO_CARDS.map((card, idx) => (
            <Reveal
              key={card.title}
              variant="fade-up"
              delayMs={idx * 80}
              className={`bento-card bento-card--${card.span || "medium"}`}
            >
              <InteractiveTiltCard maxTiltDeg={6} className="bento-card__tilt">
                <div className="bento-card__inner">
                  <div className="bento-card__top">
                    <span className="bento-card__cat">{card.category}</span>
                    <div className="bento-card__icon" aria-hidden="true">
                      {card.icon}
                    </div>
                  </div>

                  <div className="bento-card__middle">
                    <h3 className="bento-card__title">{card.title}</h3>
                    <p className="bento-card__body">{card.body}</p>
                  </div>

                  <div className="bento-card__bottom">
                    <span className="bento-card__highlight">
                      <span className="bento-card__dot" />
                      {card.highlight}
                    </span>
                  </div>
                </div>
              </InteractiveTiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
