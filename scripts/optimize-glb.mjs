#!/usr/bin/env node
/**
 * Pipeline de otimização de assets 3D — Task 3.
 *
 * Receita padrão de docs/vault/05-VR-e-3D/Pipeline-de-Assets-3D.md, na ordem:
 *
 *   1. dedup    — remove nós/materiais/meshes/texturas duplicados
 *   2. prune    — remove recursos órfãos (nós, materiais, meshes, buffers)
 *   3. resize   — texturas limitadas a no máximo 1024x1024
 *   4. compress — meshopt se houver animação/morph targets; senão draco
 *   5. ktx2     — texturas para KTX2 (ETC1S p/ albedo/AO/máscaras, UASTC p/ normal
 *                 maps) VIA BINÁRIO EXTERNO `ktx` (KTX-Software). Se o binário não
 *                 existir no PATH a etapa é pulada com aviso — nunca trava.
 *   6. validação final com gltf-validator (falha o script se houver erro)
 *
 * O passo 5 depende de KTX-Software (https://github.com/KhronosGroup/KTX-Software),
 * que é uma ferramenta de sistema — NÃO é dependência npm. Os demais passos são
 * bibliotecas npm (WASM embarcado), sem binário externo.
 *
 * Uso:
 *   node scripts/optimize-glb.mjs <entrada.glb> <saida.glb>
 *   npm run assets:optimize -- <entrada.glb> public/models/saida.glb
 *
 * Comentários em português; código em inglês (Convencoes-de-Codigo.md).
 */

import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { ImageUtils, Logger, NodeIO, TextureChannel } from '@gltf-transform/core';
import {
  EXTMeshoptCompression,
  KHRDracoMeshCompression,
  KHRMeshQuantization,
  KHRTextureBasisu,
} from '@gltf-transform/extensions';
import {
  dedup,
  draco,
  getTextureChannelMask,
  getTextureColorSpace,
  inspect,
  listTextureSlots,
  meshopt,
  prune,
  textureCompress,
} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptEncoder } from 'meshoptimizer';
import { lanczos3 } from 'ndarray-lanczos';
import { getPixels, savePixels } from 'ndarray-pixels';
import ndarray from 'ndarray';

// gltf-validator é CommonJS; require via createRequire preserva o interop.
const require = createRequire(import.meta.url);
const gltfValidator = require('gltf-validator');

/** Tamanho máximo de textura aplicado pela receita padrão. */
const MAX_TEXTURE_SIZE = 1024;

/** Orçamentos da tabela "Orçamento por asset" (Pipeline-de-Assets-3D.md). */
const BUDGET = {
  glbSize: 3 * 1024 * 1024, // GLB principal ≤ 3 MB
  triangles: 30_000, // triângulos por modelo destaque ≤ 30k
  materials: 10, // materiais distintos ≤ 10
};

/** Versão mínima do KTX-Software necessária para o passo de KTX2. */
const KTX_VERSION_MIN = [4, 3, 0];

const USAGE = `
Uso: node scripts/optimize-glb.mjs <entrada.glb> <saida.glb>

  entrada.glb   arquivo .glb de origem (saída do Blender/autoria)
  saida.glb     arquivo .glb otimizado (ex.: public/models/modelo.glb)

Exemplos:
  node scripts/optimize-glb.mjs src.glb public/models/destaque.glb
  npm run assets:optimize -- src.glb public/models/destaque.glb

Etapas: dedup -> prune -> resize (max 1024) -> draco|meshopt -> ktx2 (opcional)
O passo ktx2 exige o binário \`ktx\` do KTX-Software instalado no sistema.
`.trim();

const { R, G, A } = TextureChannel;

// ---------------------------------------------------------------------------
// Logging.
// ---------------------------------------------------------------------------

function log(message) {
  console.log(`[info]  ${message}`);
}

function warn(message) {
  console.warn(`[aviso] ${message}`);
}

function error(message) {
  console.error(`[erro]  ${message}`);
}

function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} kB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

// ---------------------------------------------------------------------------
// Estatísticas.
// ---------------------------------------------------------------------------

/**
 * Coleta métricas usadas no resumo final e no cheque de orçamento.
 * Triângulos derivados de renderVertexCount (vértices enviados à GPU / 3).
 */
