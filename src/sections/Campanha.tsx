import Button from "../components/Button";
import InteractiveTiltCard from "../components/InteractiveTiltCard";
import Reveal from "../components/Reveal";
import {
  useModelSelection,
  type GlassesModelId,
} from "../hooks/useModelSelection";

type CampaignPhoto = {
  id: string;
  src: string;
  width: number;
  height: number;
  aspectRatio: string;
  alt: string;
  title: string;
  category: string;
  modelId: GlassesModelId;
  modelName: string;
  tag: string;
  lensSpec: string;
  span?: "tall" | "wide" | "standard";
};

const CAMPAIGN_PHOTOS: CampaignPhoto[] = [
  {
    id: "noir-silhouette",
    src: "/imgs/noir-silhouette.jpg",
    width: 736,
    height: 1318,
    aspectRatio: "736 / 1318",
    alt: "Modelo feminina em look preto total com óculos de sol retangulares escuros, em pose dramática de estúdio de ângulo elevado",
    title: "Silhouette Noir",
    category: "LOOK 01 · MONOCHROME MATRIX",
    modelId: "acid",
    modelName: "Titanium Minimal",
    tag: "High-Contrast Studio",
    lensSpec: "Lentes Polarizadas AR Black",
    span: "tall",
  },
  {
    id: "lilas-translucent",
    src: "/imgs/lilas-translucent.jpg",
    width: 736,
    height: 1307,
    aspectRatio: "736 / 1307",
    alt: "Modelo feminina em look lilás com óculos retangulares e lentes translúcidas roxas, olhando por cima da armação",
    title: "Lilas Gradient",
    category: "LOOK 02 · TRANSLUCÊNCIA & LUZ",
    modelId: "violet",
    modelName: "Metropolis Hex",
    tag: "Translucent Hue",
    lensSpec: "Filtro Blue Light Violet UV400",
    span: "tall",
  },
  {
    id: "emerald-knit",
    src: "/imgs/emerald-knit.jpg",
    width: 736,
    height: 1104,
    aspectRatio: "736 / 1104",
    alt: "Modelo masculino com cabelo cacheado e suéter verde felpudo ajustando óculos retangulares verdes",
    title: "Emerald Texture",
    category: "LOOK 03 · ESTÉTICA TÁTIL",
    modelId: "acid",
    modelName: "Titanium Minimal",
    tag: "Urban Tactile",
    lensSpec: "Polarizado Esmeralda AR",
    span: "standard",
  },
  {
    id: "amber-tortoise",
    src: "/imgs/amber-tortoise.jpg",
    width: 940,
    height: 940,
    aspectRatio: "1 / 1",
    alt: "Modelo feminina com franja e óculos quadrados grandes em padrão tartaruga e âmbar, foto grande-angular com calça azul",
    title: "Amber Tortoise",
    category: "LOOK 04 · GRANDE-ANGULAR",
    modelId: "magenta",
    modelName: "Spatial Studio Visor",
    tag: "Wide Perspective",
    lensSpec: "Gradiente Âmbar Foto-reativo",
    span: "wide",
  },
  {
    id: "vitreous-studio",
    src: "/imgs/vitreous-studio.jpg",
    width: 828,
    height: 1025,
    aspectRatio: "828 / 1025",
    alt: "Modelo feminina com luva transparente próxima ao rosto usando óculos quadrados pretos em perspectiva grande-angular",
    title: "Vitreous Glow",
    category: "LOOK 05 · EXPERIMENTAL",
    modelId: "magenta",
    modelName: "Spatial Studio Visor",
    tag: "Studio Avant-Garde",
    lensSpec: "Compósito Escuro Monolítico",
    span: "standard",
  },
  {
    id: "petroleum-slate",
    src: "/imgs/petroleum-slate.jpg",
    width: 736,
    height: 1104,
    aspectRatio: "736 / 1104",
    alt: "Modelo masculino de cabelo cacheado curto vestindo jaqueta azul-petróleo e camiseta branca com óculos retangulares pretos",
    title: "Petroleum Minimal",
    category: "LOOK 06 · CONTEMPORÂNEO",
    modelId: "violet",
    modelName: "Metropolis Hex",
    tag: "Metropolitan Line",
    lensSpec: "Polarizado Slate Dark HD",
    span: "standard",
  },
];

