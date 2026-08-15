#!/usr/bin/env node
/**
 * Smoke test do Face Landmarker rodando EM NODE (fora de browser) — Task 6.
 *
 * Objetivo: provar que `FilesetResolver.forVisionTasks(...)` +
 * `FaceLandmarker.createFromOptions(...)` RESOLVEM sem erro com o runtime WASM e
 * o modelo hospedados localmente em `public/mediapipe/`. É a validação
 * obrigatória da Task 6, que não depende de câmera física.
 *
 * O pacote `@mediapipe/tasks-vision` assume um browser, mas conseguimos rodá-lo
 * em Node com três shims mínimos:
 *   1. `document.createElement("script")` + `body.appendChild` — o bundle
 *      carrega o glue WASM (vision_wasm_internal.js) injetando um <script>; o
 *      shim lê o arquivo e executa via `vm.runInThisContext`, o que expõe o
 *      `ModuleFactory` global esperado pelo bundle.
 *   2. `document.createElement("canvas")` — o construtor do task cria um canvas
 *      mesmo em delegate CPU; o shim devolve um stub com contexto 2D no-op.
 *   3. `fetch` para paths locais — o modelo é buscado via `fetch(modelAssetPath)`;
 *      o shim roteia paths de sistema para `fs.readFile` e repassa http(s) pro
 *      fetch nativo.
 *
 * O que NÃO é coberto por este script (e por quê):
 *   - Detecção contra um rosto real: exige um ImageSource do browser
 *     (video/canvas/ImageBitmap) e uma imagem de rosto licenciada — esta máquina
 *     não tem câmera e não devemos baixar foto de rosto por conta própria. A
 *     validação "detect() devolve landmarks/matriz de um rosto real" fica
 *     pendente de validação em browser real (registrado no relatório da Task 6).
 *   - GPU delegate: só existe em browser.
 *
 * Uso:
 *   npm run assets:smoke-mediapipe
 */

import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mediapipeDir = path.join(repoRoot, "public", "mediapipe");
const modelPath = path.join(mediapipeDir, "face_landmarker.task");

// ---------------------------------------------------------------------------
// Shims mínimos de browser
// ---------------------------------------------------------------------------

// WebGL falso: o GraphRunner do MediaPipe inicializa um contexto WebGL mesmo
// com `delegate: "CPU"` (o pipeline de imagem move frames por texturas GL).
// Não queremos instanciar WebGL de verdade em Node — o Proxy abaixo dá um
// contexto "suficiente" para a inicialização do graph terminar: métodos virando
// no-op, e valores canônicos para as consultas que o C++ lê.
class FakeWebGLRenderingContext {}

const webglExtName =
  "WEBGL_lose_context,EXT_disjoint_timer_query,WEBGL_draw_buffers,OES_vertex_array_object,ANGLE_instanced_arrays";

function makeFakeWebGL() {
  let nextId = 1;
  const factoryCalls = new Set([
    "createShader",
    "createProgram",
    "createTexture",
    "createBuffer",
    "createFramebuffer",
    "createRenderbuffer",
    "createVertexArray",
    "createQuery",
  ]);
  const returnsOne = new Set([
    "getShaderParameter",
    "getProgramParameter",
    "getFramebufferAttachmentParameter",
  ]);
  return new Proxy(
    { canvas: { width: 0, height: 0, style: {} } },
    {
      get(target, prop) {
        if (prop === "canvas") return target.canvas;
        if (prop === "getParameter") return () => 16384;
        if (prop === "getExtension") return () => null;
        if (prop === "getSupportedExtensions") return () => [];
        if (prop === "getShaderParameter") return () => 1;
        if (prop === "getProgramParameter") return () => 1;
        if (prop === "getError") return () => 0;
        if (prop === "getUniformLocation") return () => 1;
        if (prop === "getAttribLocation") return () => 0;
        if (prop === "getString") return () => 0;
        if (prop === "isContextLost") return () => false;
        if (prop === "getContextAttributes") return () => ({});
        if (prop === "getBufferParameter") return () => 0;
        if (prop === "getRenderbufferParameter") return () => 0;
        if (prop === "getTexParameter") return () => 0;
        if (prop === "checkFramebufferStatus") return () => 36053;
        if (prop === "getShaderPrecisionFormat") {
          return () => ({ rangeMin: 1, rangeMax: 1, precision: 1 });
        }
        if (factoryCalls.has(prop)) return () => nextId++;
        if (returnsOne.has(prop)) return () => 1;
        return () => undefined;
      },
    },
  );
}

function makeScriptElement() {
  const el = {
    src: "",
    crossOrigin: null,
    _listeners: {},
    addEventListener(type, cb) {
      (this._listeners[type] ??= []).push(cb);
    },
  };
  return el;
}