function collectStats(doc, sizeBytes) {
  const report = inspect(doc);
  const scene = report.scenes.properties[0];
  const root = doc.getRoot();
  return {
    size: sizeBytes,
    triangles: scene ? Math.round(scene.renderVertexCount / 3) : 0,
    materials: root.listMaterials().length,
    textures: root.listTextures().length,
  };
}

function checkBudget(stats) {
  const issues = [];
  if (stats.size > BUDGET.glbSize) {
    issues.push(`GLB principal ${formatBytes(stats.size)} excede o alvo de ${formatBytes(BUDGET.glbSize)}`);
  }
  if (stats.triangles > BUDGET.triangles) {
    issues.push(
      `${stats.triangles.toLocaleString('pt-BR')} triângulos excedem o alvo de ${BUDGET.triangles.toLocaleString('pt-BR')} por modelo destaque`,
    );
  }
  if (stats.materials > BUDGET.materials) {
    issues.push(`${stats.materials} materiais excedem o alvo de ${BUDGET.materials} materiais distintos`);
  }
  return issues;
}

// ---------------------------------------------------------------------------
// Validação (gltf-validator).
// ---------------------------------------------------------------------------

/**
 * Valida um GLB com o glTF Validator. Retorna a lista de mensagens com
 * severidade de erro (severity === 0) — ver Issue.Severity do validator.
 */
async function validateGlb(bytes, label) {
  let report;
  try {
    report = await gltfValidator.validateBytes(bytes, { maxIssues: 0, writeTimestamp: false });
  } catch (err) {
    error(`${label}: o arquivo não parece ser um GLB/glTF válido (${err && err.message ? err.message : 'erro no parser'}).`);
    return { report: null, errors: [new Error('formato inválido')] };
  }
  const messages = report.issues.messages || [];
  const errors = messages.filter((message) => message.severity === 0);
  if (errors.length > 0) {
    error(`${label}: ${errors.length} erro(s) de validação`);
    for (const issue of errors) {
      const pointer = issue.pointer ? ` @ ${issue.pointer}` : '';
      error(`  - ${issue.code}: ${issue.message}${pointer}`);
    }
  }
  return { report, errors };
}

// ---------------------------------------------------------------------------
// KTX2 (passo opcional, depende do binário `ktx` do KTX-Software).
// ---------------------------------------------------------------------------

/** Detecta o binário `ktx` no PATH. Retorna a versão como string ou null. */
function detectKtx() {
  try {
    const result = spawnSync('ktx', ['--version'], { encoding: 'utf8', timeout: 5000, windowsHide: true });
    if (result.error || result.status !== 0) return null;
    return (result.stdout || result.stderr || '').trim();
  } catch {
    return null;
  }
}

