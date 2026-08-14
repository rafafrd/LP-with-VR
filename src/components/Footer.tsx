export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <a href="#top" className="nav__logo" aria-label="VOID — início">
            <span className="nav__logo-ring" aria-hidden="true" />
            VOID
          </a>
          <p>Feito no underground, publicado no mainstream.</p>
        </div>
        <div className="footer__cols">
          <div>
            <h4>Produto</h4>
            <a href="#experiencia">Experiência</a>
            <a href="#specs">Specs</a>
            <a href="#como-funciona">Como funciona</a>
          </div>
          <div>
            <h4>Projeto</h4>
            <a href="docs/vault/Home.md">Documentação</a>
            <a href="docs/vault/07-Decisoes/07-Decisoes.md">Decisões (ADRs)</a>
            <a href="README.md">README</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#">Privacidade</a>
            <a href="#">Termos</a>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© 2026 VOID.</span>
        <span>
          Protótipo de landing page — stack final em <code>docs/vault</code>.
        </span>
      </div>
    </footer>
  );
}
