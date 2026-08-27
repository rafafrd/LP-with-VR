#!/usr/bin/env node
/**
 * Gerador de modelos placeholder de óculos/headset em GLB — Task 7 (+ modelo Chrome).
 *
 * Gera 4 variantes com geometrias distintas e cores da paleta VOID:
 *   1. glasses-acid.glb    — Armação redonda clássica neon acid (#cfff04)
 *   2. glasses-violet.glb  — Armação hexagonal cyber neon violet (#8b5cf6)
 *   3. glasses-magenta.glb — Visor panorâmico / headset neon magenta (#ff2e6a)
 *   4. glasses-chrome.glb  — Wraparound cat-eye assimétrico Y2K, cromado (#d9dce3)
 *
 * Escala em METROS (largura ~14cm, compatível com WebXR e tracking facial da Task 8).
 * Após gerar o GLB bruto, roda automaticamente o pipeline scripts/optimize-glb.mjs (Task 3).
 *
 * Uso:
 *   node scripts/generate-placeholder-glasses.mjs
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// Polyfill de FileReader para Three.js GLTFExporter em ambiente Node
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class MockFileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      });
    }
    readAsDataURL(blob) {
      blob.arrayBuffer().then((buf) => {
        const base64 = Buffer.from(buf).toString("base64");
        this.result = `data:${blob.type || "application/octet-stream"};base64,${base64}`;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      });
    }
  };
}

import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const OUTPUT_DIR = path.resolve("public/models");
const OPTIMIZE_SCRIPT = path.resolve("scripts/optimize-glb.mjs");

/**
 * Cria a armação "Acid" (Redonda / Clássica Neon).
 * Largura total: ~14cm (0.14m).
 */
function createAcidGlasses() {
  const group = new THREE.Group();
  group.name = "Glasses_Acid";

  const frameMaterial = new THREE.MeshStandardMaterial({
    name: "Material_Acid_Frame",
    color: 0xcfff04,
    roughness: 0.25,
    metalness: 0.85,
  });

  const lensMaterial = new THREE.MeshStandardMaterial({
    name: "Material_Acid_Lens",
    color: 0x101014,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.7,
  });

  const templeMaterial = new THREE.MeshStandardMaterial({
    name: "Material_Acid_Temple",
    color: 0x1f2405,
    roughness: 0.4,
    metalness: 0.7,
  });

  // Lente Esquerda (Toro)
  const leftRimGeo = new THREE.TorusGeometry(0.024, 0.0022, 16, 48);
  const leftRim = new THREE.Mesh(leftRimGeo, frameMaterial);
  leftRim.position.set(-0.034, 0, 0);
  leftRim.name = "Rim_Left";
  group.add(leftRim);

  const leftLensGeo = new THREE.CylinderGeometry(0.023, 0.023, 0.001, 32);
  leftLensGeo.rotateX(Math.PI / 2);
  const leftLens = new THREE.Mesh(leftLensGeo, lensMaterial);
  leftLens.position.set(-0.034, 0, 0);
  leftLens.name = "Lens_Left";
  group.add(leftLens);

  // Lente Direita (Toro)
  const rightRimGeo = new THREE.TorusGeometry(0.024, 0.0022, 16, 48);
  const rightRim = new THREE.Mesh(rightRimGeo, frameMaterial);
  rightRim.position.set(0.034, 0, 0);
  rightRim.name = "Rim_Right";
  group.add(rightRim);

  const rightLensGeo = new THREE.CylinderGeometry(0.023, 0.023, 0.001, 32);
  rightLensGeo.rotateX(Math.PI / 2);
  const rightLens = new THREE.Mesh(rightLensGeo, lensMaterial);
  rightLens.position.set(0.034, 0, 0);
  rightLens.name = "Lens_Right";
  group.add(rightLens);

  // Ponte do nariz (Cilindro horizontal)
  const bridgeGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.02, 16);
  bridgeGeo.rotateZ(Math.PI / 2);
  const bridge = new THREE.Mesh(bridgeGeo, frameMaterial);
  bridge.position.set(0, 0.004, 0);
  bridge.name = "Bridge";
  group.add(bridge);

  // Hastes (Box fina estendendo para -Z)
  const templeLength = 0.12;
  const templeGeo = new THREE.BoxGeometry(0.0025, 0.004, templeLength);

  const leftTemple = new THREE.Mesh(templeGeo, templeMaterial);
  leftTemple.position.set(-0.059, 0.002, -templeLength / 2);
  leftTemple.name = "Temple_Left";
  group.add(leftTemple);

  const rightTemple = new THREE.Mesh(templeGeo, templeMaterial);
  rightTemple.position.set(0.059, 0.002, -templeLength / 2);
  rightTemple.name = "Temple_Right";
  group.add(rightTemple);

  // Ponteiras das hastes levemente inclinadas
  const tipGeo = new THREE.BoxGeometry(0.0025, 0.012, 0.015);
  tipGeo.rotateX(-Math.PI / 6);

  const leftTip = new THREE.Mesh(tipGeo, templeMaterial);
  leftTip.position.set(-0.059, -0.004, -templeLength + 0.005);
  leftTip.name = "Tip_Left";
  group.add(leftTip);

  const rightTip = new THREE.Mesh(tipGeo, templeMaterial);
  rightTip.position.set(0.059, -0.004, -templeLength + 0.005);
  rightTip.name = "Tip_Right";
  group.add(rightTip);

  return group;
}

