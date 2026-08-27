import { useEffect, useRef, useState } from "react";
import { useAccessibility } from "../hooks/useAccessibility";

export default function AccessibilityWidget() {
  const {
    theme,
    fontScale,
    reducedMotion,
    highContrast,
    setTheme,
    toggleTheme,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleReducedMotion,
    toggleHighContrast,
    resetAll,
  } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Fecha o painel ao pressionar ESC ou clicar fora
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const percentage = Math.round(fontScale * 100);

  return (
    <div className="a11y-container">
      {/* Botão de Atalho Rápido de Tema */}
      <button
        type="button"
        className="a11y-quick-theme-btn"
        onClick={toggleTheme}
        aria-label={`Trocar para tema ${theme === "light" ? "escuro azul midnight" : "claro branco-nuvem"}`}
        title={`Trocar para tema ${theme === "light" ? "escuro azul midnight" : "claro branco-nuvem"}`}
      >
        {theme === "light" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        )}
      </button>

      {/* Botão Gatilho do Menu de Acessibilidade */}
      <button
        ref={triggerRef}
        type="button"
        className={`a11y-trigger-btn ${isOpen ? "is-active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Painel de Acessibilidade (Tamanho do Texto, Tema e Preferências)"
        title="Painel de Acessibilidade"
      >
        <span className="a11y-icon-text" aria-hidden="true">A±</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="a11y-icon-wheel"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      </button>

      {/* Modal / Painel Flutuante de Acessibilidade */}
      {isOpen && (
        <div
          ref={panelRef}
          className="a11y-panel enter"
          role="dialog"
          aria-modal="true"
          aria-label="Opções de Acessibilidade e Ajuste Visual"
        >
          <div className="a11y-panel__header">
            <div className="a11y-panel__title-wrap">
              <span className="a11y-panel__tag">ACESSIBILIDADE</span>
              <h3 className="a11y-panel__title">Preferências Visuais</h3>
            </div>
            <button
              type="button"
              className="a11y-panel__close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar painel de acessibilidade"
            >
              ✕
            </button>
          </div>

          <div className="a11y-panel__body">
            {/* Seção 1: Ajuste de Tamanho de Fonte */}
            <div className="a11y-section">
              <div className="a11y-section__header">
                <span className="a11y-section__label">Tamanho do Texto</span>
                <span className="a11y-section__value" aria-live="polite">
                  {percentage}%
                </span>
              </div>

              <div className="a11y-font-controls">
                <button
                  type="button"
                  className="a11y-font-btn"
                  onClick={decreaseFontSize}
                  disabled={fontScale <= 0.875}
                  aria-label="Diminuir tamanho da fonte"
                >
                  <span className="a11y-font-btn-text">A−</span>
                  <span className="a11y-font-btn-sub">Menor</span>
                </button>

                <button
                  type="button"
                  className={`a11y-font-btn a11y-font-btn--reset ${
                    fontScale === 1 ? "is-current" : ""
                  }`}
                  onClick={resetFontSize}
                  aria-label="Redefinir tamanho da fonte para 100%"
                >
                  <span className="a11y-font-btn-text">100%</span>
                  <span className="a11y-font-btn-sub">Padrão</span>
                </button>

                <button
                  type="button"
                  className="a11y-font-btn"
                  onClick={increaseFontSize}
                  disabled={fontScale >= 1.375}
                  aria-label="Aumentar tamanho da fonte"
                >
                  <span className="a11y-font-btn-text">A+</span>
                  <span className="a11y-font-btn-sub">Maior</span>
                </button>
              </div>
            </div>

            {/* Seção 2: Alternador de Tema (Claro / Azul Midnight) */}
            <div className="a11y-section">
              <span className="a11y-section__label">Tema Visual</span>
              <div
                className="a11y-theme-selector"
                role="radiogroup"
                aria-label="Seletor de tema claro ou escuro"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={theme === "light"}
                  className={`a11y-theme-btn ${theme === "light" ? "is-selected" : ""}`}
                  onClick={() => setTheme("light")}
                >
                  <span className="a11y-theme-preview a11y-theme-preview--light" aria-hidden="true">
                    <span className="a11y-preview-sun">☀️</span>
                  </span>
                  <div className="a11y-theme-info">
                    <span className="a11y-theme-title">Branco-Nuvem</span>
                    <span className="a11y-theme-desc">Modo Claro Apple</span>
                  </div>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={theme === "dark"}
                  className={`a11y-theme-btn ${theme === "dark" ? "is-selected" : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  <span className="a11y-theme-preview a11y-theme-preview--dark" aria-hidden="true">
                    <span className="a11y-preview-moon">🌙</span>
                  </span>
                  <div className="a11y-theme-info">
                    <span className="a11y-theme-title">Azul Midnight</span>
                    <span className="a11y-theme-desc">Modo Escuro Profundo</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Seção 3: Preferências Adicionais de Acessibilidade */}
            <div className="a11y-section">
              <span className="a11y-section__label">Ajustes Adicionais</span>
              <div className="a11y-toggles-list">
                <label className="a11y-toggle-item">
                  <div className="a11y-toggle-text">
                    <span className="a11y-toggle-title">Reduzir Movimento</span>
                    <span className="a11y-toggle-desc">Suprime transições e animações de scroll</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={toggleReducedMotion}
                    className="a11y-checkbox"
                  />
                  <span className="a11y-switch" aria-hidden="true" />
                </label>

                <label className="a11y-toggle-item">
                  <div className="a11y-toggle-text">
                    <span className="a11y-toggle-title">Alto Contraste</span>
                    <span className="a11y-toggle-desc">Aumenta a separação de bordas e textos</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={toggleHighContrast}
                    className="a11y-checkbox"
                  />
                  <span className="a11y-switch" aria-hidden="true" />
                </label>
              </div>
            </div>
          </div>

          <div className="a11y-panel__footer">
            <button
              type="button"
              className="a11y-reset-btn"
              onClick={resetAll}
            >
              Restaurar Padrões
            </button>
            <button
              type="button"
              className="a11y-done-btn"
              onClick={() => setIsOpen(false)}
            >
              Concluído
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
