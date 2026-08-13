---
title: Pipeline de Assets 3D
tags:
  - vr
  - assets
  - performance
criado: 2026-08-12
atualizado: 2026-08-12
status: estavel
---

# Pipeline de Assets 3D

Do arquivo que sai do Blender até o que o navegador baixa.

## Formato

**GLB** (glTF 2.0 binário) é o formato de entrega. Um único arquivo, sem requisições
extras para texturas, suportado nativamente por Three.js, Babylon.js, A-Frame e model-viewer.
Use `.gltf` separado só durante a autoria, quando quiser inspecionar o JSON.

## Compressão: escolha por tipo de dado

| Alvo | Técnica | Quando |
| --- | --- | --- |
| Geometria | **Draco** | Malhas estáticas, ganho agressivo de bytes |
| Geometria + morph targets + animação | **Meshopt** | Modelos animados; decodificação mais rápida |
| Texturas | **KTX2 / Basis Universal** | Sempre — é o que reduz **VRAM**, não só download |

Diferença que importa: Draco/Meshopt reduzem o **tamanho do arquivo**; a GPU descomprime
para o formato cru na memória. KTX2 permanece comprimido na VRAM, transcodificando para
o formato nativo da GPU (ASTC no mobile, BC7 no desktop). Em headset, VRAM é o gargalo —
por isso KTX2 é inegociável.

Dentro do KTX2 há dois codecs:
- **ETC1S** — arquivos muito menores, qualidade menor. Ideal para *albedo*, AO, máscaras.
- **UASTC** — qualidade alta, arquivos maiores. Use em normal maps e onde artefato aparece.

## Ferramentas (todas open source)

| Ferramenta | Licença | Uso |
| --- | --- | --- |
| [glTF-Transform](https://gltf-transform.dev/) | MIT | CLI + API JS: dedup, prune, Draco, Meshopt, KTX2 |
| [gltfpack](https://meshoptimizer.org/gltf/) (meshoptimizer) | MIT | Otimização agressiva + KTX2/BasisU |
| [Blender](https://www.blender.org/) | GPL | Autoria e exportação glTF |
| [glTF Validator](https://github.khronos.org/glTF-Validator/) | Apache-2.0 | Validação antes de commitar |

## Receita padrão

```bash
npm i -g @gltf-transform/cli

# 1. Limpeza: remove nós/materiais/meshes órfãos e dados duplicados
gltf-transform optimize entrada.glb saida.glb \
  --compress meshopt \
  --texture-compress ktx2 \
  --texture-size 1024

# Ou passo a passo, com mais controle:
gltf-transform dedup     entrada.glb  t1.glb
gltf-transform prune     t1.glb       t2.glb
gltf-transform resize    t2.glb       t3.glb --width 1024 --height 1024
gltf-transform etc1s     t3.glb       t4.glb   # texturas → KTX2/ETC1S
gltf-transform meshopt   t4.glb       final.glb
```

No lado do runtime, lembre de registrar os loaders:

```js
// Three.js
const ktx2 = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(renderer);
loader.setKTX2Loader(ktx2);
loader.setMeshoptDecoder(MeshoptDecoder); // ou setDRACOLoader, se usar Draco
```

> Os arquivos do transcoder Basis (`basis_transcoder.js/.wasm`) precisam ser copiados
> para a pasta pública — esquecer disso é o erro mais comum e falha só em runtime.

## Orçamento por asset

| Item | Alvo |
| --- | --- |
| GLB principal | ≤ 3 MB |
| Total de assets 3D na primeira dobra | ≤ 5 MB |
| Textura maior | 1024² (2048² só se justificado) |
| Triângulos por modelo destaque | ≤ 30k |
| Materiais distintos por cena | ≤ 10 |

Detalhe sobre budget de cena inteira em [[Orcamento-de-Performance]].

## Regras de trabalho

- **Assets otimizados não vão para o Git** cru. Fontes pesadas (`.blend`, texturas 4K)
  ficam fora do repositório ou em Git LFS; o repositório versiona o GLB final.
- Todo modelo passa pelo **glTF Validator** antes do commit.
- Nomeie os nós na origem (Blender): o código vai procurar por `scene.getObjectByName()`.
- Aplique transformações e limpe hierarquia antes de exportar.
- Prefira **um material com atlas** a cinco materiais — cada material é ao menos um draw call.

## Fontes

- [glTF Transform](https://gltf-transform.dev/)
- [gltfpack / meshoptimizer](https://meshoptimizer.org/gltf/)
- [Khronos glTF-Compressor](https://github.com/khronosgroup/gltf-compressor)

⬅ [[05-VR-e-3D]]
