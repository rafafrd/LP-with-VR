import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import {
  AVAILABLE_MODELS,
  useModelSelection,
  type GlassesModelId,
} from "../hooks/useModelSelection";
import { usePerfProfile } from "../hooks/usePerfProfile";
import ExplodedGlassesModel, {
  COMPONENT_SPECS,
  type RenderMode,
} from "../scene/objects/ExplodedGlassesModel";
import StaticFallback from "../scene/StaticFallback";
import Button from "./Button";

export default function ExplodedStudio() {
  const { selectedId, selectModel } = useModelSelection();
  const profile = usePerfProfile();

  const [explodedProgress, setExplodedProgress] = useState<number>(0.65);
  const [renderMode, setRenderMode] = useState<RenderMode>("pbr");
  const [selectedComponentId, setSelectedComponentId] = useState<string>("lenses");
  const [isAutoPulsing, setIsAutoPulsing] = useState<boolean>(false);

  // Efeito de pulso automático suave quando ativado
  useEffect(() => {
    if (!isAutoPulsing) return;

    let animFrame: number;
    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      // Oscila suavemente entre 0.1 e 0.95 em período de 4 segundos
      const val = 0.525 + Math.sin(elapsed * 1.5) * 0.425;
      setExplodedProgress(val);
      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isAutoPulsing]);

  const activeSpec = COMPONENT_SPECS[selectedComponentId] || COMPONENT_SPECS.lenses;

  const dpr: [number, number] =
    profile === "high" ? [1, 2] : profile === "medium" ? [1, 1.5] : [1, 1];

  const handleTryOnRedirect = (id: GlassesModelId) => {
    selectModel(id);
    const heroEl = document.getElementById("hero");
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="exploded-studio" id="exploded-studio">
      <div className="exploded-studio__container">
        {/* Cabeçalho da Seção */}
        <div className="exploded-studio__header">
          <span className="eyebrow eyebrow--center">ENGENHARIA INTERATIVA 3D</span>
          <h2 className="exploded-studio__title">
            Laboratório de Anatomia Espacial.
            <br />
            <span className="text-secondary">Explore cada componente desacoplado em 3D.</span>
          </h2>
          <p className="exploded-studio__desc">
            Arraste para girar a armação em 360°, desmonte as camadas ópticas com o controle
            deslizante e inspecione as especificações dos materiais de titânio e polímeros.
          </p>
        </div>

        {/* Palco Principal: Canvas 3D + Painel Lateral de Engenharia */}
        <div className="exploded-studio__stage-grid">
          {/* Coluna Esquerda / Central: Canvas WebGL 3D */}
          <div className="exploded-studio__viewport-card">
            {/* Barra de Ferramentas Superior do 3D */}
            <div className="exploded-studio__top-toolbar">
              {/* Seletor de Modelo */}
              <div className="exploded-studio__model-tabs" role="tablist" aria-label="Modelos 3D">
                {AVAILABLE_MODELS.map((m) => {
                  const isSelected = m.id === selectedId;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      className={`exploded-studio__model-tab ${
                        isSelected ? "exploded-studio__model-tab--active" : ""
                      }`}
                      onClick={() => selectModel(m.id)}
                    >
                      <span
                        className="exploded-studio__tab-dot"
                        style={{ backgroundColor: m.color }}
                      />
                      {m.label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>

              {/* Seletor de Modo de Renderização */}
              <div className="exploded-studio__render-modes" role="group" aria-label="Modo de Render">
                <button
                  type="button"
                  className={`exploded-studio__mode-btn ${
                    renderMode === "pbr" ? "is-active" : ""
                  }`}
                  onClick={() => setRenderMode("pbr")}
                  title="Render Físico Realista"
                >
                  💎 PBR
                </button>
                <button
                  type="button"
                  className={`exploded-studio__mode-btn ${
                    renderMode === "wireframe" ? "is-active" : ""
                  }`}
                  onClick={() => setRenderMode("wireframe")}
                  title="Modo Raio-X Wireframe"
                >
                  ⚡ Wireframe
                </button>
                <button
                  type="button"
                  className={`exploded-studio__mode-btn ${
                    renderMode === "clay" ? "is-active" : ""
                  }`}
                  onClick={() => setRenderMode("clay")}
                  title="Modo Argila de Estúdio"
                >
                  ⚪ Silhueta
                </button>
              </div>
            </div>

            {/* Canvas Three.js Interativo */}
            <div className="exploded-studio__canvas-wrapper">
              <Suspense
                fallback={
                  <div className="exploded-studio__loading">
                    <StaticFallback />
                  </div>
                }
              >
                <Canvas
                  camera={{ position: [0, 0.02, 0.28], fov: 40 }}
                  dpr={dpr}
                  gl={{
                    alpha: true,
                    antialias: true,
                    powerPreference: "high-performance",
                  }}
                >
                  {/* Iluminação Studio com realce especular de titânio */}
                  <ambientLight intensity={1.5} color="#f8fafc" />
                  <directionalLight position={[0.8, 1.2, 1.0]} intensity={2.8} color="#ffffff" />
                  <directionalLight position={[-0.8, -0.4, 0.6]} intensity={1.0} color="#e2e8f0" />
                  <pointLight position={[0, 0.1, 0.25]} intensity={1.4} color="#ffffff" />
                  <pointLight position={[0, -0.15, 0.2]} intensity={0.6} color="#0071e3" />

                  {/* Rotação 3D interativa suave com amortecimento */}
                  <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={0.16}
                    maxDistance={0.55}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI - Math.PI / 6}
                    enableDamping={true}
                    dampingFactor={0.06}
                    autoRotate={!isAutoPulsing && explodedProgress === 0}
                    autoRotateSpeed={0.6}
                  />

                  <ExplodedGlassesModel
                    explodedProgress={explodedProgress}
                    renderMode={renderMode}
                    selectedComponentId={selectedComponentId}
                    onSelectComponent={(id) => {
                      setSelectedComponentId(id);
                      setIsAutoPulsing(false);
                    }}
                  />
                </Canvas>
              </Suspense>

              {/* Dica de Interação 360 */}
              <div className="exploded-studio__canvas-hint" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span>Arraste para girar em 360° · Clique nas peças</span>
              </div>
            </div>

            {/* Barra de Controle de Separação / Slider Explodido */}
            <div className="exploded-studio__bottom-bar">
              <div className="exploded-studio__slider-row">
                <span className="exploded-studio__slider-label">Desacoplamento:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedProgress}
                  onChange={(e) => {
                    setExplodedProgress(parseFloat(e.target.value));
                    setIsAutoPulsing(false);
                  }}
                  className="exploded-studio__slider"
                  aria-label="Controle de desacoplamento da visão explodida"
                />
                <span className="exploded-studio__slider-val">
                  {Math.round(explodedProgress * 100)}%
                </span>
              </div>

              <div className="exploded-studio__presets-row">
                <button
                  type="button"
                  className={`exploded-studio__preset-btn ${
                    explodedProgress === 0 && !isAutoPulsing ? "is-active" : ""
                  }`}
                  onClick={() => {
                    setExplodedProgress(0);
                    setIsAutoPulsing(false);
                  }}
                >
                  0% Montado
                </button>
                <button
                  type="button"
                  className={`exploded-studio__preset-btn ${
                    explodedProgress > 0.4 && explodedProgress < 0.7 && !isAutoPulsing
                      ? "is-active"
                      : ""
                  }`}
                  onClick={() => {
                    setExplodedProgress(0.55);
                    setIsAutoPulsing(false);
                  }}
                >
                  55% Óptica
                </button>
                <button
                  type="button"
                  className={`exploded-studio__preset-btn ${
                    explodedProgress >= 0.95 && !isAutoPulsing ? "is-active" : ""
                  }`}
                  onClick={() => {
                    setExplodedProgress(1.0);
                    setIsAutoPulsing(false);
                  }}
                >
                  100% Total
                </button>
                <button
                  type="button"
                  className={`exploded-studio__preset-btn ${
                    isAutoPulsing ? "is-active" : ""
                  }`}
                  onClick={() => setIsAutoPulsing((prev) => !prev)}
                >
                  {isAutoPulsing ? "⏸ Parar Pulso" : "▶ Pulso Automático"}
                </button>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Painel de Engenharia de Componentes */}
          <div className="exploded-studio__info-panel">
            <div className="exploded-studio__spec-card">
              <div className="exploded-studio__spec-head">
                <span className="exploded-studio__spec-cat">{activeSpec.category}</span>
                <span className="exploded-studio__spec-badge">{activeSpec.mass}</span>
              </div>

              <h3 className="exploded-studio__spec-title">{activeSpec.name}</h3>

              <div className="exploded-studio__material-box">
                <span className="exploded-studio__mat-label">Composição de Material</span>
                <span className="exploded-studio__mat-val">{activeSpec.material}</span>
              </div>

              <p className="exploded-studio__spec-desc">{activeSpec.description}</p>

              <div className="exploded-studio__highlight-box">
                <div className="exploded-studio__highlight-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 12 2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <div className="exploded-studio__highlight-text">
                  <span className="exploded-studio__hl-title">Destaque de Engenharia</span>
                  <span className="exploded-studio__hl-val">{activeSpec.techHighlight}</span>
                </div>
              </div>

              {/* Botões de Seleção de Peça Rápida */}
              <div className="exploded-studio__parts-picker">
                <span className="exploded-studio__parts-title">Selecionar Componente:</span>
                <div className="exploded-studio__parts-grid">
                  {Object.values(COMPONENT_SPECS).map((spec) => {
                    const isSelected = spec.id === selectedComponentId;
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        className={`exploded-studio__part-btn ${
                          isSelected ? "exploded-studio__part-btn--active" : ""
                        }`}
                        onClick={() => {
                          setSelectedComponentId(spec.id);
                          setIsAutoPulsing(false);
                          if (explodedProgress < 0.3) {
                            setExplodedProgress(0.65);
                          }
                        }}
                      >
                        {spec.name.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="exploded-studio__actions">
                <Button
                  variant="primary"
                  onClick={() => handleTryOnRedirect(selectedId)}
                  className="exploded-studio__btn-try"
                >
                  Provar este Modelo no Seu Rosto <span aria-hidden="true">↑</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
