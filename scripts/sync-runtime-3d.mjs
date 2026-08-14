#!/usr/bin/env node
/**
 * Sincroniza os decoders/transcoders de runtime do Three.js para a pasta
 * pública — Task 3.
 *
 * Copia:
 *   - public/basis/  basis_transcoder.js + .wasm  (transcoder do KTX2/Basis)
 *   - public/draco/  draco_decoder.js/.wasm + draco_wasm_wrapper.js
 *
 * Esses arquivos vêm do pacote `three` (MIT). Esquecer o transcoder Basis na
 * pasta pública é o erro de runtime mais comum do KTX2 — ver
 * docs/vault/05-VR-e-3D/Pipeline-de-Assets-3D.md.
 *
 * Os binários são COMMITADOS no repositório para garantir que sempre existem;
 * rode este script após atualizar o `three` para manter a versão em sincronia.
 *
 * Uso:
 *   npm run assets:sync-runtime-3d
 */

import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FILES = [
  {
    from: 'three/examples/jsm/libs/basis/basis_transcoder.js',
    to: 'public/basis/basis_transcoder.js',
  },
  {
    from: 'three/examples/jsm/libs/basis/basis_transcoder.wasm',
    to: 'public/basis/basis_transcoder.wasm',
  },
  {
    from: 'three/examples/jsm/libs/draco/gltf/draco_decoder.js',
    to: 'public/draco/draco_decoder.js',
  },
  {
    from: 'three/examples/jsm/libs/draco/gltf/draco_decoder.wasm',
    to: 'public/draco/draco_decoder.wasm',
  },
  {
    from: 'three/examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js',
    to: 'public/draco/draco_wasm_wrapper.js',
  },
];

async function main() {
  for (const file of FILES) {
    const source = require.resolve(file.from);
    const target = path.join(repoRoot, file.to);
    await fs.mkdir(path.dirname(target), { recursive: true });
    const bytes = await fs.readFile(source);
    await fs.writeFile(target, bytes);
    console.log(`[ok] ${file.to} (${bytes.byteLength.toLocaleString('pt-BR')} B) — de ${path.basename(source)}`);
  }
  console.log('Transcoders/decoders sincronizados. Rode o build para publicá-los em dist/.');
}

main().catch((err) => {
  console.error(`[erro] Falha ao sincronizar: ${err && err.message ? err.message : err}`);
  process.exit(1);
});
