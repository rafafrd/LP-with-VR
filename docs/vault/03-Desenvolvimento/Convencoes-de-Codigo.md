---
title: Convenções de Código
tags:
  - desenvolvimento
  - convencoes
criado: 2026-08-12
atualizado: 2026-08-12
status: rascunho
---

# Convenções de Código

## Nomenclatura

| Item | Padrão | Exemplo |
| --- | --- | --- |
| Componente React | `PascalCase.tsx` | `HeroSection.tsx` |
| Hook | `useAlgo.ts` | `useXRSupport.ts` |
| Utilitário | `camelCase.ts` | `analytics.ts` |
| Componente 3D | `PascalCase.tsx` em `src/scene/` | `FloatingLogo.tsx` |
| Constante | `SCREAMING_SNAKE` | `ALTURA_PADRAO_OLHOS` |
| Tipo/Interface | `PascalCase`, sem prefixo `I` | `PerfilDePerformance` |

Código em inglês; comentários e documentação em português.

## Commits

**Conventional Commits**:

```
feat(scene): adiciona teleporte com arco
fix(xr): trata getViewerPose retornando null
perf(assets): converte texturas para KTX2
docs(vault): registra ADR da stack base
chore(deps): atualiza three para 0.18x
```

Tipos: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `chore`, `build`.

## Branches

- `main` — sempre deployável
- `feat/<slug>` — funcionalidade
- `fix/<slug>` — correção
- `chore/<slug>` — manutenção

## Regras específicas de 3D/XR

Estas não são preferência de estilo — são causas conhecidas de bug e de queda de frame:

1. **Zero alocação no render loop.** Crie `Vector3`, `Quaternion` e matrizes fora do
   `useFrame`/`requestAnimationFrame` e reaproveite.
2. **Sempre libere recursos.** `geometry.dispose()`, `material.dispose()`,
   `texture.dispose()` ao desmontar. Vazamento de GPU não aparece no heap do JS.
3. **`getViewerPose()` pode ser `null`.** Toda leitura de pose tem guarda.
4. **Feature detection por módulo**, nunca por user agent.
5. **Unidades em metros.** A escala do WebXR é métrica; modelo em centímetro vira prédio.
6. **Nenhum movimento de câmera sem input do usuário.**
7. **`console.log` no render loop é proibido** — serializar objeto 60–90×/s custa caro.

## Revisão de PR

- [ ] Build e lint passam
- [ ] Nenhuma alocação nova no render loop
- [ ] Recursos GPU liberados no unmount
- [ ] Sem `any` novo
- [ ] Se tocou na cena: checklist de [[Orcamento-de-Performance]]
- [ ] Se tomou decisão relevante: ADR criado em [[07-Decisoes]]
- [ ] Documentação atualizada no mesmo PR

⬅ [[03-Desenvolvimento]]