function makeCanvasElement() {
  const fakeGl = makeFakeWebGL();
  return {
    width: 0,
    height: 0,
    getContext(kind) {
      if (kind === "webgl" || kind === "webgl2" || kind === "experimental-webgl") {
        return fakeGl;
      }
      return {
        drawImage() {},
        clearRect() {},
        fillRect() {},
        getImageData: () => ({ data: new Uint8ClampedArray(0), width: 0, height: 0 }),
      };
    },
  };
}

const originalFetch = globalThis.fetch;

globalThis.document = {
  createElement(tag) {
    if (tag === "script") return makeScriptElement();
    if (tag === "canvas") return makeCanvasElement();
    throw new Error(`createElement("${tag}") não suportado no smoke test`);
  },
  body: {
    async appendChild(el) {
      const code = await fs.readFile(el.src, "utf-8");
      vm.runInThisContext(code, { filename: el.src });
      for (const cb of el._listeners.load ?? []) cb();
    },
  },
};

globalThis.self = globalThis;

// O `fixedGetContext` do glue valida o retorno com `instanceof
// WebGLRenderingContext` — apontamos ambos os tipos para a classe fake.
globalThis.WebGLRenderingContext = FakeWebGLRenderingContext;
globalThis.WebGL2RenderingContext = FakeWebGLRenderingContext;

// O glue WASM do Emscripten detecta o ambiente Node e chama `require("fs")`
// para ler o .wasm do disco. Como rodamos em ESM (sem `require` no escopo),
// expomos um `require` global baseado no caminho deste script.
globalThis.require ??= createRequire(import.meta.url);
// Mesmo motivo do `require`: o glue Node do Emscripten referencia `__dirname`
// para localizar o .wasm; no ESM ele não existe, então apontamos para a pasta
// onde os binários foram sincronizados.
globalThis.__dirname ??= mediapipeDir;

globalThis.fetch = async (input) => {
  const url = String(input);
  if (/^https?:\/\//i.test(url)) return originalFetch(url);
  const filePath = path.resolve(url);
  try {
    const buf = await fs.readFile(filePath);
    const bytes = new Uint8Array(buf);
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      arrayBuffer: () => bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ),
      text: () => bytes.toString("utf-8"),
    };
  } catch (err) {
    return {
      ok: false,
      status: 404,
      statusText: err.message,
      headers: new Headers(),
      arrayBuffer: () => new ArrayBuffer(0),
      text: () => "",
    };
  }
};

// ---------------------------------------------------------------------------
// Smoke test
// ---------------------------------------------------------------------------

async function assert(condition, message) {
  if (!condition) {
    throw new Error(`FALHOU: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function main() {
  console.log("smoke test MediaPipe (Node):\n");

  for (const file of [
    "vision_wasm_internal.js",
    "vision_wasm_internal.wasm",
    "vision_wasm_nosimd_internal.js",
    "vision_wasm_nosimd_internal.wasm",
    "face_landmarker.task",
  ]) {
    const stat = await fs.stat(path.join(mediapipeDir, file));
    await assert(stat.size > 0, `public/mediapipe/${file} existe (${stat.size.toLocaleString("pt-BR")} B)`);
  }

  const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

  const wasmFileset = await FilesetResolver.forVisionTasks(mediapipeDir);
  await assert(
    wasmFileset.wasmLoaderPath?.endsWith("vision_wasm_internal.js"),
    `FilesetResolver.forVisionTasks → ${wasmFileset.wasmLoaderPath}`,
  );

  const started = Date.now();
  const landmarker = await FaceLandmarker.createFromOptions(wasmFileset, {
    baseOptions: {
      modelAssetPath: modelPath,
      delegate: "CPU",
    },
    runningMode: "IMAGE",
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: true,
  });

  await assert(Boolean(landmarker), "FaceLandmarker.createFromOptions resolveu");
  await assert(
    typeof landmarker.detectForVideo === "function" && typeof landmarker.detect === "function",
    "landmarker expõe detect() e detectForVideo()",
  );

  // Roda a inferência de verdade contra um frame em branco: o caminho completo
  // (graph + TFLite CPU) executa e devolve um resultado bem-formado sem rosto —
  // é o que o loop de detecção faz por frame. Não usamos imagem de rosto aqui
  // (sem câmera nesta máquina e sem fonte licenciada à mão); a validação de
  // detecção contra um rosto real fica registrada como pendente no relatório.
  const blankFrame = { width: 64, height: 64 };
  const result = landmarker.detect(blankFrame);
  await assert(
    result.faceLandmarks.length === 0 && result.facialTransformationMatrixes.length === 0,
    "detect() em frame em branco executa a inferência e devolve 0 rostos / 0 matrizes",
  );

  landmarker.close();
  console.log(`\nFace Landmarker criado, detect() executado e fechado com sucesso em ${Date.now() - started} ms (WASM + modelo locais em public/mediapipe/).`);
}

main().catch((err) => {
  console.error(`\n[erro] Smoke test falhou: ${err && err.stack ? err.stack : err}`);
  process.exit(1);
});
