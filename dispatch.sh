#!/usr/bin/env bash
set -euo pipefail

TASK_ID="${1:?uso: dispatch.sh <task_id> <antigravity|opencode> \"<prompt>\"}"
AGENT="${2:?agente obrigatório: antigravity ou opencode}"
PROMPT="${3:?prompt obrigatório}"

BRANCH="feat/task-${TASK_ID}"
WT="../void-task-${TASK_ID}"

if [ -d "$WT" ]; then
  echo "worktree $WT já existe — retomando"
else
  git worktree add "$WT" -b "$BRANCH" dev
fi

CONTEXT="Contexto obrigatório: leia docs/vault/ antes de editar.
Respeite as fronteiras de docs/vault/02-Arquitetura/Estrutura-de-Pastas.md.
Task: ${PROMPT}"

AGENT_EXIT=0
case "$AGENT" in
  antigravity)
    (cd "$WT" && agy -p "$CONTEXT" \
        --dangerously-skip-permissions \
        --output-format json \
        --add-dir "$WT") || AGENT_EXIT=$?
    ;;
  opencode)
    (cd "$WT" && opencode run --model opencode/big-pickle "$CONTEXT") || AGENT_EXIT=$?
    ;;
  *)
    echo "agente desconhecido: $AGENT" >&2
    exit 1
    ;;
esac

if [ "$AGENT_EXIT" -ne 0 ]; then
  echo "aviso: processo do agente saiu com código $AGENT_EXIT (ex.: timeout) — checando mesmo assim se ficou trabalho aproveitável no worktree" >&2
fi

cd "$WT"
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "task ${TASK_ID}: ${PROMPT:0:60}"
  echo "commit criado em $BRANCH — revise com: git -C $WT diff dev"
else
  echo "nenhuma mudança gerada — revise a saída do agente acima"
fi

if [ "$AGENT_EXIT" -ne 0 ]; then
  echo "dispatch concluído com aviso: agente saiu com código $AGENT_EXIT — revise o commit acima com atenção antes de confiar nele como completo" >&2
  exit "$AGENT_EXIT"
fi