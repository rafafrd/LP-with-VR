import { useCallback, useSyncExternalStore } from "react";

/**
 * Modelos de óculos/headset disponíveis no VOID Spatial Optics (Coleção Urbana).
 *
 * Cada modelo representa um asset GLB otimizado pelo pipeline de
 * docs/vault/05-VR-e-3D/Pipeline-de-Assets-3D.md em `public/models/`.
 * Escala métrica (Three.js / WebXR): largura real de ~14cm.
 */
export type GlassesModelId = "acid" | "violet" | "magenta" | "chrome";

export type GlassesModelInfo = {
  /** Identificador único do modelo. */
  id: GlassesModelId;
  /** Nome legível para exibição na UI. */
  label: string;
  /** Variante ou acabamento (ex.: "Titânio Natural", "Cobalto Safira", "Visor Aero"). */
  tag: string;
  /** Descrição editorial do design urbano. */
  description: string;
  /** Caminho do arquivo GLB otimizado na pasta public/. */
  path: string;
  /** Cor de destaque principal (hex). */
  color: string;
  /** Cor secundária / brilho (hex). */
  accentColor: string;
  /** Especificações rápidas para a galeria */
  specs: {
    weight: string;
    material: string;
    optics: string;
  };
};

/**
 * Catálogo fixo de modelos disponíveis para a prova virtual (RF-03).
 */
export const AVAILABLE_MODELS: readonly GlassesModelInfo[] = [
  {
    id: "acid",
    label: "Titanium Minimal",
    tag: "Titânio Natural",
    description:
      "Armação circular esculpida em liga de titânio aeroespacial. Leveza absoluta para o ritmo diário da cidade.",
    path: "/models/glasses-acid.glb",
    color: "#242528",
    accentColor: "#0071e3",
    specs: {
      weight: "14.2 g",
      material: "Titânio Grau 5",
      optics: "Polarizado AR",
    },
  },
  {
    id: "violet",
    label: "Metropolis Hex",
    tag: "Cobalto & Safira",
    description:
      "Design geométrico angular inspirado nos perfis arquitetônicos de grandes metrópoles contemporâneas.",
    path: "/models/glasses-violet.glb",
    color: "#3b4261",
    accentColor: "#6366f1",
    specs: {
      weight: "16.8 g",
      material: "Polímero Aero + Titânio",
      optics: "Filtro Blue Light +",
    },
  },
  {
    id: "magenta",
    label: "Spatial Studio Visor",
    tag: "Visor Aero",
    description:
      "Escudo contínuo panorâmico com curvatura óptica precisa e acoplamento biomecânico de perfil ultra-slim.",
    path: "/models/glasses-magenta.glb",
    color: "#0f4c81",
    accentColor: "#0071e3",
    specs: {
      weight: "21.5 g",
      material: "Compósito Magnésio",
      optics: "Foto-reativo UV400",
    },
  },
  {
    id: "chrome",
    label: "Y2K Chrome Wave",
    tag: "Cromado Y2K",
    description:
      "Silhueta wraparound assimétrica em acabamento cromado espelhado, com bico varrendo pra cima — o revival Y2K mais ousado da coleção.",
    path: "/models/glasses-chrome.glb",
    color: "#d9dce3",
    accentColor: "#f2f4f7",
    specs: {
      weight: "17.8 g",
      material: "Alumínio Polido Cromado",
      optics: "Lente Espelhada UV400",
    },
  },
] as const;

/**
 * Store reativo externo compartilhado (padrão useSyncExternalStore).
 * Sincroniza instantaneamente o estado entre a árvore DOM e o Canvas R3F.
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
 * Hook para gerenciar e consumir o modelo de óculos/headset selecionado.
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
