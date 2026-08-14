| #   | Task                            | Agente      | Status | Branch |
| --- | ------------------------------- | ----------- | ------ | ------ |
| 1   | Scaffold Vite+TS+R3F (ADR-0002) | opencode    | todo   | -      |
| 2   | Componente Hero + Portal 3D     | antigravity | todo   | -      |
| 3   | Script pipeline glTF-Transform  | opencode    | todo   | -      |

## Detalhes

### Task 1 — Scaffold Vite+TS+R3F (ADR-0002)

Base técnica: [ADR-0002](docs/vault/07-Decisoes/ADR-0002-Stack-Base.md) +
[Estrutura de Pastas](docs/vault/02-Arquitetura/Estrutura-de-Pastas.md).

Requisitos não negociáveis:

- **Todo código-fonte da aplicação em `/src`** — nada solto na raiz além de config
  (`package.json`, `vite.config.ts`, `tsconfig*.json`, `tailwind.config.*`, etc.).
- **`index.html` na raiz** apontando para `/src/main.tsx` (padrão Vite) — não duplicar HTML.
- **`npm run start` sobe tudo com um único comando** — hoje isso é só o dev server
  do Vite (`vite`, servindo `/src`). Se no futuro entrar um processo companheiro
  (ex.: Umami local), `start` passa a orquestrar via `concurrently`; por ora o
  mínimo já cobre o requisito.
- **Migrar o design existente** (`index.html`, `assets/css/style.css`,
  `assets/js/main.js` atuais) para dentro de `/src`, respeitando
  `sections/` / `scene/` / `components/` — não descartar o visual atual.