/** Extrai a versão numérica de uma linha "ktx version X.Y.Z ...". */
function parseKtxVersion(versionString) {
  const match = /(\d+)\.(\d+)\.(\d+)/.exec(versionString);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isVersionAtLeast(version, minimum) {
  if (!version) return false;
  for (let i = 0; i < minimum.length; i++) {
    if (version[i] > minimum[i]) return true;
    if (version[i] < minimum[i]) return false;
  }
  return true;
}

/**
 * Dimensiona a textura para dentro do orçamento (≤ MAX_TEXTURE_SIZE) garantindo
 * múltiplos de 4 — exigência do KHR_texture_basisu (bloco 4x4 do Basis Universal).
 * Apenas reduz; nunca aumenta.
 */
function fitMultipleOfFour([width, height]) {
  const scale = Math.min(1, MAX_TEXTURE_SIZE / width, MAX_TEXTURE_SIZE / height);
  const fit = (value) => {
    const scaled = Math.floor(value * scale);
    const floored = scaled - (scaled % 4);
    return Math.max(4, floored);
  };
  return [fit(width), fit(height)];
}

/**
 * Redimensiona uma imagem para dimensões exatas, puro JS (ndarray + lanczos).
 * Usado apenas para alinhar texturas a múltiplos de 4 antes do `ktx create`.
 */
async function resizeExact(srcImage, srcMimeType, [dstWidth, dstHeight]) {
  const srcPixels = await getPixels(srcImage, srcMimeType);
  const dstPixels = ndarray(new Uint8Array(dstWidth * dstHeight * 4), [dstWidth, dstHeight, 4]);
  lanczos3(srcPixels, dstPixels);
  return savePixels(dstPixels, 'image/png');
}

/** Executa o binário `ktx` capturando status/stdout/stderr. */
function runKtx(args) {
  return new Promise((resolve) => {
    const child = spawn('ktx', args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('close', (status) => resolve({ status, stdout, stderr }));
    child.on('error', (err) => resolve({ status: -1, stdout: '', stderr: String(err) }));
  });
}

/**
 * Monta os argumentos de `ktx create`, espelhando o comportamento do CLI do
 * glTF-Transform (toktx.ts): ETC1S para albedo/AO/máscaras, UASTC para normal
 * maps, formatos de cor e color space derivados do material/textura.
 */
function buildKtxParams({ texture, slots, isNormalMap }) {
  const channels = getTextureChannelMask(texture);
  const colorSpace = getTextureColorSpace(texture);
  const params = ['--generate-mipmap'];

  if (isNormalMap) {
    // UASTC para normal maps — qualidade alta, evita artefatos.
    params.push('--encode', 'uastc', '--uastc-quality', '2');
  } else {
    // ETC1S para albedo/AO/máscaras — arquivo menor; RDO ligado (padrão).
    params.push('--encode', 'basis-lz', '--qlevel', '128', '--clevel', '1');
  }

  // Color space (glTF fica em sRGB no albedo; linear no resto).
  if (colorSpace === 'srgb') {
    params.push('--assign-oetf', 'srgb', '--assign-primaries', 'bt709');
  } else if (colorSpace === 'srgb-linear') {
    params.push('--assign-oetf', 'linear', '--assign-primaries', 'bt709');
  } else if (slots.length > 0) {
    params.push('--assign-oetf', 'linear', '--assign-primaries', 'none');
  }

  // Formato de cor por canal presente — reduz canais descartáveis.
  if (channels === R) {
    params.push('--format', 'R8_UNORM');
  } else if (channels === G || channels === (R | G)) {
    params.push('--format', 'R8G8_UNORM');
  } else if (!(channels & A)) {
    params.push('--format', colorSpace === 'srgb' ? 'R8G8B8_SRGB' : 'R8G8B8_UNORM');
  } else {
    params.push('--format', colorSpace === 'srgb' ? 'R8G8B8A8_SRGB' : 'R8G8B8A8_UNORM');
  }

  return params;
}

/**
 * Converte todas as texturas PNG/JPEG do documento para KTX2 usando o binário
 * `ktx` do KTX-Software. Retorna o número de texturas convertidas. Em caso de
 * falha por textura, avisa e mantém a original — nunca derruba o pipeline.
 */
async function encodeTexturesToKtx2(doc) {
  const root = doc.getRoot();
  const textures = root.listTextures().filter((texture) => {
    const mimeType = texture.getMimeType();
    return mimeType !== 'image/ktx2' && (mimeType === 'image/png' || mimeType === 'image/jpeg');
  });

  if (textures.length === 0) {
    warn('KTX2: nenhuma textura PNG/JPEG encontrada para conversão.');
    return 0;
  }

  const basisu = doc.createExtension(KHRTextureBasisu).setRequired(true);
  const batchDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'void-assets-'));
  let converted = 0;

  try {
    for (const [index, texture] of textures.entries()) {
      const label = texture.getURI() || texture.getName() || `textura ${index + 1}`;
      const slots = listTextureSlots(texture);
      const isNormalMap = slots.some((slot) => /normal/i.test(slot));

      let srcImage = texture.getImage();
      let srcMimeType = texture.getMimeType();

      // KTX2 exige dimensões múltiplas de 4 (bloco 4x4 do Basis Universal).
      const srcSize = ImageUtils.getSize(srcImage, srcMimeType);
      if (!srcSize) {
        warn(`KTX2: ignorando "${label}" (tamanho não identificável).`);
        continue;
      }
      const targetSize = fitMultipleOfFour(srcSize);
      if (targetSize[0] !== srcSize[0] || targetSize[1] !== srcSize[1]) {
        log(`KTX2: redimensionando "${label}" ${srcSize.join('x')} -> ${targetSize.join('x')} (múltiplo de 4)`);
        srcImage = await resizeExact(srcImage, srcMimeType, targetSize);
        srcMimeType = 'image/png';
      }

      const srcExtension = srcMimeType === 'image/jpeg' ? 'jpg' : 'png';
      const srcPath = path.join(batchDir, `texture-${index}.${srcExtension}`);
      const dstPath = path.join(batchDir, `texture-${index}.ktx2`);
      await fsp.writeFile(srcPath, srcImage);

      const params = buildKtxParams({ texture, slots, isNormalMap });
      const result = await runKtx(['create', ...params, srcPath, dstPath]);

      if (result.status !== 0) {
        warn(`KTX2: falha em "${label}" (ktx create saiu com ${result.status}). Textura mantida como ${srcMimeType}.`);
        if (result.stderr.trim()) warn(`KTX2:   ${result.stderr.trim().split('\n').pop()}`);
        continue;
      }

      const ktx2Bytes = await fsp.readFile(dstPath);
      texture.setImage(ktx2Bytes).setMimeType('image/ktx2');
      if (texture.getURI()) {
        texture.setURI(`${label.replace(/\.(png|jpe?g)$/i, '')}.ktx2`);
      }
      converted++;
    }
  } finally {
    await fsp.rm(batchDir, { recursive: true, force: true });
  }

  const usesKTX2 = root.listTextures().some((texture) => texture.getMimeType() === 'image/ktx2');
  if (!usesKTX2) {
    doc.disposeExtension(KHRTextureBasisu.EXTENSION_NAME);
    warn('KTX2: nenhuma textura convertida — extensão KHR_texture_basisu removida.');
  }

  return converted;
}

