---
title: Ferramentas de Analytics
tags:
  - analytics
  - opensource
  - comparacao
criado: 2026-08-12
atualizado: 2026-08-12
status: em-revisao
---

# Ferramentas de Analytics (open source)

## Comparação

| Ferramenta | Licença | Peso do script | Self-host | Melhor para |
| --- | --- | --- | --- | --- |
| **Umami** | MIT | ~2 KB | Fácil (Docker + Postgres/MySQL) | Fundamentos bem-feitos, curva de aprendizado mínima |
| **Plausible** | AGPL-3.0 | ~1 KB | Média (ClickHouse) | Analytics de tráfego simples e limpo |
| **Matomo** | GPL-3.0 | ~22 KB | Média (PHP + MySQL) | Substituto direto do GA4, SEO e e-commerce |
| **PostHog** | MIT (parcial) | ~40 KB+ | Pesado | Produto: session replay, feature flags, funis |
| **OpenPanel** | AGPL-3.0 | leve | Docker | Web + produto num só, projeto mais novo |

Pontos que merecem atenção:

- **Licença importa se você for modificar.** AGPL (Plausible, OpenPanel) obriga a
  publicar modificações se você servir a versão alterada. MIT (Umami, PostHog) não.
- **PostHog é a exceção quanto à paridade**: a versão self-hosted diverge da cloud.
  As outras entregam o mesmo conjunto nos dois modos.
- **Peso do script conta duas vezes aqui**: a LP já vai carregar megabytes de 3D. Cada
  KB de analytics compete com o `time-to-interactive`.

## Recomendação

**Umami self-hosted.**

Por quê, para este projeto especificamente:
- Script de ~2 KB — irrelevante perto do budget que o 3D já consome.
- MIT: liberdade total para adaptar.
- Eventos customizados com propriedades bastam para todo o [[Plano-de-Eventos]].
- Sem cookies por padrão → dispensa banner de consentimento para o básico
  (ver [[LGPD-e-Consentimento]]).
- Subir é Docker + Postgres; cabe no mesmo VPS de outros projetos.

**Escolha Plausible** se você já usa a versão hospedada ou prefere a UI dele.
**Escolha Matomo** se o marketing exigir relatórios no nível do GA4.
**Adicione PostHog depois**, e só se session replay virar necessidade real de
otimização de funil — não no lançamento.

## Instalação de referência (Umami)

```yaml
# docker-compose.yml
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    environment:
      DATABASE_URL: postgresql://umami:senha@db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: troque-isto
    depends_on: [db]
    ports: ["3000:3000"]
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: senha
    volumes: [umami-db:/var/lib/postgresql/data]
volumes:
  umami-db:
```

Sirva o script sob o **seu domínio** (proxy reverso ou caminho no CDN) — script em
domínio de terceiro é bloqueado por boa parte dos bloqueadores.

```html
<script defer src="https://seu-dominio.com/s.js" data-website-id="UUID"></script>
```

## Wrapper obrigatório

```ts
// src/lib/analytics.ts — único ponto de contato com o provedor
type Props = Record<string, string | number | boolean>;

export function track(evento: string, props?: Props) {
  if (import.meta.env.DEV) return console.debug('[analytics]', evento, props);
  window.umami?.track(evento, props);
}
```

Nenhum outro arquivo importa `window.umami`. Trocar de ferramenta = editar este arquivo.

## Fontes

- [Self-Hosted Web Analytics 2026 — Plausible vs Matomo vs Umami vs OpenPanel](https://openpanel.dev/articles/self-hosted-web-analytics)
- [Open Source Analytics Tools: 2026 Survey of Privacy-First Options](https://openpanel.dev/articles/open-source-web-analytics)
- [12 Best Open Source Website Analytics Tools](https://swetrix.com/blog/open-source-website-analytics)

⬅ [[06-Analytics-e-Tracking]]