export default function Campanha() {
  const { selectModel } = useModelSelection();

  const handleTryOnModel = (modelId: GlassesModelId) => {
    selectModel(modelId);
    const heroEl = document.getElementById("hero");
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="campaign" id="campanha">
      <div className="campaign__container">
        {/* Cabeçalho Editorial */}
        <div className="campaign__header">
          <Reveal variant="fade-up">
            <span className="eyebrow eyebrow--center">LOOKBOOK & CAMPANHA</span>
          </Reveal>
          <Reveal variant="fade-up" delayMs={100}>
            <h2 className="campaign__title">
              Editorial Inverno 2026.
              <br />
              <span className="text-secondary">A estética do olhar metropolitano.</span>
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delayMs={200}>
            <p className="campaign__sub">
              Registros fotográficos da coleção VOID em estúdio e alta definição. Formas puras,
              materiais de precisão aeroespacial e a atitude de quem vive o pulso das grandes cidades.
            </p>
          </Reveal>
        </div>

        {/* Grade Editorial em Formato Bento / Revista de Moda */}
        <div className="campaign__grid">
          {CAMPAIGN_PHOTOS.map((photo, index) => (
            <Reveal
              key={photo.id}
              variant="fade-up"
              delayMs={index * 100}
              className={`campaign__item campaign__item--${photo.span || "standard"}`}
            >
              <InteractiveTiltCard maxTiltDeg={5} className="campaign__card-tilt">
                <div className="campaign__card">
                  {/* Container da Imagem com Aspect Ratio Travado contra CLS */}
                  <div
                    className="campaign__media-wrap"
                    style={{ aspectRatio: photo.aspectRatio }}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      decoding="async"
                      className="campaign__image"
                    />
                    <div className="campaign__overlay-gradient" aria-hidden="true" />
                  </div>

                  {/* Badges Flutuantes Superiores */}
                  <div className="campaign__top-badges">
                    <span className="campaign__tag">{photo.tag}</span>
                    <span className="campaign__model-badge">{photo.modelName}</span>
                  </div>

                  {/* Rodapé Informativo do Card Editorial */}
                  <div className="campaign__info">
                    <span className="campaign__category">{photo.category}</span>
                    <h3 className="campaign__photo-title">{photo.title}</h3>
                    <p className="campaign__spec-pill">{photo.lensSpec}</p>

                    <button
                      type="button"
                      className="campaign__try-btn"
                      onClick={() => handleTryOnModel(photo.modelId)}
                      aria-label={`Experimentar o modelo ${photo.modelName} no rosto`}
                    >
                      <span>Experimentar no Rosto</span>
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="campaign__btn-icon"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.707a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1-1.414 1.414L11 5.414V17a1 1 0 1 1-2 0V5.414L6.707 7.707a1 1 0 0 1-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </InteractiveTiltCard>
            </Reveal>
          ))}
        </div>

        {/* Banner de Fechamento Editorial */}
        <Reveal variant="fade-up" delayMs={300} className="campaign__banner-wrap">
          <div className="campaign__banner">
            <div className="campaign__banner-content">
              <span className="campaign__banner-eyebrow">ENSAIO DE ESTÚDIO · EDITIONS 2026</span>
              <h3 className="campaign__banner-title">
                Veja qualquer uma dessas armações diretamente no seu rosto.
              </h3>
              <p className="campaign__banner-desc">
                Nenhum download necessário. Nosso provador virtual WebGL mapeia 468 pontos em tempo real
                com iluminação realista.
              </p>
            </div>
            <div className="campaign__banner-action">
              <Button href="#hero" variant="primary">
                Abrir Provador Virtual <span aria-hidden="true">↑</span>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