// ---------------------------------------------------------------------------
// Pipeline principal.
// ---------------------------------------------------------------------------

async function runPipeline(inputPath, outputPath) {
  const inputBytes = await fsp.readFile(inputPath);

  log(`Validando entrada ${path.basename(inputPath)}...`);
  const inputValidation = await validateGlb(inputBytes, 'Entrada');
  if (inputValidation.errors.length > 0) {
    error('Pipeline abortado: o arquivo de origem já é inválido.');
    process.exit(1);
  }

  await MeshoptEncoder.ready;
  const io = new NodeIO()
    // KHRMeshQuantization é exigido pelo meshopt (quantização SHORT dos atributos).
    .registerExtensions([
      KHRTextureBasisu,
      KHRDracoMeshCompression,
      KHRMeshQuantization,
      EXTMeshoptCompression,
    ])
    .registerDependencies({
      'draco3d.encoder': await draco3d.createEncoderModule(),
      'meshopt.encoder': MeshoptEncoder,
    });

  const doc = await io.read(inputPath);
  doc.setLogger(new Logger(Logger.Verbosity.WARN));
  const root = doc.getRoot();

  const before = collectStats(doc, inputBytes.byteLength);

  // 1. Dedup — remove dados duplicados (acessors, meshes, materiais, texturas).
  log('Etapa 1/6: dedup...');
  await doc.transform(dedup());

  // 2. Prune — remove recursos órfãos.
  log('Etapa 2/6: prune...');
  await doc.transform(prune());

  // 3. Resize — limita texturas a no máximo 1024x1024 (puro JS, sem binário).
  const textures = root.listTextures();
  if (textures.length > 0) {
    const resizable = textures.some((texture) => {
      const mimeType = texture.getMimeType();
      return mimeType === 'image/png' || mimeType === 'image/jpeg';
    });
    if (resizable) {
      log(`Etapa 3/6: resize de texturas (max ${MAX_TEXTURE_SIZE}x${MAX_TEXTURE_SIZE})...`);
      try {
        await doc.transform(textureCompress({ resize: [MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE] }));
      } catch (err) {
        warn(`Resize de texturas falhou: ${err.message}`);
      }
    } else {
      log('Etapa 3/6: resize de texturas — sem texturas PNG/JPEG (já comprimidas).');
    }
  } else {
    log('Etapa 3/6: resize de texturas — nenhuma textura no asset.');
  }

  // 4. Compressão de geometria — meshopt se houver animação/morph targets; draco
  //    caso contrário. Detecção automática pelo conteúdo, sem flag.
  const hasAnimation = root.listAnimations().length > 0;
  const hasMorphTargets = root
    .listMeshes()
    .some((mesh) => mesh.listPrimitives().some((primitive) => primitive.listTargets().length > 0));
  const geometryMethod = hasAnimation || hasMorphTargets ? 'meshopt' : 'draco';
  log(`Etapa 4/6: compressão de geometria com ${geometryMethod}${hasAnimation ? ' (animação)' : hasMorphTargets ? ' (morph targets)' : ''}...`);
  if (geometryMethod === 'meshopt') {
    await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  } else {
    await doc.transform(draco({ method: 'edgebreaker' }));
  }

  // 5. KTX2 — opcional, depende do binário `ktx` (KTX-Software).
  const ktxVersion = detectKtx();
  let ktx2Textures = 0;
  if (ktxVersion) {
    const version = parseKtxVersion(ktxVersion);
    if (version && !isVersionAtLeast(version, KTX_VERSION_MIN)) {
      warn(`KTX2: KTX-Software ${version.join('.')} é antigo (mínimo ${KTX_VERSION_MIN.join('.')}). Pulando KTX2.`);
    } else {
      log(`Etapa 5/6: KTX2 (KTX-Software ${ktxVersion})...`);
      ktx2Textures = await encodeTexturesToKtx2(doc);
    }
  } else {
    warn(
      'Etapa 5/6: KTX2 PULADA — binário `ktx` (KTX-Software) não encontrado no PATH. ' +
        'O GLB segue válido sem KTX2, mas as texturas ficam em PNG/JPEG (VRAM maior). ' +
        'Instale de https://github.com/KhronosGroup/KTX-Software e rode de novo.',
    );
  }

  // 6. Gravação + validação final.
  log('Etapa 6/6: gravando e validando saída...');
  const outputBytes = await io.writeBinary(doc);
  await fsp.mkdir(path.dirname(outputPath), { recursive: true });
  await fsp.writeFile(outputPath, outputBytes);

  const outputValidation = await validateGlb(outputBytes, 'Saída');
  if (outputValidation.errors.length > 0) {
    error(`Saída inválida: ${outputValidation.errors.length} erro(s). Arquivo não foi aceito.`);
    process.exit(1);
  }

  const after = collectStats(doc, outputBytes.byteLength);
  printSummary(before, after, geometryMethod, ktx2Textures);
}

