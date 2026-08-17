import InteractiveTiltCard from "../components/InteractiveTiltCard";
import KineticText from "../components/KineticText";
import Reveal from "../components/Reveal";

export default function Filosofia() {
  return (
    <section className="philosophy" id="filosofia">
      <div className="philosophy__container">
        <Reveal variant="fade-up">
          <span className="eyebrow eyebrow--center">MANIFESTO URBANO</span>
        </Reveal>

        {/* Citação com Revelação Cinética Palavra por Palavra estilo Editions */}
        <div className="philosophy__quote-wrap">
          <KineticText
            as="blockquote"
            className="philosophy__quote"
            text="A melhor tecnologia é aquela que desaparece na rotina da cidade. Sem fios, sem instalações, sem fricção. Você simplesmente abre o link, experimenta e sente."
            highlightWords={["desaparece", "Sem", "sente"]}
          />
        </div>

        <div className="philosophy__pillars">
          <Reveal variant="fade-up" delayMs={100} className="philosophy__pillar-wrap">
            <InteractiveTiltCard maxTiltDeg={7} className="philosophy__pillar-tilt">
              <div className="philosophy__pillar-card">
                <span className="philosophy__pillar-num">01</span>
                <h4 className="philosophy__pillar-title">Pureza Visual</h4>
                <p className="philosophy__pillar-desc">
                  Design limpo, sem elementos supérfluos. A geometria dos óculos fala por si só.
                </p>
              </div>
            </InteractiveTiltCard>
          </Reveal>

          <Reveal variant="fade-up" delayMs={200} className="philosophy__pillar-wrap">
            <InteractiveTiltCard maxTiltDeg={7} className="philosophy__pillar-tilt">
              <div className="philosophy__pillar-card">
                <span className="philosophy__pillar-num">02</span>
                <h4 className="philosophy__pillar-title">Privacidade Inegociável</h4>
                <p className="philosophy__pillar-desc">
                  Sua imagem é sua. Todo o cálculo de visão computacional fica confinado na sua máquina.
                </p>
              </div>
            </InteractiveTiltCard>
          </Reveal>

          <Reveal variant="fade-up" delayMs={300} className="philosophy__pillar-wrap">
            <InteractiveTiltCard maxTiltDeg={7} className="philosophy__pillar-tilt">
              <div className="philosophy__pillar-card">
                <span className="philosophy__pillar-num">03</span>
                <h4 className="philosophy__pillar-title">Fluidez Imediata</h4>
                <p className="philosophy__pillar-desc">
                  Do clique à prova em menos de 1 segundo. Resposta instantânea a 60 quadros por segundo.
                </p>
              </div>
            </InteractiveTiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
