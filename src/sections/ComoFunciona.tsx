import Reveal from "../components/Reveal";

export default function ComoFunciona() {
  return (
    <section className="how" id="como-funciona">
      <Reveal>
        <p className="eyebrow">COMO FUNCIONA</p>
      </Reveal>
      <div className="how__steps">
        <Reveal className="how__step">
          <span className="how__num">01</span>
          <p>Alguém clica no link.</p>
        </Reveal>
        <Reveal className="how__step">
          <span className="how__num">02</span>
          <p>O navegador decide: tem headset? Manda pro VR. Não tem? Manda pro 3D.</p>
        </Reveal>
        <Reveal className="how__step">
          <span className="how__num">03</span>
          <p>
            A pessoa <em>sente</em> o produto — não só lê sobre ele.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