/**
 * Cria a armação "Violet" (Hexagonal / Cyber Angular).
 * Largura total: ~14.4cm (0.144m).
 */
function createVioletGlasses() {
  const group = new THREE.Group();
  group.name = "Glasses_Violet";

  const frameMaterial = new THREE.MeshStandardMaterial({
    name: "Material_Violet_Frame",
    color: 0x8b5cf6,
    roughness: 0.3,
    metalness: 0.8,
  });

  const lensMaterial = new THREE.MeshStandardMaterial({
    name: "Material_Violet_Lens",
    color: 0x1f1035,
    roughness: 0.15,
    metalness: 0.3,
    transparent: true,
    opacity: 0.75,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    name: "Material_Violet_Accent",
    color: 0xd8b4fe,
    roughness: 0.2,
    metalness: 0.9,
  });

  // Aros hexagonais (Torus com 6 segmentos tubulares)
  const hexRimGeoLeft = new THREE.TorusGeometry(0.025, 0.0024, 12, 6);
  hexRimGeoLeft.rotateZ(Math.PI / 6);
  const leftRim = new THREE.Mesh(hexRimGeoLeft, frameMaterial);
  leftRim.position.set(-0.035, 0, 0);
  leftRim.name = "Hex_Rim_Left";
  group.add(leftRim);

  const leftLensGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.001, 6);
  leftLensGeo.rotateX(Math.PI / 2);
  leftLensGeo.rotateZ(Math.PI / 6);
  const leftLens = new THREE.Mesh(leftLensGeo, lensMaterial);
  leftLens.position.set(-0.035, 0, 0);
  leftLens.name = "Hex_Lens_Left";
  group.add(leftLens);

  const hexRimGeoRight = new THREE.TorusGeometry(0.025, 0.0024, 12, 6);
  hexRimGeoRight.rotateZ(Math.PI / 6);
  const rightRim = new THREE.Mesh(hexRimGeoRight, frameMaterial);
  rightRim.position.set(0.035, 0, 0);
  rightRim.name = "Hex_Rim_Right";
  group.add(rightRim);

  const rightLensGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.001, 6);
  rightLensGeo.rotateX(Math.PI / 2);
  rightLensGeo.rotateZ(Math.PI / 6);
  const rightLens = new THREE.Mesh(rightLensGeo, lensMaterial);
  rightLens.position.set(0.035, 0, 0);
  rightLens.name = "Hex_Lens_Right";
  group.add(rightLens);

  // Barra dupla superior (Top Brow Bar)
  const topBarGeo = new THREE.BoxGeometry(0.088, 0.002, 0.003);
  const topBar = new THREE.Mesh(topBarGeo, accentMaterial);
  topBar.position.set(0, 0.023, 0.001);
  topBar.name = "Top_Bar";
  group.add(topBar);

  // Ponte central
  const bridgeGeo = new THREE.BoxGeometry(0.018, 0.0025, 0.002);
  const bridge = new THREE.Mesh(bridgeGeo, frameMaterial);
  bridge.position.set(0, 0.005, 0);
  bridge.name = "Bridge";
  group.add(bridge);

  // Hastes angulares com detalhes cyber
  const templeLength = 0.12;
  const templeGeo = new THREE.BoxGeometry(0.003, 0.006, templeLength);

  const leftTemple = new THREE.Mesh(templeGeo, frameMaterial);
  leftTemple.position.set(-0.062, 0.005, -templeLength / 2);
  leftTemple.name = "Temple_Left";
  group.add(leftTemple);

  const rightTemple = new THREE.Mesh(templeGeo, frameMaterial);
  rightTemple.position.set(0.062, 0.005, -templeLength / 2);
  rightTemple.name = "Temple_Right";
  group.add(rightTemple);

  // Acentos laterais metálicos
  const badgeGeo = new THREE.BoxGeometry(0.004, 0.008, 0.015);
  const leftBadge = new THREE.Mesh(badgeGeo, accentMaterial);
  leftBadge.position.set(-0.062, 0.005, -0.015);
  leftBadge.name = "Badge_Left";
  group.add(leftBadge);

  const rightBadge = new THREE.Mesh(badgeGeo, accentMaterial);
  rightBadge.position.set(0.062, 0.005, -0.015);
  rightBadge.name = "Badge_Right";
  group.add(rightBadge);

  return group;
}

