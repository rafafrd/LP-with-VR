import type { ReactNode } from "react";
import Reveal from "../components/Reveal";

type Card = {
  title: string;
  body: string;
  icon: ReactNode;
};

const CARDS: Card[] = [
  {
    title: "WebXR nativo",
    body: "Entra em VR direto do navegador, sem instalar app nem SDK. O headset é detectado e a sessão abre na hora.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Fallback 3D",
    body: "Sem headset? A experiência em 3D convencional carrega automaticamente — ninguém fica de fora da conversa.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 17h16M4 12h10M4 7h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Performance sob controle",
    body: "Orçamento de frame definido, LOD automático por dispositivo. Roda liso até em celular de entrada.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 20 10 8l4 6 3-4 3 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Zero fricção",
    body: "Um link. Abre. Converte. Sem cadastro pra ver a demo, sem app pra baixar antes de sentir o produto.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M13 3 5 14h6l-1 7 9-12h-7l1-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Beneficios() {
  return (
    <section className="features" id="experiencia">
      <div className="features__head">
        <Reveal>
          <p className="eyebrow">EXPERIÊNCIA</p>
        </Reveal>
        <Reveal>
          <h2>
            Progressive enhancement,
            <br />
            não promessa vazia.
          </h2>
        </Reveal>
      </div>

      <div className="features__grid" id="specs">
        {CARDS.map((card) => (
          <Reveal key={card.title} className="card">
            <div className="card__icon" aria-hidden="true">
              {card.icon}
            </div>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
