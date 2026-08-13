---
title: Deploy e Ambientes
tags:
  - operacoes
  - deploy
  - opensource
criado: 2026-08-12
atualizado: 2026-08-12
status: rascunho
---

# Deploy e Ambientes

> Referenciado em [[Stack-Tecnologica]] e [[Arquivos-de-Engenharia]]: onde a LP roda,
> como ela chega lá e o que fazer quando algo quebra.

## A LP é estática — isso simplifica tudo

Decisão já registrada em [[02-Arquitetura]]: sem servidor de aplicação, só um endpoint
para leads (ver [[Fluxo-de-Dados]]). Isso abre a porta para hospedagem estática pura —
CDN na frente, sem processo de servidor para manter no ar.

## Opções de hospedagem

| Opção | Tipo | Licença/custo | Quando escolher |
| --- | --- | --- | --- |
| **Cloudflare Pages** / **Netlify** / **GitHub Pages** | Gerido, camada gratuita | Proprietário, grátis no volume de uma LP | Padrão pragmático — zero infraestrutura para manter |
| **Coolify** | PaaS self-hosted | Apache-2.0 | Já se tem (ou se quer) um VPS próprio; deploy via Git push, SSL automático, ambientes de preview por branch |
| **Dokploy** | PaaS self-hosted | Apache-2.0 | Alternativa mais enxuta ao Coolify — menos recursos, UI mais simples, "git push → URL" |
| **CapRover** | PaaS self-hosted | Apache-2.0 | Mais leve ainda; bom para VPS pequeno |

### Recomendação

**Cloudflare Pages (ou Netlify) para o site.** É uma LP estática de baixo volume de
infraestrutura, e o ganho de operar um PaaS próprio não compensa o custo de manutenção
de um projeto solo — mesmo já havendo um VPS rodando Umami à parte (ver
[[Ferramentas-de-Analytics]]). O critério de "open source quando importa" já foi
aplicado onde ele muda algo de verdade: engine 3D, analytics, dado do usuário. Hospedar
HTML/JS estático num serviço gerido gratuito não compromete esse princípio, porque não
há dado nem lock-in de lógica — o build sai do repositório e pode migrar para **Coolify**
a qualquer momento sem reescrever nada.

**Migre para Coolify/Dokploy self-hosted se**: o VPS que já roda Umami tiver capacidade
sobrando e o objetivo for consolidar tudo num único ponto de controle e billing.

## CI/CD

GitHub Actions, já listado em [[Stack-Tecnologica]]:

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request, push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v12
        with: { urls: 'https://deploy-preview-url' }
```

Gate de merge: lint + build + testes obrigatórios. Lighthouse do fallback 3D acima de 90
em performance — meta já registrada em [[ADR-0002-Stack-Base]].

## Ambientes

| Ambiente | Gatilho | URL |
| --- | --- | --- |
| **Preview** | Todo PR | Gerado automaticamente (Cloudflare Pages / Coolify) |
| **Produção** | Merge em `main` | Domínio final |

Sem "staging" separado — para um site estático de uma pessoa, o preview de PR cumpre
esse papel. Reavaliar se o formulário ganhar backend próprio com estado.

## Monitoramento

| Necessidade | Ferramenta open source | Licença |
| --- | --- | --- |
| Uptime / disponibilidade | **Uptime Kuma** | MIT |
| Erros de JS em produção | **GlitchTip** (compatível com Sentry SDK) | MIT |
| Métricas de uso | **Umami** (já adotado) | MIT — ver [[Ferramentas-de-Analytics]] |

Nenhuma dessas é obrigatória no lançamento — Uptime Kuma é a que compensa primeiro, por
avisar quando o site cai sem que alguém precise notar sozinho.

## Runbook de deploy (rascunho)

- [ ] `main` passou no CI
- [ ] Preview revisado visualmente (desktop + mobile)
- [ ] Checklist de [[Orcamento-de-Performance]] ok na build de produção
- [ ] Merge → deploy automático
- [ ] Confirmar `200` na URL de produção e no endpoint de leads
- [ ] Confirmar que o script de analytics carrega do domínio próprio (ver
      [[LGPD-e-Consentimento]])

### Rollback

- [ ] Reverter para o deploy anterior direto no painel do provedor (1 clique em
      Cloudflare Pages/Netlify/Coolify) — não esperar um novo PR de correção
- [ ] Abrir issue com a causa antes de tentar de novo

## Em aberto

- [ ] Domínio definitivo e DNS
- [ ] Decidir entre gerido e self-host (ver recomendação acima) — registrar em ADR se
      divergir da proposta
- [ ] Definir dono do endpoint de leads (ver [[Fluxo-de-Dados]])

## Relacionados

- [[Stack-Tecnologica]]
- [[Arquivos-de-Engenharia]]
- [[Orcamento-de-Performance]]

## Fontes

- [Coolify — GitHub](https://github.com/coollabsio/coolify)
- [Ditch Vercel & Netlify: The Best Self-Hosted Alternatives in 2026](https://dev.to/openaltfinder/ditch-vercel-netlify-the-best-self-hosted-alternatives-in-2026-2f49)
- [Dokploy vs Coolify 2026 — Comparação](https://introserv.com/blog/dokploy-vs-coolify-complete-comparison-of-the-best-self-hosted-paas-platforms-for-vps-and-dedicated-servers-2026/)

⬅ [[08-Operacoes]]
