import { useState, type FormEvent } from "react";
import Reveal from "../components/Reveal";
import { track } from "../lib/analytics";
import { parseAccessEmail } from "../lib/validation";

const DEFAULT_NOTE = "Sem spam. Sem enrolação.";

export default function Cta() {
  const [note, setNote] = useState(DEFAULT_NOTE);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = new FormData(form).get("email");
    const email = typeof raw === "string" ? raw.trim() : "";

    const parsed = parseAccessEmail(email);
    if (!parsed.success) {
      setNote("Digita um e-mail válido pra entrar na lista.");
      setIsSuccess(false);
      track({ action: "access_submit_invalid" });
      return;
    }

    track({ action: "access_submit", label: email });
    setNote("Você está dentro. A gente chama assim que o VOID abrir.");
    setIsSuccess(true);
    form.reset();
    window.setTimeout(() => {
      setNote(DEFAULT_NOTE);
      setIsSuccess(false);
    }, 6000);
  };

  return (
    <section className="cta" id="acesso">
      <Reveal className="cta__inner">
        <p className="eyebrow eyebrow--center">ACESSO ANTECIPADO</p>
        <h2>
          Pronto pra tirar sua
          <br />
          landing page da caixinha?
        </h2>
        <p className="cta__sub">Entra na lista e a gente avisa assim que abrir.</p>

        <form className="cta__form" id="access-form" noValidate onSubmit={handleSubmit}>
          <label htmlFor="email" className="sr-only">
            Seu e-mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="seu@email.com"
            required
            autoComplete="email"
          />
          <button type="submit" className="btn btn--primary">
            Quero acesso
          </button>
        </form>
        <p className={`cta__note${isSuccess ? " is-success" : ""}`} id="access-note">
          {note}
        </p>
      </Reveal>
    </section>
  );
}
