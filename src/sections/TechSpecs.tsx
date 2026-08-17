import Reveal from "../components/Reveal";

type SpecRow = {
  feature: string;
  voidSpatial: string;
  nativeApps: string;
  filters2d: string;
  isHighlight?: boolean;
};

const SPEC_ROWS: SpecRow[] = [
  {
    feature: "Instalação / Download",
    voidSpatial: "Zero (Abre direto no link)",
    nativeApps: "Exige 150MB+ na App Store",
    filters2d: "Preso dentro de app fechado",
    isHighlight: true,
  },
  {
    feature: "Processamento Facial",
    voidSpatial: "100% Local no Navegador (LGPD)",
    nativeApps: "Local ou Nuvem",
    filters2d: "Upload de dados para rede social",
    isHighlight: true,
  },
  {
    feature: "Precisão Geométrica 3D",
    voidSpatial: "Escala Métrica Real (~14cm)",
    nativeApps: "Variável",
    filters2d: "Distorção 2D plana não métrica",
  },
  {
    feature: "Latência de Tracking",
    voidSpatial: "~12ms (WASM + SIMD)",
    nativeApps: "~15ms - 30ms",
    filters2d: "~35ms+",
  },
  {
    feature: "Estabilidade Temporal",
    voidSpatial: "Filtro Cinemático Anti-Jitter",
    nativeApps: "Suavização Básica",
    filters2d: "Perda frequente de pose",
  },
  {
    feature: "Fidelidade de Materiais",
    voidSpatial: "Shaders PBR Físicos (Three.js)",
    nativeApps: "Motor 3D proprietário",
    filters2d: "Efeito 2D sem iluminação real",
  },
];

export default function TechSpecs() {
  return (
    <section className="tech-specs" id="specs">
      <div className="tech-specs__container">
        <div className="tech-specs__head">
          <Reveal variant="fade-up">
            <span className="eyebrow eyebrow--center">ESPECIFICAÇÕES TÉCNICAS</span>
          </Reveal>
          <Reveal variant="fade-up" delayMs={100}>
            <h2 className="tech-specs__title">
              Engenharia comparada.
              <br />
              <span className="text-secondary">O salto evolutivo do Try-On na web.</span>
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delayMs={200}>
            <p className="tech-specs__sub">
              Veja como o VOID Spatial Optics redefine o padrão de fidelidade e privacidade
              frente às soluções convencionais do mercado.
            </p>
          </Reveal>
        </div>

        <Reveal variant="scale-up" delayMs={250} className="tech-specs__table-wrapper">
          <div className="tech-specs__table-card">
            <div className="tech-specs__table-scroll">
              <table className="tech-specs__table">
                <thead>
                  <tr>
                    <th className="tech-specs__th-feature">Critério</th>
                    <th className="tech-specs__th-void">
                      <span className="tech-specs__badge-void">VOID Spatial</span>
                    </th>
                    <th className="tech-specs__th-other">Apps Nativos</th>
                    <th className="tech-specs__th-other">Filtros 2D Comuns</th>
                  </tr>
                </thead>
                <tbody>
                  {SPEC_ROWS.map((row) => (
                    <tr
                      key={row.feature}
                      className={row.isHighlight ? "tech-specs__tr--highlight" : ""}
                    >
                      <td className="tech-specs__td-feature">
                        <span className="tech-specs__feature-name">{row.feature}</span>
                      </td>
                      <td className="tech-specs__td-void">
                        <div className="tech-specs__cell-void">
                          <svg
                            className="tech-specs__check-icon"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{row.voidSpatial}</span>
                        </div>
                      </td>
                      <td className="tech-specs__td-other">{row.nativeApps}</td>
                      <td className="tech-specs__td-other">{row.filters2d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="tech-specs__table-footer">
              <span className="tech-specs__footer-note">
                Dados medidos sob pipeline de testes automatizados com perfil Chrome Desktop e Safari Mobile (2026).
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
