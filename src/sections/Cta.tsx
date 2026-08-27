import { useState, type FormEvent } from "react";
import Button from "../components/Button";
import Reveal from "../components/Reveal";
import { track } from "../lib/analytics";
import { parseAccessEmail } from "../lib/validation";

const DEFAULT_NOTE = "Privacidade garantida. Zero spam. Desinscreva-se quando quiser.";

export default function Cta() {
  const [note, setNote] = useState(DEFAULT_NOTE);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = new FormData(form).get("email");
    const email = typeof raw === "string" ? raw.trim() : "";

    const parsed = parseAccessEmail(email);
    if (!parsed.success) {
      setNote("Por favor, insira um endereço de e-mail válido.");
      setIsSuccess(false);
      setIsError(true);
      track({ action: "access_submit_invalid" });
      return;
    }

    track({ action: "access_submit", label: email });
    setNote("Convite confirmado. Você receberá os lançamentos da Coleção Urbana em primeira mão.");
    setIsSuccess(true);
    setIsError(false);
    form.reset();

    window.setTimeout(() => {
      setNote(DEFAULT_NOTE);
      setIsSuccess(false);
      setIsError(false);
    }, 7000);
  };

  return (
    <section className="cta" id="acesso">
      <div className="cta__container">
        <Reveal variant="scale-up" className="cta__card">
          <div className="cta__badge-row">
            <span className="cta__badge">ACESSO ANTECIPADO 2026</span>
          </div>

          <h2 className="cta__title">
            Pronto para transformar sua
            <br />
            experiência de visão espacial?
          </h2>

          <p className="cta__subtitle">
            Cadastre seu e-mail para ter acesso prioritário aos novos lançamentos de armações,
            atualizações do motor neural e edições limitadas da coleção urbana.
          </p>

          <form className="cta__form" id="access-form" noValidate onSubmit={handleSubmit}>
            <div className="cta__input-wrap">
              <label htmlFor="email" className="sr-only">
                Seu e-mail profissional ou pessoal
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="seu.email@exemplo.com"
                required
                autoComplete="email"
                className={`cta__input ${isError ? "cta__input--error" : ""}`}
              />
              <button type="submit" className="cta__submit-btn">
                <span>Quero Acesso</span>
                <svg viewBox="0 0 20 20" fill="currentColor" className="cta__btn-arrow" aria-hidden="true">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>

          <p
            className={`cta__note ${isSuccess ? "cta__note--success" : isError ? "cta__note--error" : ""}`}
            id="access-note"
            aria-live="polite"
          >
            {isSuccess && (
              <span className="cta__note-icon" aria-hidden="true">✓ </span>
            )}
            {note}
          </p>

          <div className="cta__direct-action">
            <span className="cta__direct-label">Ou se preferir:</span>
            <Button href="#hero" variant="ghost-sm">
              Voltar ao Try-On Virtual ↑
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