// ---------------------------------------------------------------------------
// Resumo final + cheque de orçamento.
// ---------------------------------------------------------------------------

function printSummary(before, after, geometryMethod, ktx2Textures) {
  const saved = before.size > 0 ? Math.round((1 - after.size / before.size) * 100) : 0;
  const ktx2Note = ktx2Textures > 0 ? `${ktx2Textures} textura(s) KTX2 (ETC1S/UASTC)` : 'pulada (sem `ktx`)';

  console.log('');
  console.log('Resumo da otimização:');
  if (saved >= 0) {
    console.log(`  Tamanho:     ${formatBytes(before.size)} -> ${formatBytes(after.size)} (${saved}%)`);
  } else {
    console.log(
      `  Tamanho:     ${formatBytes(before.size)} -> ${formatBytes(after.size)} (+${Math.abs(saved)}% — asset pequeno, overhead de compressão)`,
    );
  }
  console.log(`  Triângulos:  ${after.triangles.toLocaleString('pt-BR')}`);
  console.log(`  Materiais:   ${after.materials}`);
  console.log(`  Texturas:    ${after.textures}`);
  console.log(`  Geometria:   ${geometryMethod}`);
  console.log(`  KTX2:        ${ktx2Note}`);
  console.log('');

  const budgetIssues = checkBudget(after);
  if (budgetIssues.length > 0) {
    warn('Orçamentos (Orcamento-de-Performance.md / Pipeline-de-Assets-3D.md):');
    for (const issue of budgetIssues) warn(`  - ${issue}`);
    warn('Os alvos acima são metas, não falha — revise o asset se estiver acima.');
  } else {
    log('Orçamentos dentro dos alvos (GLB ≤ 3 MB, triângulos ≤ 30k, materiais ≤ 10).');
  }
  log('GLB válido gerado — validação do glTF Validator passou.');
}

// ---------------------------------------------------------------------------
// Entry point.
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const [inputPath, outputPath] = args;

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(USAGE);
    process.exit(args.length === 0 ? 2 : 0);
  }
  if (!inputPath || !outputPath) {
    error('Argumentos insuficientes. Informe caminhos de entrada e saída.');
    console.log(USAGE);
    process.exit(2);
  }
  if (!fs.existsSync(inputPath)) {
    error(`Arquivo de entrada não encontrado: ${inputPath}`);
    process.exit(2);
  }
  if (path.extname(outputPath).toLowerCase() !== '.glb') {
    warn(`Extensão de saída "${path.extname(outputPath)}" não é .glb — o pipeline produz GLB binário.`);
  }

  try {
    await runPipeline(inputPath, outputPath);
  } catch (err) {
    error(`Pipeline falhou: ${err && err.message ? err.message : err}`);
    if (process.env.VOID_DEBUG === '1' && err && err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();