/**
 * Cria o modelo "Magenta" (Visor Headset / Cyberpunk Blade Runner).
 * Largura total: ~14.8cm (0.148m).
 */
function createMagentaHeadset() {
  const group = new THREE.Group();
  group.name = "Headset_Magenta";

  const visorMaterial = new THREE.MeshStandardMaterial({
    name: "Material_Magenta_Visor",
    color: 0xff2e6a,
    roughness: 0.1,
    metalness: 0.85,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });

  const frameMaterial = new THREE.MeshStandardMaterial({
    name: "Material_Magenta_Frame",
    color: 0x18181c,
    roughness: 0.35,
    metalness: 0.9,
    side: THREE.DoubleSide,
  });

  const glowMaterial = new THREE.MeshStandardMaterial({
    name: "Material_Magenta_Glow",
    color: 0xff2e6a,
    roughness: 0.2,
    metalness: 0.5,
    side: THREE.DoubleSide,
  });

  // Visor curvo frontal
  const visorRadius = 0.085;
  const visorAngle = Math.PI * 0.56; // ~100 graus
  // theta=0 aponta para +Z (frente/câmera) na convenção do CylinderGeometry;
  // centrar o arco em theta=0 (sem offset de Math.PI/2) deixa o meio do arco
  // no eixo frontal, com as pontas se abrindo simetricamente em -X/+X.
  const visorGeo = new THREE.CylinderGeometry(
    visorRadius,
    visorRadius,
    0.042,
    36,
    1,
    true,
    -visorAngle / 2,
    visorAngle,
  );
  const visor = new THREE.Mesh(visorGeo, visorMaterial);
  visor.position.set(0, 0, -visorRadius + 0.02);
  visor.name = "Visor_Shield";
  group.add(visor);

  // Barra de topo (Brow Frame curvo)
  const browGeo = new THREE.CylinderGeometry(
    visorRadius + 0.002,
    visorRadius + 0.002,
    0.004,
    36,
    1,
    true,
    -visorAngle / 2,
    visorAngle,
  );
  const brow = new THREE.Mesh(browGeo, frameMaterial);
  brow.position.set(0, 0.021, -visorRadius + 0.02);
  brow.name = "Brow_Frame";
  group.add(brow);

  // Faixa de LED magenta no topo
  const ledGeo = new THREE.CylinderGeometry(
    visorRadius + 0.003,
    visorRadius + 0.003,
    0.0015,
    36,
    1,
    true,
    -visorAngle / 2 + 0.1,
    visorAngle - 0.2,
  );
  const led = new THREE.Mesh(ledGeo, glowMaterial);
  led.position.set(0, 0.019, -visorRadius + 0.02);
  led.name = "LED_Strip";
  group.add(led);

  // Módulos laterais tipo headset cyberdeck
  const moduleGeo = new THREE.BoxGeometry(0.01, 0.036, 0.025);
  const leftModule = new THREE.Mesh(moduleGeo, frameMaterial);
  leftModule.position.set(-0.071, 0.002, -0.01);
  leftModule.name = "Module_Left";
  group.add(leftModule);

  const rightModule = new THREE.Mesh(moduleGeo, frameMaterial);
  rightModule.position.set(0.071, 0.002, -0.01);
  rightModule.name = "Module_Right";
  group.add(rightModule);

  // Acentos de luz nos módulos
  const lightGeo = new THREE.BoxGeometry(0.011, 0.004, 0.015);
  const leftLight = new THREE.Mesh(lightGeo, glowMaterial);
  leftLight.position.set(-0.071, 0.005, -0.01);
  leftLight.name = "Light_Left";
  group.add(leftLight);

  const rightLight = new THREE.Mesh(lightGeo, glowMaterial);
  rightLight.position.set(0.071, 0.005, -0.01);
  rightLight.name = "Light_Right";
  group.add(rightLight);

  // Hastes de sustentação do headset
  const armLength = 0.11;
  const armGeo = new THREE.BoxGeometry(0.004, 0.01, armLength);

  const leftArm = new THREE.Mesh(armGeo, frameMaterial);
  leftArm.position.set(-0.071, 0.002, -0.01 - armLength / 2);
  leftArm.name = "Arm_Left";
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, frameMaterial);
  rightArm.position.set(0.071, 0.002, -0.01 - armLength / 2);
  rightArm.name = "Arm_Right";
  group.add(rightArm);

  return group;
}

