import { useEffect } from "react";
import Button from "./Button";

export default function Nav() {
  useEffect(() => {
    const nav = document.getElementById("nav");
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="nav" id="nav">
      <div className="nav__inner">
        <a href="#top" className="nav__logo" aria-label="VOID — início">
          <span className="nav__logo-ring" aria-hidden="true" />
          VOID
        </a>
        <nav className="nav__links" aria-label="Navegação principal">
          <a href="#experiencia">Experiência</a>
          <a href="#specs">Specs</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#acesso">Acesso</a>
        </nav>
        <Button href="#acesso" variant="ghost-sm">
          Entrar
        </Button>
      </div>
    </header>
  );
}
