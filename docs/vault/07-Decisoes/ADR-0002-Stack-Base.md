---
title: ADR-0002 — Stack Base
tags:
  - adr
  - stack
criado: 2026-08-12
atualizado: 2026-08-12
status: proposto
data-decisao: 
---

# ADR-0002 — Stack base do projeto

**Status**: 🟡 **Proposto** — aguardando decisão · **Decisor**: Rafael

> Este ADR está aberto de propósito. Ao fechar a escolha, preencha `data-decisao`,
> mude o status para `aceito` e não edite mais o conteúdo.

## Contexto

O repositório tem apenas `package.json` com `"type": "commonjs"` e nenhuma dependência.
O produto é uma **landing page** cuja peça diferenciadora é uma experiência 3D/VR no
navegador. Isso cria uma tensão real: uma LP precisa carregar rápido, indexar bem e
converter; uma experiência WebXR quer megabytes de asset e uma engine parruda.

Restrições assumidas:
- Preferência por **open source com licença permissiva**.
- Equipe de uma pessoa — o custo de manutenção pesa mais que o teto de capacidade.
- Conversão é a métrica primária; o VR serve a ela, não o contrário.

## Decisão proposta

**Vite + TypeScript + React + Three.js (via React Three Fiber) + @react-three/xr**,
com Tailwind CSS na camada 2D e Umami para analytics.

## Alternativas consideradas

| Alternativa | Prós | Contras | Veredito |
| --- | --- | --- | --- |
| **Three.js + R3F** (proposta) | MIT; padrão da web; integra 3D ao estado do React; ecossistema `drei`/`xr` | Você monta o engine em volta; sem editor | ✅ |
| **Babylon.js** | Apache-2.0; WebXR mais completo e testado; muita coisa pronta | Bundle maior; integração com DOM da LP menos natural | Plano B se XR crescer |
| **A-Frame** | MIT; protótipo de VR em minutos | Abstração atrapalha o layout customizado da LP | Só protótipo |
| **PlayCanvas** | Runtime leve; editor visual | Editor **proprietário e hospedado** — fere o critério open source | ❌ |
| **Three.js puro sem React** | Bundle mínimo; menos dependências | Estado e ciclo de vida na mão | Viável se a LP for muito simples |

## Consequências (se aceito)

**Positivas**
- Cena 3D e UI compartilham o mesmo modelo de estado.
- `@react-three/drei` e `@react-three/xr` cobrem loaders, controles e sessão XR.
- Todo o stack é MIT/Apache — sem amarra de licença.

**Negativas**
- React e R3F somam ao bundle; exige *code splitting* agressivo do canvas.
- Se a experiência XR crescer muito, migrar para Babylon depois é caro.
- `"type": "commonjs"` precisa virar `"module"` — mudança pequena, mas obrigatória.

## Como validar antes de aceitar

- [ ] Protótipo de uma dobra com modelo real, medindo peso e FPS
- [ ] Teste no dispositivo alvo com o checklist de [[Orcamento-de-Performance]]
- [ ] Lighthouse do fallback 3D acima de 90 em performance

## Relacionados

- [[Stack-Tecnologica]] — comparação detalhada com fontes
- [[Orcamento-de-Performance]]
- [[ADR-0001-Registro-de-Decisoes]]