/**
 * Contorno (silhueta) da lente wraparound cat-eye do modelo "Chrome" — usado tanto
 * pela lente de vidro quanto como o furo (hole) do aro/frame ao redor dela.
 * `mirror` é 1 para o lado direito e -1 para o esquerdo (espelha só o X).
 */
function createShieldLensPath(mirror) {
  const path = new THREE.Path();
  path.moveTo(0.012 * mirror, -0.008);
  // barriga do cat-eye (desce e volta antes da haste subir)
  path.quadraticCurveTo(0.020 * mirror, -0.019, 0.030 * mirror, -0.015);
  // sobe reto até o cotovelo externo
  path.lineTo(0.053 * mirror, -0.005);
  // bico angular — a ponta que varre pra cima, a assinatura visual do design Y2K
  path.lineTo(0.067 * mirror, 0.021);
  // desce a borda de cima a partir da ponta
  path.lineTo(0.055 * mirror, 0.031);
  // topo curvo de volta até a ponte
  path.quadraticCurveTo(0.028 * mirror, 0.028, 0.013 * mirror, 0.021);
  // fecha o contorno junto ao nariz
  path.quadraticCurveTo(0.006 * mirror, 0.008, 0.012 * mirror, -0.008);
  return path;
}

/**
 * Cria o modelo "Chrome" (Wraparound Cat-Eye Assimétrico / Y2K Revival).
 * Largura total: ~14.4cm (0.144m).
 *
 * Geometria via THREE.Shape + ExtrudeGeometry (não primitivas) — a silhueta
 * assimétrica de lente única, com bico varrendo pra cima, não é possível com
 * torus/cylinder como os outros 3 modelos.
 */
