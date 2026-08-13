# LP with VR

Landing page com uma experiência imersiva em 3D/VR rodando direto no navegador
(WebXR), com fallback em 3D convencional para quem acessa sem headset.

> Uma landing page que usa 3D/VR no navegador para explicar o produto melhor do que
> texto e imagem conseguiriam — e converter mais por isso.

## Status

🟡 **Em concepção.** O repositório ainda não tem scaffold: só existe `package.json`
(sem dependências) e a documentação do projeto. Stack, escopo e requisitos estão
propostos, mas não fechados — ver [`docs/vault`](docs/vault/Home.md).

## Por que 3D/VR

A maioria de quem chega à LP **não** vai entrar em VR de fato — por isso a versão sem
headset é o produto principal, e o VR é o diferencial para uma fatia menor e mais
engajada do público. Esse princípio de *progressive enhancement* orienta toda a
arquitetura: o 3D é um componente da landing page, não o contrário.

## Stack proposta

| Camada | Escolha | Licença |
| --- | --- | --- |
| Linguagem | TypeScript | Apache-2.0 |
| Build/dev | Vite | MIT |
| UI | React | MIT |
| Render 3D | Three.js | MIT |
| Cola 3D ↔ React | @react-three/fiber | MIT |
| Helpers 3D | @react-three/drei | MIT |
| XR | @react-three/xr | MIT |
| Estilo | Tailwind CSS | MIT |
| Formulário | React Hook Form + Zod | MIT |
| Analytics | Umami (self-host) | MIT |
| Testes | Vitest + Playwright | MIT / Apache-2.0 |

Todas as dependências de produção são open source com licença permissiva — critério
adotado desde a concepção do projeto. Decisão completa, alternativas consideradas e
justificativa em [ADR-0002 — Stack Base](docs/vault/07-Decisoes/ADR-0002-Stack-Base.md).

## Estrutura planejada

Ainda não existe no repositório — será criada junto com o scaffold. Detalhes e regras
em [Estrutura de Pastas](docs/vault/02-Arquitetura/Estrutura-de-Pastas.md).

```
LP-with-VR/
├── docs/vault/      # documentação do projeto (Obsidian)
├── public/          # modelos .glb, texturas .ktx2 já otimizados
├── src/
│   ├── sections/    # dobras da LP: Hero, Benefícios, CTA, FAQ
│   ├── scene/       # tudo que é 3D (não conhece o layout da página)
│   ├── components/  # UI 2D reutilizável
│   ├── hooks/       # useXRSupport, usePerfProfile, etc.
│   └── lib/         # analytics.ts, validation.ts
└── tests/
```

## Como rodar

Setup ainda não aplicável — o scaffold do projeto não foi criado. O fluxo previsto,
detalhado em [Setup do Ambiente](docs/vault/03-Desenvolvimento/Setup-do-Ambiente.md):

```bash
git clone <url> LP-with-VR
cd LP-with-VR
npm install
npm run dev
```

WebXR exige contexto seguro (HTTPS), inclusive para testar em headset na rede local —
ver o mesmo documento para o setup de certificado.

## Documentação

Toda a documentação viva do projeto — visão geral, arquitetura, design/UX, VR/3D,
analytics, decisões (ADRs) e operações — vive em [`docs/vault`](docs/vault/Home.md), um
vault do Obsidian. Comece por lá.

| Se você quer… | Leia |
| --- | --- |
| Entender o que é o produto | [Escopo](docs/vault/01-Visao-Geral/Escopo.md) |
| Saber qual stack usar e por quê | [Stack Tecnológica](docs/vault/02-Arquitetura/Stack-Tecnologica.md) |
| Rodar o projeto localmente | [Setup do Ambiente](docs/vault/03-Desenvolvimento/Setup-do-Ambiente.md) |
| Ver as decisões técnicas registradas | [07-Decisões](docs/vault/07-Decisoes/07-Decisoes.md) |

## Licença

Ainda não definida.
