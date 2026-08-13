---
title: Público-Alvo
tags:
  - visao-geral
  - publico
criado: 2026-08-12
atualizado: 2026-08-12
status: rascunho
---

# Público-Alvo

## Contexto de mercado (para calibrar expectativa sobre o VR)

Números que justificam o princípio de **progressive enhancement** já adotado em
[[05-VR-e-3D]] — a maioria de quem chega à LP não vai entrar em VR de fato:

| Métrica | Valor (2025/2026) |
| --- | --- |
| Pessoas usando VR no mundo | ~171 milhões (2025) → ~216 milhões projetado para o fim de 2026 |
| Domicílios nos EUA com headset de VR | ~13% |
| Consumidores nos EUA que já tiveram alguma experiência em VR | ~48% |
| Frequência de uso entre quem já tem headset | 80% usam algumas vezes ao mês; 60% mais de uma vez por semana |

Leitura prática: **a versão sem headset é o produto principal.** VR é o diferencial para
uma fatia pequena, mas engajada, do público — vale investir na experiência imersiva,
desde que o fallback (ver [[Suporte-de-Dispositivos]]) não seja tratado como secundário.

```mermaid
flowchart TD
    A[Visitantes da LP] --> B{Já experimentou VR?<br/>~48% já teve alguma experiência}
    B -- não --> C[Fallback 3D/estático<br/>é a experiência inteira]
    B -- sim --> D{Possui headset?<br/>~13% dos domicílios EUA}
    D -- não --> C
    D -- sim --> E[CTA "Entrar em VR"<br/>sessão immersive-vr]
```

## Quem acessa (a preencher)

_Depende do canal de aquisição — anúncio, orgânico, indicação? Isso muda o dispositivo
predominante (mobile vs desktop) e, por consequência, a prioridade de fallback._

| Persona | Contexto de acesso | Dispositivo provável | O que essa pessoa precisa ver em 5 segundos |
| --- | --- | --- | --- |
|  |  |  |  |

## Perguntas em aberto

- [ ] Qual o canal principal de tráfego (ads, orgânico, evento, indicação)?
- [ ] O público já sabe o que é VR/WebXR ou precisa de explicação antes do CTA?
- [ ] Mobile é maioria? Se sim, o 3D em tela (sem headset) é o caminho crítico real.
- [ ] Existe expectativa de tráfego internacional, ou é só Brasil (afeta i18n e LGPD)?

## Relacionados

- [[Escopo]]
- [[Requisitos]]
- [[Suporte-de-Dispositivos]]

## Fontes

- [Virtual Reality Statistics (2026) — DemandSage](https://www.demandsage.com/virtual-reality-statistics/)
- [Virtual Reality Statistics 2026: Market Size, Users and Data — SQ Magazine](https://sqmagazine.co.uk/virtual-reality-statistics/)

⬅ [[01-Visao-Geral]]
