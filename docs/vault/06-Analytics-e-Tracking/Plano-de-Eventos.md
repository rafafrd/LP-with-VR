---
title: Plano de Eventos
tags:
  - analytics
  - eventos
  - conversao
criado: 2026-08-12
atualizado: 2026-08-12
status: rascunho
---

# Plano de Eventos

Contrato entre produto e código: **se não está nesta tabela, não é disparado.**

## Convenção de nomes

`objeto_acao`, minúsculo, com underscore, em inglês, no passado quando for ação
concluída. Ex.: `form_submitted`, `xr_session_started`.

## Eventos

### Funil principal

| Evento | Quando dispara | Propriedades |
| --- | --- | --- |
| `page_viewed` | Automático | — |
| `hero_cta_clicked` | Clique no CTA da primeira dobra | `posicao` |
| `section_viewed` | Seção entra em viewport por >2 s | `secao` |
| `form_started` | Primeiro foco em campo | — |
| `form_submitted` | Envio com sucesso | `origem` |
| `form_failed` | Erro de validação ou de rede | `campo`, `motivo` |

### Experiência 3D / VR

| Evento | Quando dispara | Propriedades |
| --- | --- | --- |
| `scene_loaded` | GLB pronto e primeiro frame renderizado | `duracao_ms`, `nivel` |
| `scene_failed` | Falha ao carregar/criar contexto WebGL | `motivo` |
| `xr_supported` | Uma vez, após `isSessionSupported()` | `suportado` (bool) |
| `xr_button_clicked` | Clique em "Entrar em VR" | — |
| `xr_session_started` | Sessão XR criada | `modo`, `reference_space` |
| `xr_session_ended` | Evento `end` da sessão | `duracao_s` |
| `xr_hotspot_activated` | Interação com ponto da cena | `hotspot` |
| `experience_degraded` | Caiu para fallback estático | `motivo` |

> `duracao_s` da sessão XR é a métrica mais reveladora do projeto: sessão de 4 segundos
> significa que alguém entrou, se assustou e saiu.

## Propriedades proibidas

Nunca envie: e-mail, nome, telefone, texto digitado, ID de usuário, URL com query string
de campanha contendo dado pessoal, **coordenadas de pose do headset**.

## Métricas derivadas

| Métrica | Cálculo |
| --- | --- |
| Taxa de conversão | `form_submitted` / `page_viewed` |
| Adoção de VR | `xr_session_started` / `xr_supported=true` |
| Conversão pós-VR | `form_submitted` após `xr_session_ended` |
| Custo do 3D | conversão com `scene_loaded` vs `experience_degraded` |
| Abandono de formulário | 1 − (`form_submitted` / `form_started`) |

## Implementação

```ts
import { track } from '@/lib/analytics';

session.addEventListener('end', () => {
  track('xr_session_ended', {
    duracao_s: Math.round((performance.now() - inicio) / 1000),
  });
});
```

## Checklist antes de adicionar um evento novo

- [ ] Responde a uma pergunta que já está em [[06-Analytics-e-Tracking]]?
- [ ] Alguém vai olhar esse número? Quem?
- [ ] Nenhuma propriedade contém dado pessoal?
- [ ] Nome segue `objeto_acao`?
- [ ] Foi adicionado nesta tabela **antes** do código?

## Relacionados

- [[Ferramentas-de-Analytics]]
- [[LGPD-e-Consentimento]]

⬅ [[06-Analytics-e-Tracking]]
