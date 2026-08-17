# 📚 Documentação Técnica — VOID Spatial Optics

Bem-vindo à documentação oficial do projeto **VOID Spatial Optics** (Prova Virtual 3D Facial em Tempo Real no Navegador).

---

## 🧭 Como Navegar

Toda a documentação viva do projeto está organizada na pasta [`docs/vault/`](vault/Home.md), estruturada como um **Vault do Obsidian** com suporte completo a *wikilinks*, diagramas Mermaid e notação matemática em LaTeX.

### 1. Visualização via Obsidian (Recomendado)
1. Abra o aplicativo **Obsidian**.
2. Clique em **Open folder as vault** (Abrir pasta como cofre).
3. Selecione o diretório `docs/vault`.
4. Inicie a navegação pelo arquivo [`Home.md`](vault/Home.md).

### 2. Visualização Direta no Navegador / GitHub / VS Code
Você pode navegar diretamente pelos arquivos markdown do repositório:

| Seção | Principais Documentos |
|---|---|
| **🏠 Ponto Central** | [`docs/vault/Home.md`](vault/Home.md) — Índice geral e mapa de tópicos |
| **🏗️ Arquitetura de Sistema** | [`docs/vault/02-Arquitetura/02-Arquitetura.md`](vault/02-Arquitetura/02-Arquitetura.md)<br/>[`docs/vault/02-Arquitetura/Fluxo-de-Dados.md`](vault/02-Arquitetura/Fluxo-de-Dados.md)<br/>[`docs/vault/02-Arquitetura/Stack-Tecnologica.md`](vault/02-Arquitetura/Stack-Tecnologica.md) |
| **🎨 Design & Acessibilidade** | [`docs/vault/04-Design-e-UX/Identidade-Visual.md`](vault/04-Design-e-UX/Identidade-Visual.md)<br/>[`docs/vault/04-Design-e-UX/Acessibilidade-e-Conforto-VR.md`](vault/04-Design-e-UX/Acessibilidade-e-Conforto-VR.md) |
| **👁️ Visão Computacional & 3D** | [`docs/vault/05-VR-e-3D/Como-Funciona-o-Tracking.md`](vault/05-VR-e-3D/Como-Funciona-o-Tracking.md)<br/>[`docs/vault/05-VR-e-3D/Pipeline-de-Assets-3D.md`](vault/05-VR-e-3D/Pipeline-de-Assets-3D.md)<br/>[`docs/vault/05-VR-e-3D/Suporte-de-Dispositivos.md`](vault/05-VR-e-3D/Suporte-de-Dispositivos.md) |
| **⚡ Performance & Gargalos** | [`docs/vault/05-VR-e-3D/Orcamento-de-Performance.md`](vault/05-VR-e-3D/Orcamento-de-Performance.md) — Diagnóstico detalhado e roadmap de otimizações (Web Workers, KTX2, DPR) |
| **🔒 Privacidade & LGPD** | [`docs/vault/06-Analytics-e-Tracking/LGPD-e-Consentimento.md`](vault/06-Analytics-e-Tracking/LGPD-e-Consentimento.md) |
| **📐 Decisões Registradas (ADRs)**| [`docs/vault/07-Decisoes/ADR-0003-Feature-Try-On-Facial.md`](vault/07-Decisoes/ADR-0003-Feature-Try-On-Facial.md) |

---

## 💡 Destaques da Documentação

- **Diagramas Mermaid Abrangentes**: Fluxogramas de topologia, sequências de render loop e máquinas de estado de permissão de câmera.
- **Formulação Matemática Exata**: Equações de SLERP em quaternions, LERP vetorial e compensação trigonométrica de FOV vertical.
- **Diagnóstico Técnico de Performance**: Identificação de gargalos em GPU/CPU e propostas arquiteturais detalhadas para offloading em Web Workers e compressão KTX2.