function createChromeGlasses() {
  const group = new THREE.Group();
  group.name = "Glasses_Chrome";

  const frameMaterial = new THREE.MeshStandardMaterial({
    name: "Material_Chrome_Frame",
    color: 0xd9dce3,
    roughness: 0.15,
    metalness: 0.9,
    side: THREE.DoubleSide,
  });

  const lensMaterial = new THREE.MeshStandardMaterial({
    name: "Material_Chrome_Lens",
    color: 0x0a0a0d,
    roughness: 0.12,
    metalness: 0.25,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    name: "Material_Chrome_Accent",
    color: 0xf2f4f7,
    roughness: 0.08,
    metalness: 0.95,
    side: THREE.DoubleSide,
  });

  const lensExtrudeSettings = {
    depth: 0.0015,
    bevelEnabled: false,
    curveSegments: 12,
  };

  const frameExtrudeSettings = {
    depth: 0.006,
    bevelEnabled: true,
    bevelThickness: 0.0005,
    bevelSize: 0.0005,
    bevelSegments: 2,
    curveSegments: 12,
  };

  for (const [side, mirror] of [["Left", -1], ["Right", 1]]) {
    // Lente de vidro (preenchimento do contorno)
    const lensShape = new THREE.Shape(createShieldLensPath(mirror).getPoints(24));
    const lensGeo = new THREE.ExtrudeGeometry(lensShape, lensExtrudeSettings);
    lensGeo.translate(0, 0, -lensExtrudeSettings.depth / 2);
    const lens = new THREE.Mesh(lensGeo, lensMaterial);
    lens.name = `Lens_${side}`;
    group.add(lens);

    // Aro/frame: mesma silhueta um pouco maior por fora, com a lente como furo
    const frameOuter = new THREE.Shape();
    frameOuter.moveTo(0.009 * mirror, -0.010);
    frameOuter.quadraticCurveTo(0.018 * mirror, -0.023, 0.031 * mirror, -0.018);
    frameOuter.lineTo(0.056 * mirror, -0.007);
    frameOuter.lineTo(0.072 * mirror, 0.022);
    frameOuter.lineTo(0.058 * mirror, 0.034);
    frameOuter.quadraticCurveTo(0.029 * mirror, 0.031, 0.012 * mirror, 0.023);
    frameOuter.quadraticCurveTo(0.004 * mirror, 0.009, 0.009 * mirror, -0.010);
    frameOuter.holes.push(createShieldLensPath(mirror));

    const frameGeo = new THREE.ExtrudeGeometry(frameOuter, frameExtrudeSettings);
    frameGeo.translate(0, 0, -frameExtrudeSettings.depth / 2);
    const frame = new THREE.Mesh(frameGeo, frameMaterial);
    frame.name = `Shield_${side}`;
    group.add(frame);

    // Dobradiça (pequeno bloco cromado no cotovelo externo, onde a haste começa)
    const hingeGeo = new THREE.BoxGeometry(0.006, 0.009, 0.008);
    const hinge = new THREE.Mesh(hingeGeo, accentMaterial);
    hinge.position.set(0.070 * mirror, 0.019, 0);
    hinge.name = `Hinge_${side}`;
    group.add(hinge);

    // Haste chunky saindo da dobradiça, com ponteira levemente inclinada pro ouvido
    const templeLength = 0.115;
    const templeGeo = new THREE.BoxGeometry(0.005, 0.007, templeLength);
    const temple = new THREE.Mesh(templeGeo, frameMaterial);
    temple.position.set(0.072 * mirror, 0.015, -templeLength / 2);
    temple.name = `Temple_${side}`;
    group.add(temple);

    const tipGeo = new THREE.BoxGeometry(0.005, 0.014, 0.016);
    tipGeo.rotateX(-Math.PI / 6);
    const tip = new THREE.Mesh(tipGeo, frameMaterial);
    tip.position.set(0.072 * mirror, 0.006, -templeLength + 0.006);
    tip.name = `Tip_${side}`;
    group.add(tip);
  }

  // Ponte central: faixa horizontal com borda em zigue-zague — o encaixe
  // "interlocking" entre as duas lentes visível na foto de referência.
  const bridgeShape = new THREE.Shape();
  const bw = 0.013;
  const bh = 0.006;
  bridgeShape.moveTo(-bw, -bh / 2);
  bridgeShape.lineTo(-bw * 0.6, bh / 2);
  bridgeShape.lineTo(-bw * 0.2, -bh * 0.1);
  bridgeShape.lineTo(0, bh / 2);
  bridgeShape.lineTo(bw * 0.2, -bh * 0.1);
  bridgeShape.lineTo(bw * 0.6, bh / 2);
  bridgeShape.lineTo(bw, -bh / 2);
  bridgeShape.lineTo(-bw, -bh / 2);

  const bridgeExtrudeSettings = { depth: 0.005, bevelEnabled: false, curveSegments: 1 };
  const bridgeGeo = new THREE.ExtrudeGeometry(bridgeShape, bridgeExtrudeSettings);
  bridgeGeo.translate(0, 0, -bridgeExtrudeSettings.depth / 2);
  const bridge = new THREE.Mesh(bridgeGeo, accentMaterial);
  bridge.position.set(0, -0.009, 0);
  bridge.name = "Bridge_Zigzag";
  group.add(bridge);

  return group;
}

