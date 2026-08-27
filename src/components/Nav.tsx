import { useState } from "react";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import AccessibilityWidget from "./AccessibilityWidget";
import Button from "./Button";

export default function Nav() {
  const { scrollProgress, activeSection, isScrolled } = useScrollAnimations();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Barra de progresso de scroll suave no topo absoluto */}
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
        aria-hidden="true"
      />

      <header
        className={`nav ${isScrolled ? "is-scrolled" : ""}`}
        id="nav"
        role="banner"
      >
        <div className="nav__inner">
          <a href="#top" className="nav__logo" aria-label="VOID Spatial Optics — início">
            <span className="nav__logo-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 0 1 9 9" stroke="#0071e3" />
                <circle cx="12" cy="12" r="3.5" fill="#0071e3" />
              </svg>
            </span>
            <span className="nav__logo-text">VOID</span>
            <span className="nav__logo-badge">SPATIAL</span>
          </a>

          <nav
            className={`nav__links ${mobileOpen ? "nav__links--open" : ""}`}
            aria-label="Navegação principal"
          >
            <a
              href="#hero"
              className={`nav__link ${activeSection === "hero" || activeSection === "top" ? "is-active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              Try-On
            </a>
            <a
              href="#showcase"
              className={`nav__link ${activeSection === "showcase" ? "is-active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              Coleção
            </a>
            <a
              href="#como-funciona"
              className={`nav__link ${activeSection === "como-funciona" ? "is-active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              Como Funciona
            </a>
            <a
              href="#engenharia"
              className={`nav__link ${activeSection === "engenharia" ? "is-active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              Engenharia
            </a>
            <a
              href="#specs"
              className={`nav__link ${activeSection === "specs" ? "is-active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              Especificações
            </a>
            <a
              href="#campanha"
              className={`nav__link ${activeSection === "campanha" ? "is-active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              Lookbook
            </a>
          </nav>

          <div className="nav__actions">
            {/* Widget de Acessibilidade & Tema */}
            <AccessibilityWidget />

            <Button href="#hero" variant="primary-sm">
              Ligar Câmera
            </Button>
            <button
              type="button"
              className="nav__mobile-toggle"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className={`nav__hamburger ${mobileOpen ? "is-open" : ""}`} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
