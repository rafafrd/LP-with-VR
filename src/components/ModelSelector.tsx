import type { KeyboardEvent } from "react";
import { useModelSelection } from "../hooks/useModelSelection";
import type { GlassesModelId } from "../hooks/useModelSelection";

/**
 * Seletor de modelos de óculos/headset para a prova virtual — Design Apple Urban.
 *
 * Padrão WAI-ARIA Radio Group acessível:
 * - `role="radiogroup"` com navegação por setas.
 * - Cada opção possui `role="radio"` e `aria-checked="true|false"`.
 * - Contraste AA, foco visível, acabamento em vidro translúcido e titânio.
 */
export default function ModelSelector() {
  const { models, selectedId, selectModel, selectNext, selectPrevious } =
    useModelSelection();

  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    _modelId: GlassesModelId,
  ) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      selectNext();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      selectPrevious();
    }
  };

  return (
    <div
      className="model-selector"
      role="region"
      aria-label="Seleção de modelo para prova virtual"
    >
      <div className="model-selector__header">
        <div className="model-selector__title-wrap">
          <span className="model-selector__pill">COLEÇÃO URBANA</span>
          <span className="model-selector__title">Modelos VOID</span>
        </div>
        <span className="model-selector__counter">
          {models.findIndex((m) => m.id === selectedId) + 1} de {models.length}
        </span>
      </div>

      <div
        className="model-selector__group"
        role="radiogroup"
        aria-label="Modelos disponíveis para prova"
      >
        {models.map((model) => {
          const isSelected = model.id === selectedId;

          return (
            <button
              key={model.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className={`model-selector__btn ${
                isSelected ? "model-selector__btn--active" : ""
              } model-selector__btn--${model.id}`}
              onClick={() => selectModel(model.id)}
              onKeyDown={(e) => handleKeyDown(e, model.id)}
            >
              <span
                className="model-selector__swatch"
                style={{
                  backgroundColor: model.color,
                  boxShadow: isSelected
                    ? `0 0 0 2px #ffffff, 0 0 16px ${model.accentColor}66`
                    : "none",
                }}
                aria-hidden="true"
              />
              <span className="model-selector__info">
                <span className="model-selector__label-row">
                  <span className="model-selector__label">{model.label}</span>
                  <span className="model-selector__tag">{model.tag}</span>
                </span>
                <span className="model-selector__desc">
                  {model.description}
                </span>
              </span>
              {isSelected && (
                <span className="model-selector__badge" aria-hidden="true">
                  <span className="model-selector__badge-dot" />
                  Ativo
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
