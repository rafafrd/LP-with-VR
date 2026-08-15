#!/usr/bin/env node
/**
 * Sincroniza o runtime + modelo do MediaPipe Face Landmarker para a pasta
 * pública — Task 6.
 *
 * Copia:
 *   - public/mediapipe/vision_wasm_internal.js + .wasm          (runtime SIMD)
 *   - public/mediapipe/vision_wasm_nosimd_internal.js + .wasm   (runtime sem SIMD)
 *   - public/mediapipe/face_landmarker.task                     (modelo, Apache-2.0)
 *
 * Fontes:
 *   - O runtime WASM vem do pacote npm `@mediapipe/tasks-vision` (Apache-2.0),
 *     em node_modules/@mediapipe/tasks-vision/wasm/. A API pede que esses
 *     arquivos sejam publicados SEM RENOMEAR (requisito do `FilesetResolver`),
 *     então copiamos com o nome original.
 *   - O modelo `.task` NÃO vem no pacote npm (verificado em v1.0.1): só existe
 *     no model zoo oficial do Google
 *     (https://storage.googleapis.com/mediapipe-models/...), licença Apache-2.0.
 *     O script o baixa na primeira execução e pula se já estiver presente
 *     (idempotente); use `--force` para baixar de novo.
 *
 * Só sincronizamos as variantes "clássicas" (não-module): o hook
 * `src/hooks/useFaceLandmarker.ts` usa `FilesetResolver.forVisionTasks(basePath)`
 * com `useModule: false` (default), que resolve para
 * `vision_wasm[_nosimd]_internal.{js,wasm}`. As variantes `*_module_*` só seriam
 * necessárias se carregássemos com `useModule: true` — deixamos de fora para não
 * inflar o repositório.
 *
 * Mesmo princípio dos transcoders Basis/Draco (Task 3): os binários são
 * COMMITADOS para garantir que o runtime funciona offline. Rode este script após
 * atualizar `@mediapipe/tasks-vision` para manter a versão em sincronia.
 *
 * Uso:
 *   npm run assets:sync-mediapipe            # copia runtime + modelo (se faltar)
 *   npm run assets:sync-mediapipe -- --force # força re-download do modelo
 */

import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const destDir = path.join(repoRoot, "public", "mediapipe");

// Runtime WASM embutido no pacote npm — copiados com o nome original (o
// FilesetResolver não aceita renomeação).
const WASM_FILES = [
  "vision_wasm_internal.js",
  "vision_wasm_internal.wasm",
  "vision_wasm_nosimd_internal.js",
  "vision_wasm_nosimd_internal.wasm",
];

// Modelo Face Landmarker (face mesh de 478 pontos + blendshapes + matriz de
// transformação). Não vem no pacote npm — baixado do model zoo oficial do
// Google (Apache-2.0). Mesma URL usada pelos exemplos oficiais de 2026
// (google-ai-edge/mediapipe-samples-web).
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const MODEL_FILE = "face_landmarker.task";

function pretty(bytes) {
  return bytes.toLocaleString("pt-BR");
}

async function copyWasm() {
  for (const name of WASM_FILES) {
    // O exports map do pacote expõe os wasm direto no subpath da raiz
    // (`@mediapipe/tasks-vision/vision_wasm_internal.js`), não em /wasm/.
    const source = require.resolve(
      `@mediapipe/tasks-vision/${name}`,
    );
    const target = path.join(destDir, name);
    await fs.mkdir(path.dirname(target), { recursive: true });
    const bytes = await fs.readFile(source);
    await fs.writeFile(target, bytes);
    console.log(`[ok] public/mediapipe/${name} (${pretty(bytes.byteLength)} B) — de ${path.basename(source)}`);
  }
}

async function ensureModel({ force }) {
  const target = path.join(destDir, MODEL_FILE);
  await fs.mkdir(destDir, { recursive: true });

  if (!force) {
    try {
      const stat = await fs.stat(target);
      if (stat.size > 1_000_000) {
        console.log(
          `[skip] public/mediapipe/${MODEL_FILE} já existe (${pretty(stat.size)} B) — use --force para baixar de novo`,
        );
        return;
      }
    } catch {
      // Não existe ainda — segue para o download.
    }
  }

  console.log(`[get] baixando ${MODEL_URL}`);
  const res = await fetch(MODEL_URL);
  if (!res.ok) {
    throw new Error(
      `download do modelo falhou: HTTP ${res.status} ${res.statusText}`,
    );
  }
  const bytes = new Uint8Array(await res.arrayBuffer());
  await fs.writeFile(target, bytes);
  console.log(`[ok] public/mediapipe/${MODEL_FILE} (${pretty(bytes.byteLength)} B)`);
}

async function main() {
  const force = process.argv.includes("--force");
  await copyWasm();
  await ensureModel({ force });
  console.log("MediaPipe sincronizado. Rode o build para publicá-lo em dist/.");
}

main().catch((err) => {
  console.error(`[erro] Falha ao sincronizar MediaPipe: ${err && err.message ? err.message : err}`);
  process.exit(1);
});
