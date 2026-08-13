---
title: 06 - Analytics e Tracking
tags:
  - moc
  - analytics
criado: 2026-08-12
atualizado: 2026-08-12
---

# 📊 Analytics e Tracking

Como medimos se a landing page funciona — sem transformar o visitante em produto.

> Se você procurava o rastreamento espacial do headset (cabeça, mãos, 6DoF),
> a nota é [[Como-Funciona-o-Tracking]].

## Notas desta área

| Nota | Assunto |
| --- | --- |
| [[Ferramentas-de-Analytics]] | Comparação open source: Umami, Plausible, Matomo, PostHog |
| [[Plano-de-Eventos]] | Quais eventos disparar, com que nome e propriedades |
| [[LGPD-e-Consentimento]] | Base legal, consentimento e o que não coletamos |

## Princípios

1. **Primeira parte, sempre.** Script servido do nosso domínio; nada de tag de terceiro
   carregada antes do consentimento.
2. **Sem dado pessoal em evento.** Nome de evento e propriedades nunca carregam e-mail,
   telefone ou ID de usuário.
3. **Um wrapper único.** Todo evento passa por `src/lib/analytics.ts`. Trocar de
   provedor deve ser mudar um arquivo.
4. **Métrica com dono.** Evento que ninguém olha é dívida — revisar a lista a cada
   trimestre e apagar o que não é usado.

## As perguntas que a medição precisa responder

- Quantos visitantes chegam ao CTA principal?
- A experiência 3D ajuda ou atrapalha a conversão?
- Quantos entram em VR de fato? E desses, quantos convertem?
- Onde o funil vaza — no carregamento, no scroll, no formulário?
- O peso do 3D está custando visitantes em conexão lenta?

⬅ [[Home]]
