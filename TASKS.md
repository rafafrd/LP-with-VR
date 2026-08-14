| #   | Task                            | Agente      | Status | Branch       |
| --- | ------------------------------- | ----------- | ------ | ------------ |
| 1   | Scaffold Vite+TS+R3F (ADR-0002) | opencode    | done   | feat/task-1 (merged em dev) |
| 2   | Componente Hero + Portal 3D     | antigravity | todo   | -            |
| 3   | Script pipeline glTF-Transform  | opencode    | todo   | -            |

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

**Status: done.** Refeita do zero em `../void-task-1` contra `dev` (a primeira
tentativa nunca rodou de verdade — nenhum worktree/branch existia; um
`frontend/public/img` órfão apareceu direto em `main`, removido). Achados e
correções no processo, não no código da task:

- `dispatch.sh` criava o worktree a partir do HEAD implícito (`main`) em vez
  de `dev` — corrigido para `git worktree add ... dev` explícito.
- `dispatch.sh` chamava `opencode run --model anthropic/claude-sonnet-4-6`,
  um slug que não existe em nenhum provider autenticado (`opencode providers
  list` só tem OpenRouter e GitHub Copilot) — todo run falhava com
  "Unexpected server error".
- Trocado para `openrouter/anthropic/claude-sonnet-5`: rodou, mas a conta
  OpenRouter não tem crédito suficiente ("requested up to 32000 tokens, but
  can only afford 4000") — **`opencode` não é de fato "sem limite de crédito
  relevante" quando o modelo passa por OpenRouter**, ao contrário do que
  CLAUDE.md assumia.
- Trocado para `opencode/big-pickle` (catálogo free do próprio opencode, sem
  essa trava) — completou o scaffold inteiro numa rodada: deps, configs,
  migração pixel-equivalente do design, `npm run build` e smoke test do dev
  server, tudo validado pelo próprio agente antes de commitar.

Revisão manual: diff de 37 arquivos ok, estrutura bate com
Estrutura-de-Pastas.md, fronteira `scene/`↛`sections/` respeitada. Corrigi
manualmente 4 atributos SVG kebab-case→camelCase em `Beneficios.tsx`
(`stroke-width` etc. — warning de console, sem impacto visual). Validado por
mim: `npm run build` e `npm run start` no worktree, teste visual via
Claude-in-Chrome (desktop 1440px + mobile ~500px de viewport): console sem
erros, CTA acima da dobra sem depender do canvas (RF-01), sem overflow
horizontal em mobile, form de acesso funcional. Nav sem hambúrguer em mobile
é comportamento herdado do design original (confirmado no CSS antigo em
`dev`), não regressão da migração. Merge `feat/task-1 → dev` sem conflitos.
