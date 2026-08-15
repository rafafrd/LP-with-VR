import { useCallback, useSyncExternalStore } from "react";

/**
 * Modelos de óculos/headset disponíveis no VOID (Task 7).
 *
 * Cada modelo representa um asset GLB otimizado pelo pipeline de
 * docs/vault/05-VR-e-3D/Pipeline-de-Assets-3D.md em `public/models/`.
 * Escala métrica (Three.js / WebXR): largura real de ~14cm.
 */
export type GlassesModelId = "acid" | "violet" | "magenta";

export type GlassesModelInfo = {
  /** Identificador único do modelo. */
  id: GlassesModelId;
  /** Nome legível para exibição na UI. */
  label: string;
  /** Variante ou estilo (ex.: "Clássico", "Cyber", "Visor"). */
  tag: string;
  /** Descrição curta do design. */
  description: string;
  /** Caminho do arquivo GLB otimizado na pasta public/. */
  path: string;
  /** Cor de destaque principal (hex). */
  color: string;
  /** Cor secundária / brilho (hex). */
  accentColor: string;
};

/**
 * Catálogo fixo de modelos disponíveis para a prova virtual (RF-03).
 */
export const AVAILABLE_MODELS: readonly GlassesModelInfo[] = [
  {
    id: "acid",
    label: "Neon Classic",
    tag: "Clássico",
    description: "Armação redonda clássica com acabamento neon acid",
    path: "/models/glasses-acid.glb",
    color: "#cfff04",
    accentColor: "#8fb300",
  },
  {
    id: "violet",
    tag: "Cyber Hex",
    label: "Cyber Edge",
    description: "Armação angular hexagonal com barra dupla superior",
    path: "/models/glasses-violet.glb",
    color: "#8b5cf6",
    accentColor: "#d8b4fe",
  },
  {
    id: "magenta",
    tag: "Headset",
    label: "Cyberdeck Visor",
    description: "Visor panorâmico contínuo com módulos laterais tech",
    path: "/models/glasses-magenta.glb",
    color: "#ff2e6a",
    accentColor: "#ff7597",
  },
] as const;

/**
 * Store reativo externo compartilhado (padrão useSyncExternalStore).
 *
 * Decisão de arquitetura:
 * No React Three Fiber (R3F), a árvore do `<Canvas>` roda em um reconciler
 * separado da árvore DOM normal. Usar `useSyncExternalStore` garante que o
 * estado da seleção seja compartilhado instantaneamente entre o componente
 * DOM (`<ModelSelector />`) e o componente 3D (`<GlassesModel />` dentro do
 * Canvas), sem necessidade de prop drilling ou bridges manuais de Context.
 */
type Listener = () => void;

let currentSelectedId: GlassesModelId = "acid";
const listeners = new Set<Listener>();

function getSnapshot(): GlassesModelId {
  return currentSelectedId;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Altera o modelo selecionado e notifica todos os componentes inscritos (DOM e R3F).
 */
export function setGlobalSelectedModel(id: GlassesModelId): void {
  if (currentSelectedId === id) return;
  const exists = AVAILABLE_MODELS.some((m) => m.id === id);
  if (!exists) return;
  currentSelectedId = id;
  listeners.forEach((listener) => listener());
}

export type UseModelSelectionResult = {
  /** Lista completa de modelos disponíveis. */
  models: readonly GlassesModelInfo[];
  /** Modelo atualmente selecionado. */
  selectedModel: GlassesModelInfo;
  /** ID do modelo atualmente selecionado. */
  selectedId: GlassesModelId;
  /** Função para alterar o modelo selecionado pelo ID. */
  selectModel: (id: GlassesModelId) => void;
  /** Seleciona o próximo modelo da lista (útil para atalhos de teclado). */
  selectNext: () => void;
  /** Seleciona o modelo anterior da lista. */
  selectPrevious: () => void;
};

/**
 * Hook para gerenciar e consumir o modelo de óculos/headset selecionado (Task 7 / Task 8).
 *
 * Pode ser chamado tanto em componentes DOM quanto em componentes 3D do R3F.
 */
export function useModelSelection(): UseModelSelectionResult {
  const selectedId = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const selectedModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedId) ?? AVAILABLE_MODELS[0];

  const selectModel = useCallback((id: GlassesModelId) => {
    setGlobalSelectedModel(id);
  }, []);

  const selectNext = useCallback(() => {
    const currentIndex = AVAILABLE_MODELS.findIndex(
      (m) => m.id === currentSelectedId,
    );
    const nextIndex = (currentIndex + 1) % AVAILABLE_MODELS.length;
    setGlobalSelectedModel(AVAILABLE_MODELS[nextIndex].id);
  }, []);

  const selectPrevious = useCallback(() => {
    const currentIndex = AVAILABLE_MODELS.findIndex(
      (m) => m.id === currentSelectedId,
    );
    const prevIndex =
      (currentIndex - 1 + AVAILABLE_MODELS.length) % AVAILABLE_MODELS.length;
    setGlobalSelectedModel(AVAILABLE_MODELS[prevIndex].id);
  }, []);

  return {
    models: AVAILABLE_MODELS,
    selectedModel,
    selectedId,
    selectModel,
    selectNext,
    selectPrevious,
  };
}
