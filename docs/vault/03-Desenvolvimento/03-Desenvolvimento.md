---
title: 03 - Desenvolvimento
tags:
  - moc
  - desenvolvimento
criado: 2026-08-12
atualizado: 2026-08-12
---

# 🛠 Desenvolvimento

Como trabalhar neste repositório.

## Notas desta área

| Nota | Assunto |
| --- | --- |
| [[Setup-do-Ambiente]] | Rodar localmente, inclusive testando no headset |
| [[Convencoes-de-Codigo]] | Estilo, commits, branches, revisão |
| [[Arquivos-de-Engenharia]] | Quais documentos o repositório mantém e por quê |

## Fluxo de trabalho

```mermaid
flowchart LR
    A[Issue / ideia] --> B{Decisão técnica<br/>relevante?}
    B -- sim --> C[ADR em 07-Decisoes]
    B -- não --> D[Branch feat/*]
    C --> D
    D --> E[PR: lint + build + testes]
    E --> F[Revisão]
    F --> G[Merge em main]
    G --> H[Deploy]
```

## Regras de ouro

1. **`main` sempre deployável.**
2. **Decisão técnica sem ADR não existe** — daqui a três meses ninguém lembra do porquê.
3. **Mudou a cena 3D? Rode o checklist de [[Orcamento-de-Performance]]** antes do PR.
4. **Documentação viaja junto com o código**, no mesmo PR.

⬅ [[Home]]
