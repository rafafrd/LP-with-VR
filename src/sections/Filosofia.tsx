import Portal from "../components/Portal";
import Reveal from "../components/Reveal";

export default function Filosofia() {
  return (
    <section className="philosophy" id="filosofia">
      <div className="philosophy__inner">
        <Reveal>
          <p className="eyebrow eyebrow--center">FILOSOFIA</p>
        </Reveal>
        <Reveal>
          <p className="philosophy__statement">
            A maioria das pessoas <span className="hl">não</span> vai vestir um
            headset. Por isso o VOID nasce pra funcionar <span className="hl">sem</span>{" "}
            um — e fica ainda melhor pra quem tem.
          </p>
        </Reveal>
        <Reveal>
          <Portal />
        </Reveal>
      </div>
    </section>
  );
}
