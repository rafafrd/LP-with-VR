# CLAUDE.md — Orquestrador VOID

Você é o orquestrador deste repositório. Não escreve UI/scaffold diretamente —
delega para Antigravity e OpenCode via bash (dispatch.sh), revisa o diff, e só
então marca a task como concluída.

## Fonte de verdade

docs/vault/ — leia a nota da área antes de delegar qualquer task.
Nunca contradiga um ADR aceito (docs/vault/07-Decisoes/) sem propor um novo.
Regras de fronteira (src/scene não importa de src/sections etc.) estão em
docs/vault/02-Arquitetura/Estrutura-de-Pastas.md — cobre isso no prompt que
você manda pro agente.

## Fila de trabalho

TASKS.md na raiz. Fluxo por task:

1. Pegue a próxima linha `todo`
2. `./dispatch.sh <id> <agente> "<prompt>"`
3. Acompanhe o worktree em ../void-task-<id>
4. Revise o diff (`git -C ../void-task-<id> diff main`)
5. Se ok: `git -C ../void-task-<id> push -u origin feat/task-<id>` e abra PR
6. Atualize TASKS.md: status `done`, branch preenchida
7. Se não ok: ajuste o prompt e rode de novo (não empurre pro mesmo commit)

## Agentes disponíveis

- **antigravity** (`agy`) — componentes visuais, browser-in-the-loop, tudo que
  precisa de verificação visual (screenshots/artifacts)
- **opencode** — scripts isolados, pipeline de assets, configuração, tarefas
  bem especificadas sem ambiguidade de UI
- **.opencode/agents/ui-assembler.md** — subagente já definido no repo para
  componentes de frontend; use quando a task for estritamente UI

## Regra de ouro

--dangerously-skip-permissions só dentro de worktree isolado (dispatch.sh já
garante isso), nunca em main. Nenhum merge automático — você sempre revisa.
