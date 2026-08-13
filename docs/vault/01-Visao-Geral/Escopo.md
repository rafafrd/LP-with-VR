---
title: Escopo
tags:
  - visao-geral
  - escopo
criado: 2026-08-12
atualizado: 2026-08-12
status: rascunho
---

# Escopo

## Problema

_Que problema a landing page resolve?_

## Objetivo

_O que consideramos sucesso? (ex.: taxa de conversão, tempo na página, leads)_

## Dentro do escopo

- [ ] Landing page responsiva
- [ ] Experiência 3D / VR incorporada
- [ ] Fallback para dispositivos sem suporte a WebXR
- [ ] 

## Fora do escopo

- 

## Riscos conhecidos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Performance em mobile com cena 3D | Alto | Níveis de detalhe + lazy loading |
|  |  |  |

## Fluxo de decisão de escopo

```mermaid
flowchart TD
    F[Funcionalidade proposta] --> Q{Serve ao objetivo<br/>de conversão?}
    Q -- não --> OUT[Fora do escopo]
    Q -- sim --> Q2{Cara de reverter<br/>ou bloqueia o MVP?}
    Q2 -- sim --> IN[Dentro do escopo]
    Q2 -- não --> BL[Backlog / v2]
```

## Relacionados

- [[Requisitos]]
- [[Publico-Alvo]]
- [[05-VR-e-3D]]

⬅ [[01-Visao-Geral]]
