# Pipeline de assets 3D — Task 3

Pipeline de otimização de modelos glTF/GLB para o projeto, seguindo a receita de
[`docs/vault/05-VR-e-3D/Pipeline-de-Assets-3D.md`](../docs/vault/05-VR-e-3D/Pipeline-de-Assets-3D.md).

## Uso

```bash
# Otimizar um GLB de origem
npm run assets:optimize -- <entrada.glb> <saida.glb>

# Exemplo: colocar o modelo na pasta pública
npm run assets:optimize -- src.glb public/models/destaque.glb
```

O script é idempotente: re-otimizar a saída de novo é seguro.

O `.glb` de origem (saída do Blender/autoria) não deve ser commitado no repo —
são fontes pesadas. Mantenha-as fora do controle de versão (ou em um drive de
assets) e commite apenas o resultado otimizado em `public/models/`.

## Etapas

1. `dedup` — remove nós/materiais/meshes/texturas duplicados
2. `prune` — remove recursos órfãos
3. `resize` — texturas limitadas a no máximo 1024×1024 (puro JS, sem binário)
4. `compress` — **meshopt** se houver animação/morph targets; senão **draco**
5. `ktx2` — texturas para KTX2 (opcional, ver abaixo)
6. gravação + validação final com `gltf-validator` (falha o script se houver erro)

A escolha draco/meshopt é automática, pelo conteúdo do arquivo.

## Dependência de sistema: KTX-Software

O passo 5 (KTX2) usa o binário **`ktx`** do
[KTX-Software](https://github.com/KhronosGroup/KTX-Software) (≥ 4.3.0), que é
uma ferramenta de sistema — **não** é dependência npm e não pode ser
`npm install`.

- Sem o binário no `PATH`, o script **pula o passo com aviso** e entrega um GLB
  válido com texturas em PNG/JPEG (funciona, porém usa mais VRAM).
- Com ele, as texturas vão para KTX2: **ETC1S** (qlevel 128 / clevel 1) para
  albedo/AO/máscaras e **UASTC** (qualidade 2) para normal maps.
- Dimensões são alinhadas a múltiplos de 4 (bloco 4×4 do Basis Universal) antes
  da conversão; a imagem nunca é ampliada, só reduzida.

Instalação (Windows, via winget):

```bash
winget install KhronosGroup.KTX-Software
```

## Desvios documentados da nota da Task 3

A nota pedia 4 devDeps (`@gltf-transform/{core,functions,extensions}` +
`gltf-validator`). Em `@gltf-transform/functions` **v4** o que muda:

- **Sem função `resize` standalone** — o resize é feito por
  `textureCompress({ resize })`. Sem lib de sistema, o redimensionamento usa
  `ndarray` + `ndarray-pixels` + `ndarray-lanczos` (fallback puro JS).
- **Sem função `etc1s`/`uastc`** — o KTX2 v4 é gerado por `toktx.ts` do
  glTF-Transform, que chama o binário `ktx` via `spawn`. Seguimos a mesma
  abordagem (decisão do orquestrador), então nenhum pacote npm de basisu.
- **`draco()` exige encoder WASM** — `draco3dgltf`; e **`meshopt()` exige
  encoder WASM** — `meshoptimizer`. Ambos são npm, sem binário de sistema.

DevDeps adicionais além das 4 da nota: `draco3dgltf`, `meshoptimizer`,
`ndarray`, `ndarray-pixels`, `ndarray-lanczos`.

## Transcoder de runtime

O loader de runtime (`src/lib/gltfLoader.ts`) usa:

- `public/basis/` — transcoder Basis para `KHR_texture_basisu` (KTX2)
- `public/draco/` — decoders Draco para `KHR_draco_mesh_compression`
- `three/examples/jsm/libs/meshopt_decoder.module.js` — embutido no bundle

Esses arquivos vêm de `three/examples/jsm/libs/` e são **commitados no repo**
(fica garantido que o runtime funciona offline). Ao atualizar a versão do
`three`, re-sincronize com:

```bash
npm run assets:sync-runtime-3d
```

Se preferir não commitar, copie-os manualmente para `public/` (ou sirva de um
CDN e ajuste os `setTranscoderPath`/`setDecoderPath` em `gltfLoader.ts`).

## Runtime MediaPipe (Task 6)

O Face Landmarker (`@mediapipe/tasks-vision`) precisa de dois tipos de arquivo em
runtime, ambos servidos de `public/mediapipe/`:

- **Runtime WASM**: `vision_wasm{,_nosimd}_internal.{js,wasm}` — copiados de
  `node_modules/@mediapipe/tasks-vision/`
- **Modelo**: `face_landmarker.task` (float16, do storage.googleapis.com do
  MediaPipe) — **o modelo não vem no pacote npm** (o pacote só embute o runtime
  WASM), por isso o script baixa do storage oficial.

O `FilesetResolver.forVisionTasks()` monta os caminhos como
`${basePath}/vision_wasm[_module][_nosimd]_internal.{js,wasm}` — os arquivos são
publicados **sem renomear**, e o hook usa `basePath: "/mediapipe"`.

Todos os arquivos são **commitados no repo** (runtime funciona offline, mesmo
princípio do `basis/`/`draco/` da Task 3).

```bash
npm run assets:sync-mediapipe   # sincroniza WASM + baixa o modelo
npm run assets:smoke-mediapipe  # valida: carrega WASM + modelo e roda 1 inferência
```

O smoke test roda o bundle do MediaPipe **em Node** (com shims de
`document`/`fetch`/WebGL) — prova que os assets estão íntegros e que
`createFromOptions` + `detect()` funcionam de verdade, sem precisar de
browser/câmera.
