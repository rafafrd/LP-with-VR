import { useState } from "react";
import { useScrollAnimations } from "../hooks/useScrollAnimations";

type Chapter = {
  id: string;
  number: string;
  name: string;
};

const CHAPTERS: Chapter[] = [
  { id: "hero", number: "01", name: "Try-On Spatial" },
  { id: "showcase", number: "02", name: "Coleção Urbana" },
  { id: "como-funciona", number: "03", name: "Storyboard" },
  { id: "engenharia", number: "04", name: "Engenharia WASM" },
  { id: "specs", number: "05", name: "Especificações" },
];

export default function EditionsDock() {
  const { activeSection, isScrolled, scrollProgress } = useScrollAnimations();
  const [ambientAudioActive, setAmbientAudioActive] = useState(false);

  const currentChapterIndex = Math.max(
    0,
    CHAPTERS.findIndex(
      (c) => c.id === activeSection || (activeSection === "top" && c.id === "hero")
    )
  );

  const currentChapter = CHAPTERS[currentChapterIndex] || CHAPTERS[0];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleAmbient = () => {
    setAmbientAudioActive((prev) => !prev);
  };

  return (
    <aside
      className={`editions-dock ${isScrolled ? "is-visible" : ""}`}
      aria-label="Navegação em capítulos estilo Editions"
    >
      <div className="editions-dock__inner">
        {/* Indicador de Capítulo Ativo */}
        <div className="editions-dock__chapter">
          <span className="editions-dock__badge">
            {currentChapter.number}/{CHAPTERS.length.toString().padStart(2, "0")}
          </span>
          <span className="editions-dock__chapter-name">{currentChapter.name}</span>
        </div>

        <div className="editions-dock__divider" aria-hidden="true" />

        {/* Pontos de Marcador de Seção */}
        <div className="editions-dock__milestones" role="tablist" aria-label="Capítulos do site">
          {CHAPTERS.map((chapter, idx) => {
            const isActive = idx === currentChapterIndex;
            return (
              <button
                key={chapter.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`editions-dock__dot-btn ${isActive ? "is-active" : ""}`}
                onClick={() => scrollToSection(chapter.id)}
                title={`${chapter.number}. ${chapter.name}`}
                aria-label={`Ir para o capítulo ${chapter.number}: ${chapter.name}`}
              >
                <span className="editions-dock__dot" />
              </button>
            );
          })}
        </div>

        <div className="editions-dock__divider" aria-hidden="true" />

        {/* Efeito Visual Modo Ambiente / Haptic */}
        <button
          type="button"
          className={`editions-dock__ambient-btn ${ambientAudioActive ? "is-active" : ""}`}
          onClick={toggleAmbient}
          title={ambientAudioActive ? "Modo Imersão Ativo" : "Ativar Modo Imersão"}
          aria-label="Alternar pulso óptico de imersão"
        >
          <span className="editions-dock__wave w1" />
          <span className="editions-dock__wave w2" />
          <span className="editions-dock__wave w3" />
          <span className="editions-dock__wave w4" />
        </button>

        {/* Progresso Numérico e Botão Topo */}
        <button
          type="button"
          className="editions-dock__top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Voltar ao início"
          aria-label="Voltar ao topo da página"
        >
          <span className="editions-dock__pct">{Math.round(scrollProgress)}%</span>
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}
