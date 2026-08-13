---
title: 08 - Operações
tags:
  - moc
  - operacoes
criado: 2026-08-12
atualizado: 2026-08-12
---

# 🚀 Operações

Build, deploy, ambientes e o que fazer quando o site cai.

## Notas desta área

| Nota | Assunto |
| --- | --- |
| [[Deploy-e-Ambientes]] | Hospedagem open source, CI/CD, ambientes, monitoramento, runbook |

```mermaid
flowchart LR
    PR[Pull Request] --> CI["GitHub Actions (lint+build+testes)"]
    CI --> Prev[Preview deploy]
    Prev --> Merge[Merge em main]
    Merge --> Prod[Deploy de produção]
    Prod --> Mon[Uptime Kuma / GlitchTip]
    Mon -->|incidente| RB[Rollback]
```

## Princípios

1. **`main` sempre deployável** — regra já registrada em [[03-Desenvolvimento]].
2. **Deploy é um comando, não um ritual.** Se exige mais de um passo manual, automatize.
3. **Preferir self-host open source quando o volume compensa**; usar um serviço gerido
   quando o projeto é pequeno demais para justificar operar infraestrutura própria.
4. **Todo runbook é testado por alguém que não escreveu o código.**

⬅ [[Home]]
