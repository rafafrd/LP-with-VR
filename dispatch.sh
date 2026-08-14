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

case "$AGENT" in
  antigravity)
    agy -p "$CONTEXT" \
        --dangerously-skip-permissions \
        --output-format json \
        --add-dir "$WT"
    ;;
  opencode)
    (cd "$WT" && opencode run --model openrouter/anthropic/claude-sonnet-5 "$CONTEXT")
    ;;
  *)
    echo "agente desconhecido: $AGENT" >&2
    exit 1
    ;;
esac

cd "$WT"
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "task ${TASK_ID}: ${PROMPT:0:60}"
  echo "commit criado em $BRANCH — revise com: git -C $WT diff dev"
else
  echo "nenhuma mudança gerada — revise a saída do agente acima"
fi