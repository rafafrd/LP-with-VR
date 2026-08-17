export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__container">
        {/* Banner de Aviso de Estudo & Inspiração */}
        <div className="footer__study-disclaimer" role="note" aria-label="Aviso sobre propósito do projeto">
          <div className="footer__disclaimer-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div className="footer__disclaimer-content">
            <span className="footer__disclaimer-title">
              PROJETO CONCEITUAL · FINS DE ESTUDO & TREINAMENTO
            </span>
            <p className="footer__disclaimer-text">
              Este site é um projeto experimental desenvolvido exclusivamente para <strong>estudo, treino e exploração técnica</strong> de visão computacional em tempo real (Three.js/R3F e MediaPipe) e animações web avançadas.
              <strong> Não é um produto comercial e não está à venda.</strong> Possui referências e inspirações em linguagens de design da <em>Apple</em> e do <em>Shopify Editions</em>.
            </p>
          </div>
        </div>

        <div className="footer__top">
          <div className="footer__brand-col">
            <a href="#top" className="footer__logo" aria-label="VOID Spatial Optics — Início">
              <span className="footer__logo-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="3.5" fill="#0071e3" />
                </svg>
              </span>
              <span className="footer__logo-text">VOID</span>
              <span className="footer__logo-badge">STUDY LAB</span>
            </a>
            <p className="footer__tagline">
              Engenharia óptica espacial no seu navegador. Processamento 100% local,
              sem envio de dados para a nuvem.
            </p>
            <div className="footer__security-badge">
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-.5V4.5A3.5 3.5 0 0 0 8 1Zm2 5H6V4.5a2 2 0 1 1 4 0V6Z" />
              </svg>
              <span>Privacidade Garantida · LGPD & GDPR Compliant</span>
            </div>
          </div>

          <div className="footer__nav-cols">
            <div className="footer__col">
              <h4 className="footer__col-title">Experiência</h4>
              <ul className="footer__list">
                <li><a href="#hero">Try-On em Tempo Real</a></li>
                <li><a href="#showcase">Coleção Urbana 2026</a></li>
                <li><a href="#como-funciona">Como Funciona</a></li>
                <li><a href="#engenharia">Motor Neural WASM</a></li>
                <li><a href="#specs">Tabela Comparativa</a></li>
              </ul>
            </div>

            <div className="footer__col">
              <h4 className="footer__col-title">Modelos</h4>
              <ul className="footer__list">
                <li><a href="#showcase">Titanium Minimal</a></li>
                <li><a href="#showcase">Metropolis Hex</a></li>
                <li><a href="#showcase">Spatial Studio Visor</a></li>
                <li><a href="#specs">Especificações de Materiais</a></li>
              </ul>
            </div>

            <div className="footer__col">
              <h4 className="footer__col-title">Documentação</h4>
              <ul className="footer__list">
                <li><a href="docs/vault/Home.md">Vault de Arquitetura</a></li>
                <li><a href="docs/vault/07-Decisoes/ADR-0003-Feature-Try-On-Facial.md">ADR-0003 (Pivô Facial)</a></li>
                <li><a href="docs/vault/01-Visao-Geral/Escopo.md">Escopo & Requisitos</a></li>
                <li><a href="README.md">Guia de Engenharia</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__copyright">
            <span>© 2026 VOID Spatial Optics · Protótipo Educacional.</span>
            <span>Projeto sem fins lucrativos ou de venda · Desenvolvido para aprendizado técnico e design.</span>
          </div>

          <div className="footer__bottom-links">
            <a href="#top" className="footer__back-to-top">
              Voltar ao topo ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