/**
 * Exporta uma THREE.Scene/THREE.Group para GLB bruto em buffer.
 */
function exportToGlb(object3D) {
  const scene = new THREE.Scene();
  scene.add(object3D);

  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(Buffer.from(result));
        } else if (result instanceof Uint8Array) {
          resolve(Buffer.from(result.buffer, result.byteOffset, result.byteLength));
        } else {
          reject(new Error("GLTFExporter não retornou buffer binário"));
        }
      },
      (error) => reject(error),
      { binary: true },
    );
  });
}

/**
 * Gera e otimiza um modelo pelo pipeline.
 */
async function buildAndOptimizeModel(name, factoryFn) {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), "glasses-raw-"));
  const rawGlbPath = path.join(tempDir, `${name}-raw.glb`);
  const finalGlbPath = path.join(OUTPUT_DIR, `${name}.glb`);

  try {
    console.log(`\n========================================`);
    console.log(`[gerador] Criando ${name}...`);
    const object3D = factoryFn();
    const glbBuffer = await exportToGlb(object3D);
    await fsp.writeFile(rawGlbPath, glbBuffer);
    console.log(`[gerador] GLB bruto exportado: ${(glbBuffer.byteLength / 1024).toFixed(1)} kB`);

    console.log(`[gerador] Executando optimize-glb.mjs para ${name}...`);
    const result = spawnSync("node", [OPTIMIZE_SCRIPT, rawGlbPath, finalGlbPath], {
      stdio: "inherit",
      windowsHide: true,
    });

    if (result.status !== 0) {
      throw new Error(`optimize-glb falhou para ${name} com status ${result.status}`);
    }

    console.log(`[gerador] ✓ ${name}.glb gerado e otimizado com sucesso em public/models/${name}.glb`);
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  await fsp.mkdir(OUTPUT_DIR, { recursive: true });

  const models = [
    { name: "glasses-acid", factory: createAcidGlasses },
    { name: "glasses-violet", factory: createVioletGlasses },
    { name: "glasses-magenta", factory: createMagentaHeadset },
    { name: "glasses-chrome", factory: createChromeGlasses },
  ];

  for (const model of models) {
    await buildAndOptimizeModel(model.name, model.factory);
  }

  console.log("\n========================================");
  console.log(`[gerador] Todos os ${models.length} modelos foram gerados e otimizados com sucesso!`);
}

main().catch((err) => {
  console.error("[gerador] Erro fatal:", err);
  process.exit(1);
});
